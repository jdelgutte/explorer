//! Returns image file contents as a data URL (base64) for frontend thumbnails.
//! Images are resized to a small thumbnail (JPEG); SVG is returned as-is.
//! Results are cached (path + mtime). Heavy work runs in a blocking thread.

use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use image::ImageFormat;
use std::io::Cursor;
use std::path::Path;
use tauri::State;

use crate::thumbnail_cache::ThumbnailCache;

const THUMBNAIL_MAX_WIDTH: u32 = 128;
const THUMBNAIL_MAX_HEIGHT: u32 = 200;

fn cache_key(path: &Path, mtime: Option<std::time::SystemTime>) -> String {
    let m = mtime
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_millis().to_string())
        .unwrap_or_else(|| "0".to_string());
    format!("img:{}:{}", path.display(), m)
}

fn mime_from_path(path: &Path) -> &'static str {
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("");
    if ext.eq_ignore_ascii_case("svg") {
        "image/svg+xml"
    } else if ext.eq_ignore_ascii_case("png") {
        "image/png"
    } else if ext.eq_ignore_ascii_case("jpg") || ext.eq_ignore_ascii_case("jpeg") {
        "image/jpeg"
    } else if ext.eq_ignore_ascii_case("gif") {
        "image/gif"
    } else if ext.eq_ignore_ascii_case("webp") {
        "image/webp"
    } else if ext.eq_ignore_ascii_case("bmp") {
        "image/bmp"
    } else if ext.eq_ignore_ascii_case("ico") {
        "image/x-icon"
    } else {
        "application/octet-stream"
    }
}

fn image_thumbnail_sync(path: String) -> Result<String, String> {
    let path = Path::new(&path)
        .canonicalize()
        .map_err(|e| format!("Path resolve: {}", e))?;
    if !path.exists() {
        return Err("File not found".to_string());
    }

    let ext_lower = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_ascii_lowercase();

    // SVG: image crate cannot decode; return full file as data URL.
    if ext_lower == "svg" {
        let bytes = std::fs::read(&path).map_err(|e| format!("Read file: {}", e))?;
        let mime = mime_from_path(&path);
        return Ok(format!("data:{};base64,{}", mime, BASE64.encode(&bytes)));
    }

    let img = image::open(&path).map_err(|e| format!("Decode image: {}", e))?;
    // Convert to RGB before thumbnailing so JPEG encode works (no alpha).
    let img_rgb = img.to_rgb8();
    let thumb =
        image::imageops::thumbnail(&img_rgb, THUMBNAIL_MAX_WIDTH, THUMBNAIL_MAX_HEIGHT);

    let mut buf = Vec::new();
    thumb
        .write_to(&mut Cursor::new(&mut buf), ImageFormat::Jpeg)
        .map_err(|e| format!("Encode JPEG: {}", e))?;

    Ok(format!("data:image/jpeg;base64,{}", BASE64.encode(&buf)))
}

#[tauri::command]
pub async fn image_thumbnail(
    cache: State<'_, ThumbnailCache>,
    path: String,
) -> Result<String, String> {
    let path_buf = Path::new(&path)
        .canonicalize()
        .map_err(|e| format!("Path resolve: {}", e))?;
    if !path_buf.exists() {
        return Err("File not found".to_string());
    }

    let mtime = std::fs::metadata(&path_buf)
        .ok()
        .and_then(|m| m.modified().ok());
    let key = cache_key(&path_buf, mtime);

    // First try memory, then on-disk cache (and repopulate memory if found).
    if let Some(cached) = cache.get_or_load(&key) {
        return Ok(cached);
    }

    let path_str = path_buf.to_string_lossy().into_owned();
    let result = tauri::async_runtime::spawn_blocking(move || image_thumbnail_sync(path_str))
        .await
        .map_err(|e| format!("Task join: {}", e))??;

    // Store in memory and persist to disk (if configured).
    cache.insert_and_persist(key, result.clone());
    Ok(result)
}
