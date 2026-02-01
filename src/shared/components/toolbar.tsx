import { useState } from "react";
import { Search } from "lucide-react";
import { ViewModeToggle } from "@/features/viewmode/view-mode-toggle";
import { NavigationButtons } from "@/features/navigation/components/navigation-buttons";

type ToolbarProps = {
  searchPlaceholder?: string;
};

export function Toolbar({ searchPlaceholder = "Search..." }: ToolbarProps) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border bg-background px-3">
      <NavigationButtons />

      {/* Search bar */}
      <form
        className="flex flex-1 items-center"
        role="search"
      >
        <div className="relative flex min-w-0 flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 w-full rounded-md border border-input bg-muted/50 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            aria-label="Search"
          />
        </div>
      </form>

      <ViewModeToggle />
    </header>
  );
}
