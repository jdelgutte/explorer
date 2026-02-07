import React, { forwardRef, memo, useCallback } from "react";
import { DirEntry } from "@tauri-apps/plugin-fs";
import { VirtuosoGrid, type VirtuosoGridProps } from "react-virtuoso";
import { cn } from "@/lib/utils";
import { EmptyFile } from "./empty-file";
import { EntryContextMenu } from "./entry-context-menu";
import { EntryIcon } from "./entry-icon";
import type { FileViewChildProps } from "@/features/file/components/file-view";
import { useThumbnail } from "@/features/file/useThumbnail";

type FileGridItemProps = {
  entry: DirEntry;
  currentPath: string | null;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  contextMenuHandlers: FileViewChildProps["contextMenuHandlers"];
};

// Custom wrappers for VirtuosoGrid so we keep a responsive grid-like layout.
const fileGridVirtuosoComponents: VirtuosoGridProps<DirEntry, unknown>["components"] =
  {
    List: forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
      ({ className, ...props }, ref) => (
        <div
          ref={ref}
          {...props}
          className={cn(
            "flex flex-wrap content-start items-start gap-1",
            className
          )}
        />
      )
    ),
    Item: ({ className, ...props }) => (
      <div
        {...props}
        className={cn("p-1 flex-none", className)}
        style={{ width: "120px" }}
      />
    ),
  };

export function FileGrid({
  entries,
  currentPath,
  isEntrySelected,
  onSelect,
  onDoubleClick,
  contextMenuHandlers,
}: FileViewChildProps) {
  if (entries.length === 0) {
    return <EmptyFile />;
  }

  const itemContent = useCallback(
    (index: number) => {
      const entry = entries[index];
      return (
        <MemoFileGridItem
          entry={entry}
          currentPath={currentPath}
          isSelected={isEntrySelected(entry)}
          onClick={(e) => onSelect(entry, e.ctrlKey || e.metaKey)}
          onDoubleClick={() => onDoubleClick(entry)}
          contextMenuHandlers={contextMenuHandlers}
        />
      );
    },
    [entries, currentPath, isEntrySelected, onSelect, onDoubleClick, contextMenuHandlers]
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background h-full w-full">
      <div className="flex-1 p-3">
        <VirtuosoGrid
          style={{ height: "100%" }}
          totalCount={entries.length}
          data={entries}
          components={fileGridVirtuosoComponents}
          itemContent={itemContent}
        />
      </div>
    </div>
  );
}

function FileGridItem({
  entry,
  currentPath,
  isSelected,
  onClick,
  onDoubleClick,
  contextMenuHandlers,
}: FileGridItemProps) {
  const imageSrc = useThumbnail(entry, currentPath);

  return (
    <div className="flex shrink-0">
      <EntryContextMenu entry={entry} handlers={contextMenuHandlers}>
        <div className="contents">
          <button
            type="button"
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            className={cn(
              "group flex w-full min-w-0 flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all duration-200 overflow-hidden",
              "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
              isSelected
                ? "border-primary bg-primary/10 text-foreground shadow-sm ring-2 ring-primary/20"
                : "border-transparent bg-card/50 hover:bg-accent/40 hover:border-border/80"
            )}
          >
            <div
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-lg overflow-hidden transition-colors",
                entry.isDirectory
                  ? "bg-amber-500/15 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400"
                  : !imageSrc &&
                    "bg-slate-400/15 text-slate-600 dark:bg-slate-400/20 dark:text-slate-400"
              )}
            >
              <EntryIcon
                isDirectory={entry.isDirectory}
                imageSrc={imageSrc}
                className={imageSrc ? "size-12" : "size-6 text-inherit"}
              />
            </div>
            <span
              className="max-w-full wrap-break-word text-center text-xs font-medium text-foreground line-clamp-3 leading-snug"
              title={entry.name}
            >
              {entry.name}
            </span>
          </button>
        </div>
      </EntryContextMenu>
    </div>
  );
}

// Memoize items so they do not remount unnecessarily when other entries' selection changes.
const MemoFileGridItem = memo(
  FileGridItem,
  (prev, next) =>
    prev.entry.name === next.entry.name &&
    prev.entry.isDirectory === next.entry.isDirectory &&
    prev.currentPath === next.currentPath &&
    prev.isSelected === next.isSelected
);
