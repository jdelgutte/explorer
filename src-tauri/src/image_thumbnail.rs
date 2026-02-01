//! Returns image file contents as a data URL (base64) for frontend thumbnails.
//! Avoids relying on the asset protocol which can fail to load in the webview.

use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use std::path::Path;

fn mime_from_path(path: &Path) -> &'static str {
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("");
    if ext.eq_ignore_ascii_case("png") {
        "image/png"
    } else if ext.eq_ignore_ascii_case("jpg") || ext.eq_ignore_ascii_case("jpeg") {
        "image/jpeg"
    } else if ext.eq_ignore_ascii_case("gif") {
        "image/gif"
    } else if ext.eq_ignore_ascii_case("webp") {
        "image/webp"
    } else if ext.eq_ignore_ascii_case("bmp") {
        "image/bmp"
    } else if ext.eq_ignore_ascii_case("svg") {
        "image/svg+xml"
    } else if ext.eq_ignore_ascii_case("ico") {
        "image/x-icon"
    } else {
        "application/octet-stream"
    }
}

/// Reads the image file at `path` and returns a data URL string (e.g. `data:image/png;base64,...`).
/// Used for thumbnails so the frontend does not depend on the asset protocol.
#[tauri::command]
pub fn image_thumbnail(path: String) -> Result<String, String> {
    let path = Path::new(&path)
        .canonicalize()
        .map_err(|e| format!("Path resolve: {}", e))?;
    if !path.exists() {
        return Err("File not found".to_string());
    }
    let bytes = std::fs::read(&path).map_err(|e| format!("Read file: {}", e))?;
    let mime = mime_from_path(&path);
    let b64 = BASE64.encode(&bytes);
    Ok(format!("data:{};base64,{}", mime, b64))
}
