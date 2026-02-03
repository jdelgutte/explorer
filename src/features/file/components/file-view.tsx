import { join } from "@tauri-apps/api/path";
import { DirEntry } from "@tauri-apps/plugin-fs";
import { openPath } from "@tauri-apps/plugin-opener";
import { usePropertiesDialogStore } from "@/features/file/store/properties-dialog.store";
import { useRenameDialogStore } from "@/features/file/store/rename-dialog.store";
import { useFileActions } from "@/features/file/useFileActions";
import { useFileStore } from "../store/file.store";
import { useNavigationStore } from "@/features/navigation/store/navigation.store";
import { useViewStore } from "@/features/viewmode/view.store";
import { useQuickAccessStore } from "@/features/quick-access/store/quick-access.store";
import { toasts } from "@/shared/toasts";
import type { EntryContextMenuHandlers } from "./entry-context-menu";
import { FileGrid } from "./grid";
import { FileList } from "./list";
import { fileApi, isAccessDeniedError } from "../file.api";

/** Props passed to list/grid by the parent. */
export type FileViewChildProps = {
  entries: DirEntry[];
  currentPath: string | null;
  isEntrySelected: (entry: DirEntry) => boolean;
  onSelect: (entry: DirEntry, additive: boolean) => void;
  onDoubleClick: (entry: DirEntry) => void;
  contextMenuHandlers: EntryContextMenuHandlers;
};

export function FileView() {
  const { entries, selectedItems, selectEntry, clearSelection } =
    useFileStore();
  const { currentPath, setCurrentPath } = useNavigationStore();
  const viewMode = useViewStore((state) => state.viewMode);

  const isEntrySelected = (entry: DirEntry) =>
    selectedItems.some(
      (s) => s.name === entry.name && s.isDirectory === entry.isDirectory,
    );

  const handleSelect = (entry: DirEntry, additive: boolean) => {
    selectEntry(entry, additive);
  };

  const handleDoubleClick = async (entry: DirEntry) => {
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
      await openPath(path);
    }
  };

  const addToQuickAccess = useQuickAccessStore((s) => s.add);
  const hasPathInQuickAccess = useQuickAccessStore((s) => s.hasPath);
  const openRenameDialog = useRenameDialogStore((s) => s.openRenameDialog);
  const openPropertiesDialog = usePropertiesDialogStore(
    (s) => s.openPropertiesDialog,
  );
  const { copy, cut, paste, deleteEntry } = useFileActions();

  const contextMenuHandlers: EntryContextMenuHandlers = {
    onOpen: handleDoubleClick,
    onRename: (entry) => openRenameDialog(entry),
    onProperties: (entry) => openPropertiesDialog(entry, currentPath),
    onCopy: (entry) => copy(entry),
    onCut: (entry) => cut(entry),
    onPaste: () => paste(),
    onDelete: (entry) => deleteEntry(entry),
    onAddToQuickAccess:
      currentPath
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
  };

  const childProps: FileViewChildProps = {
    entries,
    currentPath,
    isEntrySelected,
    onSelect: handleSelect,
    onDoubleClick: handleDoubleClick,
    contextMenuHandlers,
  };

  return viewMode === "list" ? (
    <FileList {...childProps} />
  ) : (
    <FileGrid {...childProps} />
  );
}
