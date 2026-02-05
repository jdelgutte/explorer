//! Open the system default terminal at a given directory.

use std::env;
use std::path::{Path, PathBuf};
use std::process::Command;

/// Opens the system terminal with the given path as working directory.
/// - Linux: tries gnome-terminal, konsole, xfce4-terminal, then xterm.
/// - macOS: opens Terminal.app at the path.
/// - Windows: uses wt (Windows Terminal) if available, else cmd.
#[tauri::command]
pub fn open_in_terminal(path: String) -> Result<(), String> {
    let path = Path::new(&path);
    if !path.exists() {
        return Err(format!("Path does not exist: {}", path.display()));
    }
    if !path.is_dir() {
        return Err("Path must be a directory".to_string());
    }

    #[cfg(target_os = "linux")]
    open_linux(path)?;

    #[cfg(target_os = "macos")]
    open_macos(path)?;

    #[cfg(target_os = "windows")]
    open_windows(path)?;

    Ok(())
}

#[cfg(target_os = "linux")]
fn open_linux(path: &Path) -> Result<(), String> {
    let path_str = path.to_string_lossy();
    let try_spawn = |bin: &str, args: &[&str]| -> Option<std::process::Child> {
        Command::new(bin).args(args).spawn().ok()
    };
    if let Some(mut c) = try_spawn("gnome-terminal", &["--working-directory", path_str.as_ref()]) {
        let _ = c.wait();
        return Ok(());
    }
    if let Some(mut c) = try_spawn("konsole", &["--workdir", path_str.as_ref()]) {
        let _ = c.wait();
        return Ok(());
    }
    if let Some(mut c) = try_spawn("xfce4-terminal", &["--working-directory", path_str.as_ref()]) {
        let _ = c.wait();
        return Ok(());
    }
    let xterm_cmd = format!("cd {} && exec $SHELL", path_str.replace('"', "\\\""));
    if let Some(mut c) = try_spawn("xterm", &["-e", "bash", "-c", &xterm_cmd]) {
        let _ = c.wait();
        return Ok(());
    }
    Err("No supported terminal found (tried gnome-terminal, konsole, xfce4-terminal, xterm)".to_string())
}

#[cfg(target_os = "macos")]
fn open_macos(path: &Path) -> Result<(), String> {
    Command::new("open")
        .args(["-a", "Terminal.app", path])
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(target_os = "windows")]
fn open_windows(path: &Path) -> Result<(), String> {
    let path_str = path.to_string_lossy();
    if Command::new("wt")
        .args(["-d", path_str.as_ref()])
        .spawn()
        .is_ok()
    {
        return Ok(());
    }
    Command::new("cmd")
        .args(["/c", "start", "cmd", "/k", "cd", "/d", path_str.as_ref()])
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Sets this app as the default file manager (handler for opening folders).
/// - Linux: writes a .desktop file to ~/.local/share/applications (so it exists
///   when not installed via .deb) then runs xdg-mime default.
/// - Windows/macOS: returns an error (not implemented).
#[tauri::command]
pub fn set_default_file_manager() -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        ensure_desktop_file_in_user_apps()?;
        let desktop_file = "com.jdelgutte.explorer.desktop";
        let status = Command::new("xdg-mime")
            .args(["default", desktop_file, "inode/directory"])
            .status()
            .map_err(|e| e.to_string())?;
        if status.success() {
            Ok(())
        } else {
            Err(format!(
                "xdg-mime exited with code {:?}",
                status.code().unwrap_or(-1)
            ))
        }
    }

    #[cfg(not(target_os = "linux"))]
    {
        let _ = ();
        Err("Set as default file manager is only supported on Linux.".to_string())
    }
}

#[cfg(target_os = "linux")]
fn ensure_desktop_file_in_user_apps() -> Result<(), String> {
    let exe = env::current_exe().map_err(|e| format!("current exe: {}", e))?;
    let applications_dir = user_applications_dir()?;
    std::fs::create_dir_all(&applications_dir)
        .map_err(|e| format!("create applications dir: {}", e))?;
    let desktop_path = applications_dir.join("com.jdelgutte.explorer.desktop");
    // Escape Exec path: desktop spec says to use double quotes and escape \ and "
    let exe_display = exe.display().to_string();
    let exe_escaped = exe_display.replace('\\', "\\\\").replace('"', "\\\"");
    let content = format!(
        "[Desktop Entry]\n\
         Type=Application\n\
         Name=Explorer\n\
         Comment=File manager\n\
         Exec=\"{}\" %u\n\
         MimeType=inode/directory\n\
         Categories=System;FileTools;FileManager;\n",
        exe_escaped
    );
    std::fs::write(&desktop_path, content).map_err(|e| format!("write desktop file: {}", e))?;
    Ok(())
}

#[cfg(target_os = "linux")]
fn user_applications_dir() -> Result<PathBuf, String> {
    let base = env::var_os("XDG_DATA_HOME")
        .map(PathBuf::from)
        .or_else(|| {
            env::var_os("HOME").map(|h| PathBuf::from(h).join(".local").join("share"))
        })
        .ok_or("XDG_DATA_HOME and HOME are not set")?;
    Ok(base.join("applications"))
}

/// Resets the default file manager to a common system file manager (e.g. Nautilus, Nemo, Dolphin).
/// Tries known .desktop ids in order; the first one that succeeds wins.
#[tauri::command]
pub fn reset_default_file_manager() -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        let candidates = [
            "nautilus.desktop",
            "org.gnome.Nautilus.desktop",
            "nemo.desktop",
            "dolphin.desktop",
            "thunar.desktop",
            "pcmanfm.desktop",
        ];
        for desktop_file in &candidates {
            let status = Command::new("xdg-mime")
                .args(["default", desktop_file, "inode/directory"])
                .status();
            if let Ok(s) = status {
                if s.success() {
                    return Ok(());
                }
            }
        }
        Err("Could not reset: no known file manager found (tried nautilus, nemo, dolphin, thunar, pcmanfm).".to_string())
    }

    #[cfg(not(target_os = "linux"))]
    {
        let _ = ();
        Err("Reset default file manager is only supported on Linux.".to_string())
    }
}
