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
    <header className="flex h-12 shrink-0 items-center gap-4 border-b border-border/60 bg-background/95 px-4 py-2 backdrop-blur-sm">
      {/* Navigation */}
      <nav className="flex shrink-0 items-center" aria-label="Navigation">
        <NavigationButtons />
      </nav>

      {/* Separator */}
      <div className="h-6 w-px shrink-0 bg-border/50" aria-hidden />

      {/* Search */}
      <form className="flex min-w-0 flex-1 items-center" role="search">
        <div className="relative flex min-w-0 flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70 pointer-events-none" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 w-full rounded-lg border border-transparent bg-muted/40 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-input hover:bg-muted/50"
            aria-label="Search"
          />
        </div>
      </form>

      {/* View mode */}
      <div className="flex shrink-0 items-center">
        <ViewModeToggle />
      </div>
    </header>
  );
}
