use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use image::ImageFormat;
use pdfium_render::prelude::*;
use std::path::Path;
use tauri::State;

use crate::thumbnail_cache::ThumbnailCache;

const THUMBNAIL_WIDTH: i32 = 128;
const THUMBNAIL_MAX_HEIGHT: i32 = 200;

/// Shared Pdfium instance (initialized once at app startup).
pub struct PdfiumState(pub Option<Pdfium>);

/// Initializes Pdfium once; call from app setup and store result in app state.
pub fn init_pdfium_for_app() -> Option<Pdfium> {
    let lib_path = Pdfium::pdfium_platform_library_name_at_path(std::path::Path::new("libs"));
    Pdfium::bind_to_library(&lib_path)
        .ok()
        .map(Pdfium::new)
}

fn cache_key(path: &Path, mtime: Option<std::time::SystemTime>) -> String {
    let m = mtime
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_millis().to_string())
        .unwrap_or_else(|| "0".to_string());
    format!("pdf:{}:{}", path.display(), m)
}

/// Renders the first page of the PDF at `path` to a PNG thumbnail and returns
/// its base64-encoded string. Cached by path + mtime.
#[tauri::command]
pub fn pdf_thumbnail(
    cache: State<ThumbnailCache>,
    state: State<PdfiumState>,
    path: String,
) -> Result<String, String> {
    let path = Path::new(&path)
        .canonicalize()
        .map_err(|e| format!("Path resolve: {}", e))?;
    if !path.exists() {
        return Err("File not found".to_string());
    }

    let mtime = std::fs::metadata(&path).ok().and_then(|m| m.modified().ok());
    let key = cache_key(&path, mtime);

    // First try memory, then on-disk cache (and repopulate memory if found).
    if let Some(cached) = cache.get_or_load(&key) {
        return Ok(cached);
    }

    let pdfium = state
        .0
        .as_ref()
        .ok_or("Pdfium not available (library not found at startup)")?;

    let render_config = PdfRenderConfig::new()
        .set_target_width(THUMBNAIL_WIDTH)
        .set_maximum_height(THUMBNAIL_MAX_HEIGHT)
        .rotate_if_landscape(PdfPageRenderRotation::Degrees90, true);

    let doc = pdfium
        .load_pdf_from_file(&path, None)
        .map_err(|e| format!("Load PDF: {}", e))?;
    let first_page = doc
        .pages()
        .get(0)
        .map_err(|e| format!("Get page: {}", e))?;
    let bitmap = first_page
        .render_with_config(&render_config)
        .map_err(|e| format!("Render page: {}", e))?;
    let image = bitmap.as_image();

    let mut buf = Vec::new();
    image
        .write_to(&mut std::io::Cursor::new(&mut buf), ImageFormat::Png)
        .map_err(|e| format!("Encode PNG: {}", e))?;

    let b64 = BASE64.encode(&buf);
    // Store in memory and persist to disk (if configured).
    cache.insert_and_persist(key, b64.clone());
    Ok(b64)
}
