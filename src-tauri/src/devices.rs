//! Mountable devices (disks/volumes) for the sidebar.

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

/// Event name emitted when the list of mountable devices changes (e.g. USB plugged/unplugged).
pub const MOUNTABLE_DEVICES_CHANGED: &str = "mountable-devices-changed";

/// Poll interval in seconds for checking disk list changes.
pub const DEVICES_POLL_INTERVAL_SECS: u64 = 3;

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

/// Fetches the current list of physical disks (one entry per disk, not per partition).
pub fn fetch_mountable_devices() -> Vec<MountableDevice> {
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

/// Returns the list of physical disks (one entry per disk, not per partition).
#[tauri::command]
pub fn get_mountable_devices() -> Vec<MountableDevice> {
    fetch_mountable_devices()
}
