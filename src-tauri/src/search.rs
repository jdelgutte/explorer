//! Global file search with streaming results.

use serde::Serialize;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter, State};
use walkdir::WalkDir;

/// Shared state for cancelling ongoing searches.
pub struct SearchState {
    pub cancel_flags: Arc<Mutex<HashMap<String, Arc<AtomicBool>>>>,
}

impl Default for SearchState {
    fn default() -> Self {
        Self {
            cancel_flags: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

/// Event name for a batch of search results.
pub const SEARCH_RESULTS: &str = "search-results";
/// Event name when search is finished.
pub const SEARCH_DONE: &str = "search-done";

/// Batch size for emitting results (emit every N matches).
const BATCH_SIZE: usize = 50;

/// One search result (file or directory).
#[derive(Debug, Clone, Serialize)]
pub struct SearchResult {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
}

/// Payload for search-results event.
#[derive(Debug, Serialize, Clone)]
pub struct SearchResultsPayload {
    pub search_id: String,
    pub results: Vec<SearchResult>,
}

/// Payload for search-done event.
#[derive(Debug, Serialize, Clone)]
pub struct SearchDonePayload {
    pub search_id: String,
}

/// Starts a global search under `root_path` for entries whose name contains `query` (case-insensitive).
/// Emits `search-results` in batches and `search-done` when finished.
/// Uses `search_id` from the frontend so it can set the current search before events arrive.
/// The search can be cancelled via `cancel_search(search_id)`.
#[tauri::command]
pub fn start_search(
    app: AppHandle,
    state: State<'_, SearchState>,
    root_path: String,
    query: String,
    search_id: String,
) -> Result<String, String> {
    let search_id_return = search_id.clone();
    let query_lower = query.to_lowercase();
    let root = PathBuf::from(&root_path);

    if !root.is_dir() {
        return Err(format!("Not a directory: {}", root_path));
    }

    let cancel = Arc::new(AtomicBool::new(false));
    state
        .cancel_flags
        .lock()
        .map_err(|e| e.to_string())?
        .insert(search_id.clone(), cancel.clone());

    let cancel_flags = state.cancel_flags.clone();

    thread::spawn(move || {
        let mut batch: Vec<SearchResult> = Vec::with_capacity(BATCH_SIZE);

        for entry in WalkDir::new(&root)
            .follow_links(false)
            .max_depth(100)
            .into_iter()
            .filter_entry(|e| {
                let name = e.file_name().to_string_lossy();
                !name.starts_with('.')
            })
        {
            if cancel.load(Ordering::Relaxed) {
                break;
            }

            let entry = match entry {
                Ok(e) => e,
                Err(_) => continue,
            };

            let name = entry.file_name().to_string_lossy().into_owned();
            if query_lower.is_empty() || name.to_lowercase().contains(&query_lower) {
                let path = entry.path().to_string_lossy().into_owned();
                let is_directory = entry.file_type().is_dir();
                batch.push(SearchResult {
                    name,
                    path: path.clone(),
                    is_directory,
                });

                if batch.len() >= BATCH_SIZE {
                    let payload = SearchResultsPayload {
                        search_id: search_id.clone(),
                        results: std::mem::take(&mut batch),
                    };
                    let _ = app.emit(SEARCH_RESULTS, payload);
                }
            }
        }

        if !batch.is_empty() && !cancel.load(Ordering::Relaxed) {
            let payload = SearchResultsPayload {
                search_id: search_id.clone(),
                results: batch,
            };
            let _ = app.emit(SEARCH_RESULTS, payload);
        }

        let _ = app.emit(SEARCH_DONE, SearchDonePayload { search_id: search_id.clone() });
        let _ = cancel_flags.lock().map(|mut g| g.remove(&search_id));
    });

    Ok(search_id_return)
}

/// Cancels an ongoing search. No-op if the search is already finished or unknown.
#[tauri::command]
pub fn cancel_search(state: State<'_, SearchState>, search_id: String) -> Result<(), String> {
    if let Some(cancel) = state.cancel_flags.lock().map_err(|e| e.to_string())?.get(&search_id) {
        cancel.store(true, Ordering::Relaxed);
    }
    Ok(())
}
