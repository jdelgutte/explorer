import { useCallback } from "react";
import { DirEntry } from "@tauri-apps/plugin-fs";
import { doCopy, doCut, doPaste, doDelete } from "./file.actions";

/**
 * Returns copy/cut/paste/delete handlers for the context menu. Same logic is used by global shortcuts (DRY).
 */
export function useFileActions() {
  const copy = useCallback((entry?: DirEntry) => doCopy(entry), []);
  const cut = useCallback((entry?: DirEntry) => doCut(entry), []);
  const paste = useCallback(() => doPaste(), []);
  const deleteEntry = useCallback((entry?: DirEntry) => doDelete(entry), []);

  return { copy, cut, paste, deleteEntry };
}
