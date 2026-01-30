import { join } from "@tauri-apps/api/path";
import { DirEntry } from "@tauri-apps/plugin-fs";
import { useFileStore } from "../file.store";
import { useViewStore } from "@/features/viewmode/view.store";
import { FileGrid } from "./grid";
import { FileList } from "./list";
import { openPath } from "@tauri-apps/plugin-opener";

/** Props passed to list/grid by the parent. */
export type FileViewChildProps = {
  entries: DirEntry[];
  selectedItem: DirEntry | null;
  isEntrySelected: (entry: DirEntry) => boolean;
  onSelect: (entry: DirEntry) => void;
  onDoubleClick: (entry: DirEntry) => void;
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
      console.log("double click on file", entry.name);
      const path = await join(currentPath, entry.name);
      await openPath(path);
      //setSelectedItem(entry);
    }
  };

  const childProps: FileViewChildProps = {
    entries,
    selectedItem,
    isEntrySelected,
    onSelect: setSelectedItem,
    onDoubleClick: handleDoubleClick,
  };

  return viewMode === "list" ? (
    <FileList {...childProps} />
  ) : (
    <FileGrid {...childProps} />
  );
}
