import { useEffect, useMemo } from "react";
import { DirEntry } from "@tauri-apps/plugin-fs";
import { Loader2 } from "lucide-react";
import { useDirectoryFilterStore } from "@/features/file/store/directory-filter.store";
import { useFileStore } from "@/features/file/store/file.store";
import { useNavigationStore } from "@/features/navigation/store/navigation.store";
import { useViewStore } from "@/features/viewmode/view.store";
import { useFileViewHandlers } from "@/features/file/useFileViewHandlers";
import type { EntryContextMenuHandlers } from "./entry-context-menu";
import { FileGrid } from "./grid";
import { FileList } from "./list";

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
  const { entries, entriesLoading } = useFileStore();
  const currentPath = useNavigationStore((s) => s.currentPath);
  const directoryFilter = useDirectoryFilterStore((s) => s.directoryFilter);
  const setDirectoryFilter = useDirectoryFilterStore((s) => s.setDirectoryFilter);
  const viewMode = useViewStore((s) => s.viewMode);
  const {
    isEntrySelected,
    handleSelect,
    handleDoubleClick,
    contextMenuHandlers,
  } = useFileViewHandlers();

  useEffect(() => {
    setDirectoryFilter("");
  }, [currentPath, setDirectoryFilter]);

  const filteredEntries = useMemo(() => {
    if (!directoryFilter.trim()) return entries;
    const q = directoryFilter.trim().toLowerCase();
    return entries.filter((e) => e.name.toLowerCase().includes(q));
  }, [entries, directoryFilter]);

  const childProps: FileViewChildProps = {
    entries: filteredEntries,
    currentPath,
    isEntrySelected,
    onSelect: handleSelect,
    onDoubleClick: handleDoubleClick,
    contextMenuHandlers,
  };

  if (currentPath && entriesLoading && entries.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[280px]" aria-busy="true">
        <Loader2 className="size-10 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return viewMode === "list" ? (
    <FileList {...childProps} />
  ) : (
    <FileGrid {...childProps} />
  );
}
