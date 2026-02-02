import { useCallback } from "react";
import { DirEntry } from "@tauri-apps/plugin-fs";
import { doCopy, doCut, doPaste } from "./clipboard.actions";

/**
 * Returns copy/cut/paste handlers for the context menu. Same logic is used by global shortcuts (DRY).
 */
export function useClipboardActions() {
  const copy = useCallback((entry?: DirEntry) => doCopy(entry), []);
  const cut = useCallback((entry?: DirEntry) => doCut(entry), []);
  const paste = useCallback(() => doPaste(), []);

  return { copy, cut, paste };
}
