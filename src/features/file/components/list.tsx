import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DirEntry } from "@tauri-apps/plugin-fs";
import { Virtuoso, type VirtuosoProps } from "react-virtuoso";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import { fileApi, type EntryMetadata } from "@/features/file/file.api";
import type { FileViewChildProps } from "@/features/file/components/file-view";
import { EmptyFile } from "./empty-file";
import { EntryContextMenu } from "./entry-context-menu";
import { EntryIcon } from "./entry-icon";
import {
  useListColumnsStore,
  type ListColumnId,
} from "@/features/file/store/list-columns.store";
import { formatDate, formatFileSize } from "@/features/file/utils/format";
import { useThumbnail } from "@/features/file/useThumbnail";

// Custom Scroller: always show scrollbar to prevent blinking during scroll.
const ListScroller = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ style, ...props }, ref) => (
  <div ref={ref} style={{ ...style, overflowY: "scroll" }} {...props} />
));
ListScroller.displayName = "ListScroller";

/** Approximate row height (icon + padding) for Virtuoso to avoid per-item measurement. */
const ROW_HEIGHT_PX = 44;

const COLUMN_KEYS: Record<ListColumnId, string> = {
  name: "file.list.name",
  type: "file.list.type",
  size: "file.list.size",
  dateModified: "file.list.dateModified",
};

type FileListRowProps = {
  entry: DirEntry;
  currentPath: string | null;
  isSelected: boolean;
  metadata?: EntryMetadata;
  columns: Record<ListColumnId, boolean>;
  onSelect: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  contextMenuHandlers: FileViewChildProps["contextMenuHandlers"];
};

export function FileList({
  entries,
  currentPath,
  isEntrySelected,
  onSelect,
  onDoubleClick,
  contextMenuHandlers,
}: FileViewChildProps) {
  const { t } = useTranslation();
  const columns = useListColumnsStore((s) => s.columns);
  const toggleColumn = useListColumnsStore((s) => s.toggleColumn);
  const [metadataVersion, setMetadataVersion] = useState(0);
  const metadataRef = useRef<Record<string, EntryMetadata>>({});

  useEffect(() => {
    if (!currentPath || entries.length === 0) {
      metadataRef.current = {};
      setMetadataVersion((v) => v + 1);
      return;
    }
    let cancelled = false;
    fileApi.getEntriesMetadata(currentPath, entries).then((m) => {
      if (!cancelled) {
        metadataRef.current = m;
        setMetadataVersion((v) => v + 1);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentPath, entries]);

  // Stable callback: read metadata from ref so we don't depend on metadata object identity.
  // metadataVersion triggers a single re-render when metadata has loaded.
  const itemContent = useCallback<
    NonNullable<VirtuosoProps<DirEntry, unknown>["itemContent"]>
  >(
    (_, entry) => (
      <MemoListRow
        entry={entry}
        currentPath={currentPath}
        isSelected={isEntrySelected(entry)}
        metadata={metadataRef.current[entry.name]}
        columns={columns}
        onSelect={(e) => onSelect(entry, e.ctrlKey || e.metaKey)}
        onDoubleClick={() => onDoubleClick(entry)}
        contextMenuHandlers={contextMenuHandlers}
      />
    ),
    [
      columns,
      contextMenuHandlers,
      currentPath,
      isEntrySelected,
      metadataVersion,
      onDoubleClick,
      onSelect,
    ]
  );

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
                  {t(COLUMN_KEYS.name)}
                </span>
              ) : (
                <span className="min-w-0 flex-1" aria-hidden />
              )}
              {columns.type && (
                <span className="w-20 shrink-0 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80">
                  {t(COLUMN_KEYS.type)}
                </span>
              )}
              {columns.size && (
                <span className="w-24 shrink-0 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80">
                  {t(COLUMN_KEYS.size)}
                </span>
              )}
              {columns.dateModified && (
                <span className="w-36 shrink-0 text-right text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80">
                  {t(COLUMN_KEYS.dateModified)}
                </span>
              )}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          <ContextMenuLabel>{t("file.list.visibleColumns")}</ContextMenuLabel>
          {(Object.keys(COLUMN_KEYS) as ListColumnId[]).map((id) => (
            <ContextMenuCheckboxItem
              key={id}
              checked={columns[id]}
              onCheckedChange={() => toggleColumn(id)}
            >
              {t(COLUMN_KEYS[id])}
            </ContextMenuCheckboxItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>

      {/* List body */}
      <div className="flex-1 min-h-0">
        <Virtuoso
          style={{ height: "100%" }}
          totalCount={entries.length}
          data={entries}
          itemContent={itemContent}
          components={{ Scroller: ListScroller }}
          defaultItemHeight={ROW_HEIGHT_PX}
          overscan={12}
          increaseViewportBy={{ top: 80, bottom: 80 }}
        />
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
}: FileListRowProps) {
  const { t } = useTranslation();
  const imageSrc = useThumbnail(entry, currentPath);

  return (
    <EntryContextMenu entry={entry} handlers={contextMenuHandlers}>
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
              fileName={entry.name}
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
              {entry.isDirectory ? t("file.list.folder") : t("file.list.file")}
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

// Memoize rows so they are not remounted on every change of other entries' selection.
const MemoListRow = memo(
  ListRow,
  (prev, next) => {
    const columnsEqual =
      prev.columns.name === next.columns.name &&
      prev.columns.type === next.columns.type &&
      prev.columns.size === next.columns.size &&
      prev.columns.dateModified === next.columns.dateModified;

    const prevM = prev.metadata;
    const nextM = next.metadata;
    const metadataEqual =
      (!!prevM === !!nextM) &&
      (!prevM ||
        (prevM.size === nextM!.size &&
          (prevM.mtime?.getTime() ?? 0) ===
            (nextM!.mtime?.getTime() ?? 0)));

    return (
      prev.entry.name === next.entry.name &&
      prev.entry.isDirectory === next.entry.isDirectory &&
      prev.currentPath === next.currentPath &&
      prev.isSelected === next.isSelected &&
      columnsEqual &&
      metadataEqual
    );
  }
);
