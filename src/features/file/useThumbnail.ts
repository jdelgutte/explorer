import { join } from "@tauri-apps/api/path";
import { DirEntry } from "@tauri-apps/plugin-fs";
import { useEffect, useState } from "react";
import { fileApi } from "./file.api";
import { isImageFileName, isPdfFileName } from "./image-preview";
import { thumbnailCache } from "./thumbnail-cache";

/**
 * Loads the thumbnail URL for a single file entry (image or PDF).
 * Uses an in-memory cache so revisiting the same file does not re-call the backend.
 * Returns undefined for directories or non-previewable files.
 */
export function useThumbnail(
  entry: DirEntry,
  currentPath: string | null
): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!currentPath || entry.isDirectory) {
      setUrl(undefined);
      return;
    }
    const isImage = isImageFileName(entry.name);
    const isPdf = isPdfFileName(entry.name);
    if (!isImage && !isPdf) {
      setUrl(undefined);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const path = await join(currentPath, entry.name);
        if (cancelled) return;

        const cached = thumbnailCache.get(path);
        if (cached != null) {
          if (!cancelled) setUrl(cached);
          return;
        }

        if (isImage) {
          const dataUrl = await fileApi.getImageThumbnail(path);
          if (!cancelled && dataUrl) {
            thumbnailCache.set(path, dataUrl);
            setUrl(dataUrl);
          }
        } else {
          const base64 = await fileApi.getPdfThumbnail(path);
          if (!cancelled && base64) {
            const dataUrl = `data:image/png;base64,${base64}`;
            thumbnailCache.set(path, dataUrl);
            setUrl(dataUrl);
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error(
            `Error generating thumbnail for ${entry.name}:`,
            e
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentPath, entry.name, entry.isDirectory]);

  return url;
}
