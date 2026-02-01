# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## PDF thumbnails (optional)

PDF previews require the **Pdfium** native library at runtime.

**Linux:**

1. Download the Linux build from [pdfium-binaries releases](https://github.com/bblanchon/pdfium-binaries/releases) (e.g. `pdfium-linux-x64.tgz` for 64-bit).
2. Extract: `tar -xzf pdfium-linux-x64.tgz`
3. Copy `libpdfium.so` into the **`src-tauri/`** folder (same folder as `Cargo.toml`).

**Alternative:** If you keep the library elsewhere, set the directory before running:

```bash
export PDFIUM_LIB_DIR=/chemin/vers/dossier/contenant/libpdfium.so
pnpm tauri dev
```

**Windows:** Copy `pdfium.dll` into `src-tauri/`.  
**macOS:** Copy `libpdfium.dylib` into `src-tauri/`.

If the library is missing, the app will show an error listing the paths it tried; use that to confirm where to place the file. Without this library, PDF thumbnails do not appear; image thumbnails and the rest of the app work normally.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
