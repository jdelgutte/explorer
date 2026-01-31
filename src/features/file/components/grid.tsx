import { DirEntry } from "@tauri-apps/plugin-fs";
import { FolderIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { EntryIcon } from "./entry-icon";
import type { FileViewChildProps } from "./file-view";
import { EmptyFile } from "./empty-file";

export function FileGrid({
  entries,
  isEntrySelected,
  onSelect,
  onDoubleClick,
}: FileViewChildProps) {


  if (entries.length === 0) {
    return (
      <EmptyFile />
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-card h-full w-full">
      <div className="flex-1 overflow-auto p-2">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] auto-rows-[120px] gap-2">
            {entries.map((entry) => (
              <FileGridItem
                key={entry.name}
                entry={entry}
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
  isSelected,
  onClick,
  onDoubleClick,
}: {
  entry: DirEntry;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}) {
  return (
    <div className="flex shrink-0">
      <button
        type="button"
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={cn(
          "flex h-full w-full min-w-0 flex-col items-center justify-center gap-2 rounded-lg border-2 p-2 transition-colors hover:bg-accent/50 overflow-hidden",
          isSelected
            ? "border-primary bg-accent text-accent-foreground"
            : "border-transparent hover:border-border"
        )}
      >
        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted/80">
          <EntryIcon isDirectory={entry.isDirectory} className="size-11" />
        </div>
        <span
          className="max-w-full break-words text-center text-xs font-medium"
          title={entry.name}
        >
          {entry.name}
        </span>
      </button>
    </div>
  );
}
