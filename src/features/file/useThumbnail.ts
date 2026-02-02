import { join } from "@tauri-apps/api/path";
import { DirEntry } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { isImageFileName, isPdfFileName } from "./image-preview";

/**
 * Loads the thumbnail URL for a single file entry (image or PDF).
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
        if (isImage) {
          const dataUrl = await invoke<string>("image_thumbnail", { path });
          if (!cancelled && dataUrl) setUrl(dataUrl);
        } else {
          const base64 = await invoke<string>("pdf_thumbnail", { path });
          if (!cancelled && base64)
            setUrl(`data:image/png;base64,${base64}`);
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
