//! Open the system default terminal at a given directory.

use std::path::Path;
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
