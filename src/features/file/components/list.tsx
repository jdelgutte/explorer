import { DirEntry } from "@tauri-apps/plugin-fs";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import { EmptyFile } from "./empty-file";
import { EntryContextMenu } from "./entry-context-menu";
import { EntryIcon } from "./entry-icon";
import type { FileViewChildProps } from "./file-view";
import { fileApi, type EntryMetadata } from "../file.api";
import {
  useListColumnsStore,
  type ListColumnId,
} from "../store/list-columns.store";
import { formatDate, formatFileSize } from "../utils/format";
import { useThumbnail } from "../use-thumbnail";

const COLUMN_LABELS: Record<ListColumnId, string> = {
  name: "Name",
  type: "Type",
  size: "Size",
  dateModified: "Date modified",
};

export function FileList({
  entries,
  currentPath,
  isEntrySelected,
  onSelect,
  onDoubleClick,
  contextMenuHandlers,
}: FileViewChildProps) {
  const columns = useListColumnsStore((s) => s.columns);
  const toggleColumn = useListColumnsStore((s) => s.toggleColumn);
  const [metadata, setMetadata] = useState<Record<string, EntryMetadata>>({});

  useEffect(() => {
    if (!currentPath || entries.length === 0) {
      setMetadata({});
      return;
    }
    let cancelled = false;
    fileApi.getEntriesMetadata(currentPath, entries).then((m) => {
      if (!cancelled) setMetadata(m);
    });
    return () => {
      cancelled = true;
    };
  }, [currentPath, entries]);

  if (entries.length === 0) {
    return <EmptyFile />;
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-background">
      {/* Sticky header — right-click to show/hide columns */}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="sticky top-0 z-10 flex shrink-0 border-b border-border/40 bg-background/95 px-2 py-1.5 backdrop-blur-sm">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="w-8 shrink-0" aria-hidden />
              {columns.name ? (
                <span className="min-w-0 flex-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80">
                  {COLUMN_LABELS.name}
                </span>
              ) : (
                <span className="min-w-0 flex-1" aria-hidden />
              )}
              {columns.type && (
                <span className="w-20 shrink-0 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80">
                  {COLUMN_LABELS.type}
                </span>
              )}
              {columns.size && (
                <span className="w-24 shrink-0 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80">
                  {COLUMN_LABELS.size}
                </span>
              )}
              {columns.dateModified && (
                <span className="w-36 shrink-0 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80">
                  {COLUMN_LABELS.dateModified}
                </span>
              )}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          <ContextMenuLabel>Visible columns</ContextMenuLabel>
          {(Object.keys(COLUMN_LABELS) as ListColumnId[]).map((id) => (
            <ContextMenuCheckboxItem
              key={id}
              checked={columns[id]}
              onCheckedChange={() => toggleColumn(id)}
            >
              {COLUMN_LABELS[id]}
            </ContextMenuCheckboxItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>

      {/* List body */}
      <div className="flex-1 overflow-auto">
        <div className="px-1.5 py-1">
          {entries.map((entry) => (
            <ListRow
              key={entry.name}
              entry={entry}
              currentPath={currentPath}
              isSelected={isEntrySelected(entry)}
              metadata={metadata[entry.name]}
              columns={columns}
              onSelect={() => onSelect(entry)}
              onDoubleClick={() => onDoubleClick(entry)}
              contextMenuHandlers={contextMenuHandlers}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ListRow({
  entry,
  currentPath,
  isSelected,
  metadata,
  columns,
  onSelect,
  onDoubleClick,
  contextMenuHandlers,
}: {
  entry: DirEntry;
  currentPath: string | null;
  isSelected: boolean;
  metadata?: EntryMetadata;
  columns: Record<ListColumnId, boolean>;
  onSelect: () => void;
  onDoubleClick: () => void;
  contextMenuHandlers: FileViewChildProps["contextMenuHandlers"];
}) {
  const imageSrc = useThumbnail(entry, currentPath);

  return (
    <EntryContextMenu
      entry={entry}
      currentPath={currentPath}
      handlers={contextMenuHandlers}
    >
      <div className="contents">
        <button
          type="button"
          onClick={onSelect}
          onDoubleClick={onDoubleClick}
          className={cn(
            "relative flex w-full min-w-0 cursor-pointer select-none items-center gap-3 rounded px-2 py-1.5 pl-2.5 text-left outline-none transition-[color,background-color] duration-150",
            "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isSelected
              ? "bg-accent/80 text-accent-foreground hover:bg-accent focus-visible:ring-accent"
              : "text-foreground"
          )}
        >
          <div
            className={cn(
              "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary transition-opacity duration-150",
              isSelected ? "opacity-100" : "opacity-0"
            )}
            aria-hidden
          />
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded transition-colors",
              entry.isDirectory
                ? "bg-amber-500/10 dark:bg-amber-400/10"
                : "bg-muted/60 dark:bg-muted/40"
            )}
          >
            <EntryIcon
              isDirectory={entry.isDirectory}
              imageSrc={imageSrc}
              className={imageSrc ? "size-8" : "size-4 text-muted-foreground"}
            />
          </div>
          {columns.name ? (
            <span
              className="min-w-0 flex-1 truncate text-sm font-medium tracking-tight text-foreground"
              title={entry.name}
            >
              {entry.name}
            </span>
          ) : (
            <span className="min-w-0 flex-1" aria-hidden />
          )}
          {columns.type && (
            <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
              {entry.isDirectory ? "Folder" : "File"}
            </span>
          )}
          {columns.size && (
            <span className="w-24 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
              {metadata
                ? formatFileSize(metadata.size)
                : entry.isDirectory
                  ? "—"
                  : "…"}
            </span>
          )}
          {columns.dateModified && (
            <span className="w-36 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
              {metadata && metadata.mtime
                ? formatDate(metadata.mtime)
                : metadata
                  ? "—"
                  : "…"}
            </span>
          )}
        </button>
      </div>
    </EntryContextMenu>
  );
}
