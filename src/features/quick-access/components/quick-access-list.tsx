import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import { Folder, PinOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileStore } from "@/features/file/store/file.store";
import {
  useQuickAccessStore,
  type QuickAccessItem,
} from "../store/quick-access.store";

type QuickAccessListProps = {
  selectedQuickAccessId: string | null;
  onSelectQuickAccess: (item: QuickAccessItem) => void;
};

export function QuickAccessList({
  selectedQuickAccessId,
  onSelectQuickAccess,
}: QuickAccessListProps) {
  const items = useQuickAccessStore((s) => s.items);
  const remove = useQuickAccessStore((s) => s.remove);
  const setCurrentPath = useFileStore((s) => s.setCurrentPath);

  const handleSelect = (item: QuickAccessItem) => {
    onSelectQuickAccess(item);
    setCurrentPath(item.path);
  };

  if (items.length === 0) return null;

  return (
    <>
      <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
        Quick access
      </p>
      {items.map((item) => {
        const isSelected = selectedQuickAccessId === item.id;
        return (
          <ContextMenu key={item.id}>
            <ContextMenuTrigger asChild>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className={cn(
                  "flex h-9 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors",
                  isSelected
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                )}
                aria-current={isSelected ? "true" : undefined}
                title={item.path}
              >
                <Folder className="size-5 shrink-0 text-muted-foreground" />
                <span className="truncate">{item.name}</span>
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              <ContextMenuItem
                onSelect={() => remove(item.id)}
                className="text-muted-foreground"
              >
                <PinOff className="size-4" />
                Remove from Quick access
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </>
  );
}
