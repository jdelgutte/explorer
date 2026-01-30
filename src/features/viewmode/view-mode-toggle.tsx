import { List, LayoutGrid } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useViewStore } from "@/features/viewmode/view.store";

export function ViewModeToggle() {
  const viewMode = useViewStore((state) => state.viewMode);
  const setViewMode = useViewStore((state) => state.setViewMode);

  return (
    <div className="flex items-center rounded-md border border-border p-0.5">
      <Button
        type="button"
        variant={viewMode === "list" ? "secondary" : "ghost"}
        size="icon"
        className="size-8"
        onClick={() => setViewMode("list")}
        aria-label="List view"
        aria-pressed={viewMode === "list"}
      >
        <List className="size-4" />
      </Button>
      <Button
        type="button"
        variant={viewMode === "grid" ? "secondary" : "ghost"}
        size="icon"
        className="size-8"
        onClick={() => setViewMode("grid")}
        aria-label="Grid view"
        aria-pressed={viewMode === "grid"}
      >
        <LayoutGrid className="size-4" />
      </Button>
    </div>
  );
}
