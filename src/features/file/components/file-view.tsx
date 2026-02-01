import { join } from "@tauri-apps/api/path";
import { DirEntry } from "@tauri-apps/plugin-fs";
import { openPath } from "@tauri-apps/plugin-opener";
import { toast } from "sonner";
import { useFileStore } from "../store/file.store";
import { useViewStore } from "@/features/viewmode/view.store";
import type { EntryContextMenuHandlers } from "./entry-context-menu";
import { FileGrid } from "./grid";
import { FileList } from "./list";

/** Props passed to list/grid by the parent. */
export type FileViewChildProps = {
  entries: DirEntry[];
  currentPath: string | null;
  selectedItem: DirEntry | null;
  isEntrySelected: (entry: DirEntry) => boolean;
  onSelect: (entry: DirEntry) => void;
  onDoubleClick: (entry: DirEntry) => void;
  contextMenuHandlers: EntryContextMenuHandlers;
};

export function FileView() {
  const {
    entries,
    currentPath,
    selectedItem,
    setCurrentPath,
    setSelectedItem,
  } = useFileStore();
  const viewMode = useViewStore((state) => state.viewMode);

  const isEntrySelected = (entry: DirEntry) =>
    selectedItem !== null &&
    selectedItem.name === entry.name &&
    selectedItem.isDirectory === entry.isDirectory;

  const handleDoubleClick = async (entry: DirEntry) => {
    if (entry.isDirectory) {
      const nextPath = await join(currentPath, entry.name);
      setCurrentPath(nextPath);
      setSelectedItem(null);
    } else {
      const path = await join(currentPath, entry.name);
      await openPath(path);
    }
  };

  const contextMenuHandlers: EntryContextMenuHandlers = {
    onOpen: handleDoubleClick,
    onRename: () => toast.info("Rename – coming soon"),
    onProperties: () => toast.info("Properties – coming soon"),
    onCopy: () => toast.info("Copy – coming soon"),
    onCut: () => toast.info("Cut – coming soon"),
    onPaste: () => toast.info("Paste – coming soon"),
    onDelete: () => toast.info("Delete – coming soon"),
  };

  const childProps: FileViewChildProps = {
    entries,
    currentPath,
    selectedItem,
    isEntrySelected,
    onSelect: setSelectedItem,
    onDoubleClick: handleDoubleClick,
    contextMenuHandlers,
  };

  return viewMode === "list" ? (
    <FileList {...childProps} />
  ) : (
    <FileGrid {...childProps} />
  );
}
