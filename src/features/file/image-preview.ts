/** File extensions treated as previewable images. */
const IMAGE_EXTENSIONS = new Set(
  [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg", ".ico"].map((e) =>
    e.toLowerCase()
  )
);

/** Returns true if the file name has an image extension. */
export function isImageFileName(name: string): boolean {
  const lower = name.toLowerCase();
  const dot = lower.lastIndexOf(".");
  if (dot === -1) return false;
  return IMAGE_EXTENSIONS.has(lower.slice(dot));
}

/** Returns true if the file name has a PDF extension. */
export function isPdfFileName(name: string): boolean {
  return name.toLowerCase().endsWith(".pdf");
}
