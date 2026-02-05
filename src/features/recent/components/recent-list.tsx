import { openPath } from "@tauri-apps/plugin-opener";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import { FileText, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useRecentStore,
  type RecentItem,
} from "@/features/recent/store/recent.store";

type RecentListProps = {
  selectedRecentId: string | null;
  onSelectRecent: (item: RecentItem) => void;
  /** "sidebar" for sidebar styles, "content" for main content area */
  variant?: "sidebar" | "content";
};

export function RecentList({
  selectedRecentId,
  onSelectRecent,
  variant = "sidebar",
}: RecentListProps) {
  const items = useRecentStore((s) => s.items);
  const remove = useRecentStore((s) => s.remove);
  const clear = useRecentStore((s) => s.clear);

  // Only show files (recent list is files-only)
  const fileItems = items.filter((item) => !item.isDirectory);

  const handleSelect = (item: RecentItem) => {
    onSelectRecent(item);
    openPath(item.path);
  };

  return (
    <>
      {fileItems.length === 0 ? (
        <p className="px-3 py-4 text-sm text-muted-foreground">
          Aucun fichier ouvert récemment.
        </p>
      ) : (
        fileItems.map((item) => {
        const isSelected = selectedRecentId === item.id;
        return (
          <ContextMenu key={item.id}>
            <ContextMenuTrigger asChild>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className={cn(
                  "flex h-9 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors",
                  variant === "content"
                    ? isSelected
                      ? "bg-muted text-foreground"
                      : "text-foreground hover:bg-muted"
                    : isSelected
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                )}
                aria-current={isSelected ? "true" : undefined}
                title={item.path}
              >
                <FileText className="size-5 shrink-0 text-muted-foreground" />
                <span className="truncate">{item.name}</span>
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              <ContextMenuItem
                onSelect={() => remove(item.id)}
                className="text-muted-foreground"
              >
                <X className="size-4" />
                Remove from list
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onSelect={() => clear()}
                className="text-muted-foreground"
              >
                <Trash2 className="size-4" />
                Clear recent
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })
      )}
    </>
  );
}
