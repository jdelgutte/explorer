import { openPath } from "@tauri-apps/plugin-opener";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const items = useRecentStore((s) => s.items);
  const remove = useRecentStore((s) => s.remove);
  const clear = useRecentStore((s) => s.clear);

  const fileItems = items.filter((item) => !item.isDirectory);

  const handleSelect = (item: RecentItem) => {
    onSelectRecent(item);
    openPath(item.path);
  };

  if (fileItems.length === 0) {
    return (
      <p className="px-3 py-4 text-sm text-muted-foreground">
        {t("recent.empty")}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5" role="list">
      {fileItems.map((item) => {
        const isSelected = selectedRecentId === item.id;
        return (
          <li key={item.id}>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
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
                  {t("recent.removeFromList")}
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onSelect={() => clear()}
                  className="text-muted-foreground"
                >
                  <Trash2 className="size-4" />
                  {t("recent.clearRecent")}
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </li>
        );
      })}
    </ul>
  );
}
