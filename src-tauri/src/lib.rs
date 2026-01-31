//! Explorer Tauri application — lib entry and app wiring.

mod devices;
mod trash;

use tauri::{Emitter, Manager};

<<<<<<< HEAD
=======
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

>>>>>>> da157805c9550169f5890d320e9e40851dfd5b8a
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
<<<<<<< HEAD
=======
            greet,
>>>>>>> da157805c9550169f5890d320e9e40851dfd5b8a
            trash::get_trash_dir,
            devices::get_mountable_devices,
        ])
        .setup(|app| {
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
