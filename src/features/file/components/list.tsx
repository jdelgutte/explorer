import { DirEntry } from "@tauri-apps/plugin-fs";
import { cn } from "@/lib/utils";
import { EmptyFile } from "./empty-file";
import { EntryIcon } from "./entry-icon";
import type { FileViewChildProps } from "./file-view";
import { useThumbnail } from "../use-thumbnail";

export function FileList({
  entries,
  currentPath,
  isEntrySelected,
  onSelect,
  onDoubleClick,
}: FileViewChildProps) {
  if (entries.length === 0) {
    return <EmptyFile />;
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-card">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex shrink-0 border-b border-border/60 bg-muted/30 backdrop-blur-sm">
        <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5">
          <div className="w-9 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Name
          </span>
          <span className="w-16 shrink-0 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Type
          </span>
        </div>
      </div>

      {/* List body */}
      <div className="flex-1 overflow-auto">
        <div className="py-1">
          {entries.map((entry) => (
            <ListRow
              key={entry.name}
              entry={entry}
              currentPath={currentPath}
              isSelected={isEntrySelected(entry)}
              onSelect={() => onSelect(entry)}
              onDoubleClick={() => onDoubleClick(entry)}
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
  onSelect,
  onDoubleClick,
}: {
  entry: DirEntry;
  currentPath: string | null;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
}) {
  const imageSrc = useThumbnail(entry, currentPath);

  return (
    <button
      type="button"
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className={cn(
        "relative flex w-full min-w-0 cursor-pointer select-none items-center gap-3 rounded-lg px-4 py-2.5 pl-5 text-left outline-none transition-colors",
        "hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isSelected &&
          "bg-accent text-accent-foreground hover:bg-accent/80 focus-visible:ring-accent"
      )}
    >
      {/* Left accent when selected */}
      <div
        className={cn(
          "absolute left-2 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full transition-colors",
          isSelected ? "bg-primary" : "bg-transparent"
        )}
        aria-hidden
      />
      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded">
        <EntryIcon
          isDirectory={entry.isDirectory}
          imageSrc={imageSrc}
          className={imageSrc ? "size-9" : undefined}
        />
      </div>
      <span
        className="min-w-0 flex-1 truncate font-medium text-foreground"
        title={entry.name}
      >
        {entry.name}
      </span>
      <span className="w-16 shrink-0 text-right text-sm text-muted-foreground">
        {entry.isDirectory ? "Folder" : "File"}
      </span>
    </button>
  );
}
