import { join } from "@tauri-apps/api/path";
import { DirEntry } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";
import { fileApi } from "@/features/file/file.api";
import { useFileStore } from "@/features/file/store/file.store";
import { useClipboardStore } from "./store/clipboard.store";

/**
 * Single source of truth for copy/cut/paste. Used by context menu and global shortcuts (DRY).
 */

function getPathFromEntry(currentPath: string, entry: DirEntry): Promise<string> {
  return join(currentPath, entry.name);
}

async function getSelectedPath(): Promise<string | null> {
  const { currentPath, selectedItem } = useFileStore.getState();
  if (!currentPath || !selectedItem) return null;
  return join(currentPath, selectedItem.name);
}

/** Copy: store paths in clipboard with mode "copy". */
export async function doCopy(entry?: DirEntry): Promise<void> {
  const { currentPath } = useFileStore.getState();
  if (!currentPath) return;

  const path = entry
    ? await getPathFromEntry(currentPath, entry)
    : await getSelectedPath();
  if (!path) {
    toast.info("Select an item to copy");
    return;
  }

  useClipboardStore.getState().setClipboard([path], "copy");
  toast.success("Copied to clipboard");
}

/** Cut: store paths in clipboard with mode "cut". */
export async function doCut(entry?: DirEntry): Promise<void> {
  const { currentPath } = useFileStore.getState();
  if (!currentPath) return;

  const path = entry
    ? await getPathFromEntry(currentPath, entry)
    : await getSelectedPath();
  if (!path) {
    toast.info("Select an item to cut");
    return;
  }

  useClipboardStore.getState().setClipboard([path], "cut");
  toast.success("Cut to clipboard");
}

/** Paste: copy or move clipboard contents into current directory and refresh list. */
export async function doPaste(): Promise<void> {
  const { currentPath, setEntries } = useFileStore.getState();
  const { paths, mode, clearClipboard } = useClipboardStore.getState();

  if (!currentPath) {
    toast.info("Open a folder to paste into");
    return;
  }
  if (paths.length === 0) {
    toast.info("Clipboard is empty");
    return;
  }

  try {
    for (const srcPath of paths) {
      if (mode === "copy") {
        await fileApi.copyPath(srcPath, currentPath);
      } else {
        await fileApi.movePath(srcPath, currentPath);
      }
    }
    if (mode === "cut") {
      clearClipboard();
    }
    const entries = await fileApi.getEntries(currentPath);
    setEntries(entries);
    toast.success(
      mode === "copy" ? "Pasted" : `Moved ${paths.length} item(s)`
    );
  } catch (err) {
    console.error("Paste failed:", err);
    toast.error("Paste failed");
  }
}
