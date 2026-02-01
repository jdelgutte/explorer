import { DirEntry } from "@tauri-apps/plugin-fs";
import { cn } from "@/lib/utils";
import { EntryIcon } from "./entry-icon";
import type { FileViewChildProps } from "./file-view";
import { EmptyFile } from "./empty-file";
import { useThumbnail } from "../use-thumbnail";

export function FileGrid({
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
    <div className="flex flex-1 flex-col overflow-hidden bg-background h-full w-full">
      <div className="flex-1 overflow-auto p-3">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] auto-rows-auto gap-1 items-start">
          {entries.map((entry) => (
            <FileGridItem
              key={entry.name}
              entry={entry}
              currentPath={currentPath}
              isSelected={isEntrySelected(entry)}
              onClick={() => onSelect(entry)}
              onDoubleClick={() => onDoubleClick(entry)}
            />
          ))}
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
}: {
  entry: DirEntry;
  currentPath: string | null;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}) {
  const imageSrc = useThumbnail(entry, currentPath);

  return (
    <div className="flex shrink-0">
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
              : !imageSrc && "bg-slate-400/15 text-slate-600 dark:bg-slate-400/20 dark:text-slate-400"
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
  );
}
