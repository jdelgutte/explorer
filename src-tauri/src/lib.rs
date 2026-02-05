//! Explorer Tauri application — lib entry and app wiring.

mod devices;
mod image_thumbnail;
mod pdf_thumbnail;
mod search;
mod shell;
mod thumbnail_cache;
mod trash;

use std::sync::Mutex;
use tauri::{path::BaseDirectory, Emitter, Manager};

/// Holds the initial folder path passed on the command line (e.g. when opened as default file manager).
/// Consumed once by the frontend via get_initial_folder.
pub struct InitialFolderState(pub Mutex<Option<String>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            trash::get_trash_dir,
            trash::get_trash_info,
            trash::empty_trash,
            trash::restore_trash_items,
            trash::move_to_trash,
            devices::get_mountable_devices,
            pdf_thumbnail::pdf_thumbnail,
            image_thumbnail::image_thumbnail,
            search::start_search,
            search::cancel_search,
            shell::open_in_terminal,
            shell::set_default_file_manager,
            shell::reset_default_file_manager,
            shell::get_initial_folder,
        ])
        .setup(|app| {
            let initial_folder = parse_initial_folder_from_args();
            app.manage(InitialFolderState(Mutex::new(initial_folder)));

            let pdfium = pdf_thumbnail::init_pdfium_for_app();
            app.manage(pdf_thumbnail::PdfiumState(pdfium));

            // Try to resolve an on-disk cache dir for thumbnails. If anything fails,
            // we fall back to the previous purely in-memory cache behaviour.
            let thumb_cache = app
                .path()
                .resolve("thumbnails", BaseDirectory::AppCache)
                .ok()
                .map(|dir| {
                    // Best-effort directory creation; ignore errors.
                    let _ = std::fs::create_dir_all(&dir);
                    thumbnail_cache::ThumbnailCache::with_disk_dir(dir)
                })
                .unwrap_or_else(thumbnail_cache::ThumbnailCache::new);
            app.manage(thumb_cache);

            app.manage(search::SearchState::default());

            let app_handle = app.app_handle().clone();
            std::thread::spawn(move || {
                let mut last_mount_points: Vec<String> = Vec::new();
                loop {
                    let devs = devices::fetch_mountable_devices();
                    let mount_points: Vec<String> = devs.iter().map(|d| d.mount_point.clone()).collect();
                    if mount_points != last_mount_points {
                        last_mount_points = mount_points;
                        let _ = app_handle.emit(devices::MOUNTABLE_DEVICES_CHANGED, &devs);
                    }
                    std::thread::sleep(std::time::Duration::from_secs(
                        devices::DEVICES_POLL_INTERVAL_SECS,
                    ));
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Parses the first valid directory path from process arguments (e.g. when launched as default file manager).
/// Accepts a single path or a file:// URL; returns canonical path if it exists and is a directory.
fn parse_initial_folder_from_args() -> Option<String> {
    let args: Vec<String> = std::env::args().skip(1).collect();
    for arg in args {
        let path_str = arg.trim();
        if path_str.is_empty() {
            continue;
        }
        // Strip file:// prefix (e.g. file:///home/user/folder)
        let path_str = path_str
            .strip_prefix("file://")
            .unwrap_or(path_str)
            .trim();
        if path_str.is_empty() {
            continue;
        }
        let path = std::path::Path::new(path_str);
        if let Ok(canon) = path.canonicalize() {
            if canon.is_dir() {
                return Some(canon.to_string_lossy().into_owned());
            }
        }
    }
    None
}
