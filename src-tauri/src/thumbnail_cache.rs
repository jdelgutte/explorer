//! In-memory LRU cache for image and PDF thumbnails.
//! Key = canonical path + mtime so entries are invalidated when the file changes.

use std::collections::{HashMap, VecDeque};
use std::sync::RwLock;

const MAX_ENTRIES: usize = 200;

pub struct ThumbnailCache {
    order: RwLock<VecDeque<String>>,
    entries: RwLock<HashMap<String, String>>,
}

impl ThumbnailCache {
    pub fn new() -> Self {
        Self {
            order: RwLock::new(VecDeque::new()),
            entries: RwLock::new(HashMap::new()),
        }
    }

    pub fn get(&self, key: &str) -> Option<String> {
        self.entries.read().ok()?.get(key).cloned()
    }

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
}

impl Default for ThumbnailCache {
    fn default() -> Self {
        Self::new()
    }
}
