import { useCallback, useMemo } from "react";
import { join } from "@tauri-apps/api/path";
import { DirEntry } from "@tauri-apps/plugin-fs";
import { openPath } from "@tauri-apps/plugin-opener";
import { fileApi, isAccessDeniedError } from "@/features/file/file.api";
import { useFileStore, isEntrySelected as isEntrySelectedFn } from "@/features/file/store/file.store";
import { useNavigationStore } from "@/features/navigation/store/navigation.store";
import { usePropertiesDialogStore } from "@/features/file/store/properties-dialog.store";
import { useRenameDialogStore } from "@/features/file/store/rename-dialog.store";
import { useQuickAccessStore } from "@/features/quick-access/store/quick-access.store";
import { useRecentStore } from "@/features/recent/store/recent.store";
import { toasts } from "@/shared/toasts";
import { useFileActions } from "@/features/file/useFileActions";
import type { EntryContextMenuHandlers } from "@/features/file/components/entry-context-menu";

/**
 * Shared handlers for the file explorer view (FileList / FileGrid).
 * Single place for double-click, selection, and context menu actions (DRY).
 */
export function useFileViewHandlers() {
  const { selectedItems, selectEntry, clearSelection } = useFileStore();
  const { currentPath, setCurrentPath } = useNavigationStore();
  const addRecent = useRecentStore((s) => s.add);
  const addToQuickAccess = useQuickAccessStore((s) => s.add);
  const hasPathInQuickAccess = useQuickAccessStore((s) => s.hasPath);
  const openRenameDialog = useRenameDialogStore((s) => s.openRenameDialog);
  const openPropertiesDialog = usePropertiesDialogStore((s) => s.openPropertiesDialog);
  const { copy, cut, paste, deleteEntry } = useFileActions();

  const isEntrySelected = useCallback(
    (entry: DirEntry) => isEntrySelectedFn(entry, selectedItems),
    [selectedItems],
  );

  const handleSelect = useCallback(
    (entry: DirEntry, additive: boolean) => selectEntry(entry, additive),
    [selectEntry],
  );

  const handleDoubleClick = useCallback(
    async (entry: DirEntry) => {
      if (!currentPath) return;
      const path = await join(currentPath, entry.name);
      if (entry.isDirectory) {
        try {
          await fileApi.getEntries(path);
          setCurrentPath(path);
          clearSelection();
        } catch (err) {
          if (isAccessDeniedError(err)) toasts.accessDenied();
        }
      } else {
        addRecent(path, entry.name, false);
        await openPath(path);
      }
    },
    [currentPath, setCurrentPath, clearSelection, addRecent],
  );

  const handleOpenInTerminal = useCallback(
    async (entry: DirEntry) => {
      if (!entry.isDirectory || !currentPath) return;
      const path = await join(currentPath, entry.name);
      try {
        await fileApi.openInTerminal(path);
      } catch (err) {
        toasts.error(
          err instanceof Error ? err.message : "Failed to open terminal",
        );
      }
    },
    [currentPath],
  );

  const contextMenuHandlers: EntryContextMenuHandlers = useMemo(
    () => ({
      onOpen: handleDoubleClick,
      onRename: (entry) => openRenameDialog(entry),
      onProperties: (entry) => openPropertiesDialog(entry, currentPath),
      onCopy: (entry) => copy(entry),
      onCut: (entry) => cut(entry),
      onPaste: () => paste(),
      onDelete: (entry) => deleteEntry(entry),
      onAddToQuickAccess: currentPath
        ? (entry: DirEntry) => {
            if (!entry.isDirectory) return;
            join(currentPath, entry.name).then((path) => {
              if (hasPathInQuickAccess(path)) {
                toasts.alreadyInQuickAccess();
                return;
              }
              addToQuickAccess(path, entry.name);
              toasts.addedToQuickAccess(entry.name);
            });
          }
        : undefined,
      onOpenInTerminal: currentPath ? handleOpenInTerminal : undefined,
    }),
    [
      currentPath,
      handleDoubleClick,
      handleOpenInTerminal,
      openRenameDialog,
      openPropertiesDialog,
      copy,
      cut,
      paste,
      deleteEntry,
      addToQuickAccess,
      hasPathInQuickAccess,
    ],
  );

  return {
    isEntrySelected,
    handleSelect,
    handleDoubleClick,
    contextMenuHandlers,
  };
}
