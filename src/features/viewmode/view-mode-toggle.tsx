import { List, LayoutGrid } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useViewStore } from "@/features/viewmode/view.store";
import { ButtonGroup } from "@/shared/components/ui/button-group";

export function ViewModeToggle() {
  const viewMode = useViewStore((state) => state.viewMode);
  const setViewMode = useViewStore((state) => state.setViewMode);

  return (
      <ButtonGroup className="rounded-md border border-border">
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
      </ButtonGroup>
  );
}
