//! System Trash / Recycle Bin path.

/// Returns the path to the system Trash / Recycle Bin directory.
/// - Linux (XDG): `$HOME/.local/share/Trash/files`
/// - macOS: `$HOME/.Trash`
/// - Windows: `%SYSTEMDRIVE%\$Recycle.Bin`
#[tauri::command]
pub fn get_trash_dir() -> Result<String, String> {
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
