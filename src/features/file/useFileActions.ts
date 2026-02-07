import { useCallback } from "react";
import { DirEntry } from "@tauri-apps/plugin-fs";
import { doCopy, doCut, doPaste, doDelete } from "@/features/file/file.actions";
import { useRenameDialogStore } from "@/features/file/store/rename-dialog.store";
import { useFileStore } from "@/features/file/store/file.store";

/**
 * Returns copy/cut/paste/delete/rename handlers for the context menu. Same logic is used by global shortcuts (DRY).
 */
export function useFileActions() {
  const openRenameDialog = useRenameDialogStore((s) => s.openRenameDialog);
  const selectedItem = useFileStore((s) => s.selectedItem);

  const copy = useCallback((entry?: DirEntry) => doCopy(entry), []);
  const cut = useCallback((entry?: DirEntry) => doCut(entry), []);
  const paste = useCallback(() => doPaste(), []);
  const deleteEntry = useCallback((entry?: DirEntry) => doDelete(entry), []);
  /** Opens the rename dialog for the given entry, or the selected item if no entry is passed (e.g. F2). */
  const startRename = useCallback(
    (entry?: DirEntry) => {
      const target = entry ?? selectedItem;
      if (target) openRenameDialog(target);
    },
    [openRenameDialog, selectedItem],
  );

  return { copy, cut, paste, deleteEntry, startRename };
}
