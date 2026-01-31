use std::collections::HashMap;

use serde::Serialize;
use sysinfo::Disks;

/// Represents a mountable device (disk/volume) for the sidebar.
#[derive(Debug, Serialize)]
pub struct MountableDevice {
    /// Display name (e.g. device name or volume label).
    pub name: String,
    /// Mount point path (e.g. "/" or "C:").
    pub mount_point: String,
    /// File system type (e.g. "ext4", "NTFS").
    pub file_system: String,
    /// Total space in bytes.
    pub total_space: u64,
    /// Available space in bytes.
    pub available_space: u64,
    /// True if the device is removable (e.g. USB drive).
    pub is_removable: bool,
}

/// Extracts the physical disk id from a device name (e.g. "sda1" -> "sda", "nvme0n1p1" -> "nvme0n1", "disk0s1" -> "disk0").
fn physical_disk_id(name: &str) -> String {
    let name = name.trim().strip_prefix("/dev/").unwrap_or(name.trim());
    if name.is_empty() {
        return name.to_string();
    }
    // macOS style: disk0s1 -> disk0 (strip trailing "s" + digits)
    if let Some(s_pos) = name.rfind('s') {
        let suffix = &name[s_pos + 1..];
        if !suffix.is_empty() && suffix.chars().all(|c| c.is_ascii_digit()) {
            return name[..s_pos].to_string();
        }
    }
    // NVMe / mmcblk style: nvme0n1p1 -> nvme0n1, mmcblk0p1 -> mmcblk0 (strip trailing "p" + digits)
    if let Some(p_pos) = name.rfind('p') {
        let suffix = &name[p_pos + 1..];
        if !suffix.is_empty() && suffix.chars().all(|c| c.is_ascii_digit()) {
            return name[..p_pos].to_string();
        }
    }
    // SCSI/SATA style: sda1 -> sda (strip trailing digits only)
    let trimmed = name.trim_end_matches(|c: char| c.is_ascii_digit());
    trimmed.to_string()
}

/// Returns the list of physical disks (one entry per disk, not per partition).
/// Partitions are grouped by physical device; the main partition (largest by total_space) is used for the mount point.
#[tauri::command]
fn get_mountable_devices() -> Vec<MountableDevice> {
    let disks = Disks::new_with_refreshed_list();
    let mut by_disk: HashMap<String, Vec<MountableDevice>> = HashMap::new();
    for disk in disks.list().iter() {
        let entry = MountableDevice {
            name: disk.name().to_string_lossy().into_owned(),
            mount_point: disk.mount_point().to_string_lossy().into_owned(),
            file_system: disk.file_system().to_string_lossy().into_owned(),
            total_space: disk.total_space(),
            available_space: disk.available_space(),
            is_removable: disk.is_removable(),
        };
        let id = physical_disk_id(&entry.name);
        by_disk.entry(id).or_default().push(entry);
    }
    by_disk
        .into_values()
        .map(|partitions| {
            let best = partitions
                .into_iter()
                .max_by_key(|p| p.total_space)
                .expect("at least one partition per disk");
            MountableDevice {
                name: physical_disk_id(&best.name),
                ..best
            }
        })
        .collect()
}

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
        .invoke_handler(tauri::generate_handler![greet, get_trash_dir, get_mountable_devices])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
