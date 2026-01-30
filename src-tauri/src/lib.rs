// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Returns the path to the system Trash / Recycle Bin directory.
/// - Linux (XDG): `$HOME/.local/share/Trash/files`
/// - macOS: `$HOME/.Trash`
/// - Windows: `%SYSTEMDRIVE%\$Recycle.Bin`
#[tauri::command]
fn get_trash_dir() -> Result<String, String> {
    #[cfg(target_os = "linux")]
    {
        let home = std::env::var_os("HOME")
            .and_then(|h| h.into_string().ok())
            .ok_or_else(|| "HOME not set".to_string())?;
        Ok(format!("{}/.local/share/Trash/files", home))
    }

    #[cfg(target_os = "macos")]
    {
        let home = std::env::var_os("HOME")
            .and_then(|h| h.into_string().ok())
            .ok_or_else(|| "HOME not set".to_string())?;
        Ok(format!("{}/.Trash", home))
    }

    #[cfg(target_os = "windows")]
    {
        let drive = std::env::var("SYSTEMDRIVE").unwrap_or_else(|_| "C:".to_string());
        Ok(format!("{}\\$Recycle.Bin", drive))
    }

    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    {
        Err("Trash directory is not supported on this platform".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_trash_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
