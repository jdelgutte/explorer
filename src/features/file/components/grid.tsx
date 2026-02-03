import { DirEntry } from "@tauri-apps/plugin-fs";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { EmptyFile } from "./empty-file";
import { EntryContextMenu } from "./entry-context-menu";
import { EntryIcon } from "./entry-icon";
import type { FileViewChildProps } from "./file-view";
import { useThumbnail } from "../useThumbnail";

const MIN_CELL_WIDTH = 100;
const GAP_PX = 4;
const ROW_HEIGHT_ESTIMATE = 110;
const PADDING_X = 12;

export function FileGrid({
  entries,
  currentPath,
  isEntrySelected,
  onSelect,
  onDoubleClick,
  contextMenuHandlers,
}: FileViewChildProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(1);

  useLayoutEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth - PADDING_X * 2;
      const cols = Math.max(1, Math.floor((w + GAP_PX) / (MIN_CELL_WIDTH + GAP_PX)));
      setColumnCount(cols);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rowCount = Math.ceil(entries.length / columnCount);
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    overscan: 2,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

  if (entries.length === 0) {
    return <EmptyFile />;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background h-full w-full">
      <div ref={parentRef} className="flex-1 overflow-auto p-3">
        <div
          style={{ height: `${totalHeight}px`, width: "100%", position: "relative" }}
        >
          {virtualRows.map((virtualRow) => {
            const start = virtualRow.index * columnCount;
            const rowEntries = entries.slice(start, start + columnCount);
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div
                  className="grid auto-rows-auto gap-1 items-start h-full"
                  style={{
                    gridTemplateColumns: `repeat(${columnCount}, minmax(100px, 1fr))`,
                  }}
                >
                  {rowEntries.map((entry) => (
                    <FileGridItem
                      key={entry.name}
                      entry={entry}
                      currentPath={currentPath}
                      isSelected={isEntrySelected(entry)}
                      onClick={(e) => onSelect(entry, e.ctrlKey || e.metaKey)}
                      onDoubleClick={() => onDoubleClick(entry)}
                      contextMenuHandlers={contextMenuHandlers}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
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
}: {
  entry: DirEntry;
  currentPath: string | null;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  contextMenuHandlers: FileViewChildProps["contextMenuHandlers"];
}) {
  const imageSrc = useThumbnail(entry, currentPath);

  return (
    <div className="flex shrink-0">
      <EntryContextMenu
        entry={entry}
        currentPath={currentPath}
        handlers={contextMenuHandlers}
      >
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
