//! In-memory LRU cache for image and PDF thumbnails.
//! Key = canonical path + mtime so entries are invalidated when the file changes.

use std::collections::{HashMap, VecDeque};
use std::path::PathBuf;
use std::sync::RwLock;

use sha2::{Digest, Sha256};

const MAX_ENTRIES: usize = 200;

/// Simple in-memory + on-disk cache for thumbnails.
/// In-memory part is an LRU of at most MAX_ENTRIES.
/// On-disk part stores each value as a small text file whose name is a hash of the cache key.
pub struct ThumbnailCache {
    order: RwLock<VecDeque<String>>,
    entries: RwLock<HashMap<String, String>>,
    /// Optional root directory on disk where thumbnails are persisted.
    /// When `None`, the cache behaves purely in-memory (previous behaviour).
    disk_dir: Option<PathBuf>,
}

impl ThumbnailCache {
    /// Creates a purely in-memory cache (no disk persistence).
    pub fn new() -> Self {
        Self {
            order: RwLock::new(VecDeque::new()),
            entries: RwLock::new(HashMap::new()),
            disk_dir: None,
        }
    }

    /// Creates a cache that also persists entries to the given directory on disk.
    pub fn with_disk_dir(disk_dir: PathBuf) -> Self {
        Self {
            order: RwLock::new(VecDeque::new()),
            entries: RwLock::new(HashMap::new()),
            disk_dir: Some(disk_dir),
        }
    }

    /// Returns a cached value from memory if available.
    pub fn get(&self, key: &str) -> Option<String> {
        self.entries.read().ok()?.get(key).cloned()
    }

    /// Inserts a value into the in-memory LRU cache only.
    pub fn insert(&self, key: String, value: String) {
        let mut order = match self.order.write() {
            Ok(g) => g,
            Err(_) => return,
        };
        let mut entries = match self.entries.write() {
            Ok(g) => g,
            Err(_) => return,
        };
        if entries.contains_key(&key) {
            entries.insert(key, value);
            return;
        }
        while order.len() >= MAX_ENTRIES {
            if let Some(old_key) = order.pop_front() {
                entries.remove(&old_key);
            } else {
                break;
            }
        }
        order.push_back(key.clone());
        entries.insert(key, value);
    }

    /// Computes the on-disk path for a given key, if disk persistence is enabled.
    fn disk_path_for_key(&self, key: &str) -> Option<PathBuf> {
        let dir = self.disk_dir.as_ref()?;
        let mut hasher = Sha256::new();
        hasher.update(key.as_bytes());
        let hash = hasher.finalize();
        // One file per key; extension is arbitrary since we store plain text.
        let filename = format!("{:x}.cache", hash);
        Some(dir.join(filename))
    }

    /// Returns a cached value, first checking memory, then disk (and populating memory if found).
    pub fn get_or_load(&self, key: &str) -> Option<String> {
        if let Some(v) = self.get(key) {
            return Some(v);
        }
        let path = self.disk_path_for_key(key)?;
        let contents = std::fs::read_to_string(path).ok()?;
        // Best-effort insert into memory; failures are ignored.
        self.insert(key.to_string(), contents.clone());
        Some(contents)
    }

    /// Inserts a value into memory and, if configured, persists it to disk.
    pub fn insert_and_persist(&self, key: String, value: String) {
        self.insert(key.clone(), value.clone());

        if let Some(path) = self.disk_path_for_key(&key) {
            // Ignore IO errors; they should not break the app.
            if let Some(parent) = path.parent() {
                let _ = std::fs::create_dir_all(parent);
            }
            let _ = std::fs::write(path, value);
        }
    }
}

impl Default for ThumbnailCache {
    fn default() -> Self {
        Self::new()
    }
}
