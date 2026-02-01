use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use image::ImageFormat;
use pdfium_render::prelude::*;
use tauri::State;

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

/// Renders the first page of the PDF at `path` to a PNG thumbnail and returns
/// its base64-encoded string (data URL payload). Returns an error string on failure.
#[tauri::command]
pub fn pdf_thumbnail(state: State<PdfiumState>, path: String) -> Result<String, String> {
    let path = std::path::Path::new(&path)
        .canonicalize()
        .map_err(|e| format!("Path resolve: {}", e))?;
    if !path.exists() {
        return Err("File not found".to_string());
    }

    let pdfium = state
        .0
        .as_ref()
        .ok_or("Pdfium not available (library not found at startup)")?;

    let render_config = PdfRenderConfig::new()
            .set_target_width(THUMBNAIL_WIDTH)
            .set_maximum_height(THUMBNAIL_MAX_HEIGHT)
            .rotate_if_landscape(PdfPageRenderRotation::Degrees90, true);

    let doc = pdfium.load_pdf_from_file(&path, None).unwrap();
    let first_page = doc.pages().get(0).unwrap();

    let bitmap = first_page.render_with_config(&render_config).unwrap();

    let image = bitmap.as_image();

    let mut buf = Vec::new();
    image
        .write_to(&mut std::io::Cursor::new(&mut buf), ImageFormat::Png)
        .map_err(|e| format!("Encode PNG: {}", e))?;

    Ok(BASE64.encode(&buf))
}
