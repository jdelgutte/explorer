//! System Trash / Recycle Bin: path, info (count/size), and empty.

use serde::Serialize;

#[cfg(target_os = "macos")]
use walkdir::WalkDir;

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

#[derive(Debug, Serialize)]
pub struct TrashInfo {
    pub item_count: u64,
    pub total_size_bytes: u64,
    /// True on Linux/Windows (trash crate restore_all); false on macOS.
    pub restore_available: bool,
}

/// Returns the number of items in the trash and their total size in bytes.
/// On Linux/Windows uses the trash crate; on macOS walks the trash directory.
#[tauri::command]
pub fn get_trash_info() -> Result<TrashInfo, String> {
    #[cfg(any(target_os = "linux", target_os = "windows"))]
    {
        use trash::os_limited::{list, metadata};

        let items = list().map_err(|e| e.to_string())?;
        let count = items.len() as u64;
        let mut total_bytes: u64 = 0;
        for item in &items {
            if let Ok(m) = metadata(item) {
                total_bytes += m.size.size().unwrap_or(0);
            }
        }
        Ok(TrashInfo {
            item_count: count,
            total_size_bytes: total_bytes,
            restore_available: true,
        })
    }

    #[cfg(target_os = "macos")]
    {
        let trash_dir = get_trash_dir()?;
        let mut item_count: u64 = 0;
        let mut total_size_bytes: u64 = 0;
        for entry in WalkDir::new(&trash_dir).into_iter().filter_map(|e| e.ok()) {
            if entry.depth() == 0 {
                continue; // skip root
            }
            item_count += 1;
            if entry.path().is_file() {
                total_size_bytes += std::fs::metadata(entry.path()).map(|m| m.len()).unwrap_or(0);
            }
        }
        Ok(TrashInfo {
            item_count,
            total_size_bytes,
            restore_available: false,
        })
    }

    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    {
        Err("Trash is not supported on this platform".to_string())
    }
}

/// Moves the given paths to the system trash (creates .trashinfo on Linux, proper Recycle Bin on Windows).
#[tauri::command]
pub fn move_to_trash(paths: Vec<String>) -> Result<(), String> {
    trash::delete_all(paths).map_err(|e| e.to_string())?;
    Ok(())
}

/// Restores the given trash items. `ids` are the filenames as shown in the trash directory
/// (Trash/files on Linux — same as basename of the .trashinfo without extension).
/// When several items share the same original path (twins), only the most recently deleted one
/// is restored to avoid RestoreTwins errors.
#[tauri::command]
pub fn restore_trash_items(ids: Vec<String>) -> Result<(), String> {
    #[cfg(any(target_os = "linux", target_os = "windows"))]
    {
        use std::collections::HashMap;
        use std::path::Path;
        use trash::os_limited::{list, restore_all};

        let items = list().map_err(|e| e.to_string())?;
        let matched: Vec<_> = items
            .into_iter()
            .filter(|item| {
                // On Linux, item.id is the full path to the .trashinfo file; the filename in
                // Trash/files has the same basename (e.g. info/test.2.trashinfo -> files/test.2).
                let id_basename = Path::new(&item.id)
                    .file_stem()
                    .map(|s| s.to_string_lossy())
                    .unwrap_or_default();
                let name = item.name.to_string_lossy();
                ids.iter().any(|s| {
                    id_basename == s.as_str() || name == s.as_str()
                })
            })
            .collect();

        // Deduplicate by original_path: keep only the most recently deleted (max time_deleted).
        let mut by_path: HashMap<std::path::PathBuf, trash::TrashItem> = HashMap::new();
        for item in matched {
            let path = item.original_path();
            let keep = match by_path.get(&path) {
                None => true,
                Some(existing) => item.time_deleted > existing.time_deleted,
            };
            if keep {
                let _ = by_path.insert(path, item);
            }
        }
        let to_restore: Vec<_> = by_path.into_values().collect();
        restore_all(to_restore).map_err(|e| e.to_string())?;
        Ok(())
    }

    #[cfg(target_os = "macos")]
    {
        let _ = ids;
        Err("Restore is not supported on macOS".to_string())
    }

    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    {
        let _ = ids;
        Err("Trash is not supported on this platform".to_string())
    }
}

/// Permanently deletes all items in the trash.
/// On Linux/Windows uses the trash crate; on macOS walks and removes files/dirs.
#[tauri::command]
pub fn empty_trash() -> Result<(), String> {
    #[cfg(any(target_os = "linux", target_os = "windows"))]
    {
        use trash::os_limited::{list, purge_all};

        let items = list().map_err(|e| e.to_string())?;
        purge_all(items).map_err(|e| e.to_string())?;
        Ok(())
    }

    #[cfg(target_os = "macos")]
    {
        let trash_dir = get_trash_dir()?;
        let trash_path = std::path::Path::new(&trash_dir);
        if !trash_path.exists() {
            return Ok(());
        }
        let entries: Vec<_> = std::fs::read_dir(trash_path).map_err(|e| e.to_string())?.collect();
        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            if path.is_dir() {
                std::fs::remove_dir_all(&path).map_err(|e| e.to_string())?;
            } else {
                std::fs::remove_file(&path).map_err(|e| e.to_string())?;
            }
        }
        Ok(())
    }

    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    {
        Err("Trash is not supported on this platform".to_string())
    }
}
