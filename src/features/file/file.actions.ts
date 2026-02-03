import { join } from "@tauri-apps/api/path";
import { DirEntry } from "@tauri-apps/plugin-fs";
import { toasts } from "@/shared/toasts";
import { fileApi, isAccessDeniedError } from "@/features/file/file.api";
import { useFileStore } from "@/features/file/store/file.store";
import { useNavigationStore } from "@/features/navigation/store/navigation.store";
import { useClipboardStore } from "@/features/file/store/clipboard.store";

/**
 * Single source of truth for copy/cut/paste/delete. Used by context menu and global shortcuts (DRY).
 */

function getPathFromEntry(currentPath: string, entry: DirEntry): Promise<string> {
  return join(currentPath, entry.name);
}

async function getSelectedPaths(): Promise<string[]> {
  const currentPath = useNavigationStore.getState().currentPath;
  const selectedItems = useFileStore.getState().selectedItems;
  if (!currentPath || selectedItems.length === 0) return [];
  return Promise.all(
    selectedItems.map((e) => join(currentPath, e.name)),
  );
}

/** Copy: store paths in clipboard with mode "copy". */
export async function doCopy(entry?: DirEntry): Promise<void> {
  const currentPath = useNavigationStore.getState().currentPath;
  if (!currentPath) return;

  const paths = entry
    ? [await getPathFromEntry(currentPath, entry)]
    : await getSelectedPaths();
  if (paths.length === 0) {
    toasts.selectItemToCopy();
    return;
  }

  useClipboardStore.getState().setClipboard(paths, "copy");
  toasts.copiedToClipboard();
}

/** Cut: store paths in clipboard with mode "cut". */
export async function doCut(entry?: DirEntry): Promise<void> {
  const currentPath = useNavigationStore.getState().currentPath;
  if (!currentPath) return;

  const paths = entry
    ? [await getPathFromEntry(currentPath, entry)]
    : await getSelectedPaths();
  if (paths.length === 0) {
    toasts.selectItemToCut();
    return;
  }

  useClipboardStore.getState().setClipboard(paths, "cut");
  toasts.cutToClipboard();
}

/** Paste: copy or move clipboard contents into current directory and refresh list. */
export async function doPaste(): Promise<void> {
  const currentPath = useNavigationStore.getState().currentPath;
  const setEntries = useFileStore.getState().setEntries;
  const { paths, mode, clearClipboard } = useClipboardStore.getState();

  if (!currentPath) {
    toasts.openFolderToPaste();
    return;
  }
  if (paths.length === 0) {
    toasts.clipboardEmpty();
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
    if (mode === "copy") toasts.pasted();
    else toasts.movedItems(paths.length);
  } catch (err) {
    console.error("Paste failed:", err);
    if (isAccessDeniedError(err)) toasts.accessDenied();
    else toasts.pasteFailed();
  }
}

/** Rename: renames a file or directory in the current folder. */
export async function doRename(entry: DirEntry, newName: string): Promise<void> {
  const currentPath = useNavigationStore.getState().currentPath;
  const setEntries = useFileStore.getState().setEntries;
  if (!currentPath) return;

  const trimmed = newName.trim();
  if (!trimmed) {
    toasts.nameCannotBeEmpty();
    return;
  }
  if (trimmed.includes("/") || trimmed.includes("\\")) {
    toasts.nameNoPathSeparators();
    return;
  }
  if (trimmed === entry.name) {
    toasts.nameUnchanged();
    return;
  }

  try {
    await fileApi.renameEntry(currentPath, entry.name, trimmed);
    const entries = await fileApi.getEntries(currentPath);
    setEntries(entries);
    toasts.renamed();
  } catch (err) {
    console.error("Rename failed:", err);
    if (isAccessDeniedError(err)) toasts.accessDenied();
    else toasts.renameFailed();
  }
}

/** Delete: move file(s) or directory(ies) to system Trash. */
export async function doDelete(entry?: DirEntry): Promise<void> {
  const currentPath = useNavigationStore.getState().currentPath;
  const setEntries = useFileStore.getState().setEntries;
  if (!currentPath) return;

  const paths = entry
    ? [await getPathFromEntry(currentPath, entry)]
    : await getSelectedPaths();
  if (paths.length === 0) {
    toasts.selectItemToDelete();
    return;
  }

  try {
    await fileApi.moveToTrash(paths);
    const entries = await fileApi.getEntries(currentPath);
    setEntries(entries);
    toasts.movedToTrash();
  } catch (err) {
    console.error("Delete failed:", err);
    if (isAccessDeniedError(err)) toasts.accessDenied();
    else toasts.deleteFailed();
  }
}
