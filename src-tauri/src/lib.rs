//! Explorer Tauri application — lib entry and app wiring.

mod devices;
mod image_thumbnail;
mod pdf_thumbnail;
mod search;
mod thumbnail_cache;
mod trash;

use tauri::{Emitter, Manager};

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
        ])
        .setup(|app| {
            let pdfium = pdf_thumbnail::init_pdfium_for_app();
            app.manage(pdf_thumbnail::PdfiumState(pdfium));
            app.manage(thumbnail_cache::ThumbnailCache::default());
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
