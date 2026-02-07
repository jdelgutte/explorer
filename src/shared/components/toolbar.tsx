import { useTranslation } from "react-i18next";
import { Search, RotateCcw, Settings } from "lucide-react";
import { ViewModeToggle } from "@/features/viewmode/view-mode-toggle";
import { NavigationButtons } from "@/features/navigation/components/navigation-buttons";
import { Button } from "@/shared/components/ui/button";
import { useNavigationStore } from "@/features/navigation/store/navigation.store";
import { useDirectoryFilterStore } from "@/features/file/store/directory-filter.store";
import { useFileStore } from "@/features/file/store/file.store";
import { useTrashInfoStore } from "@/features/file/store/trash-info.store";
import { useOptionsStore } from "@/features/options/store/options.store";
import { fileApi } from "@/features/file/file.api";
import { toasts } from "@/shared/toasts";
import { ToolbarBreadcrumb } from "./toolbar-breadcrumb";

const SEP = <div className="h-6 w-px shrink-0 bg-border/50" aria-hidden />;

export function Toolbar() {
  const { t } = useTranslation();
  const currentPath = useNavigationStore((s) => s.currentPath);
  const directoryFilter = useDirectoryFilterStore((s) => s.directoryFilter);
  const setDirectoryFilter = useDirectoryFilterStore((s) => s.setDirectoryFilter);
  const trashPath = useTrashInfoStore((s) => s.trashPath);
  const restoreAvailable = useTrashInfoStore((s) => s.restoreAvailable);
  const refetchTrash = useTrashInfoStore((s) => s.refetch);
  const selectedItems = useFileStore((s) => s.selectedItems);
  const setEntries = useFileStore((s) => s.setEntries);
  const clearSelection = useFileStore((s) => s.clearSelection);
  const setOptionsViewActive = useOptionsStore((s) => s.setOptionsViewActive);

  const isInTrash = currentPath && trashPath && currentPath === trashPath;
  const canRestore = isInTrash && restoreAvailable && selectedItems.length > 0;

  const handleRestore = async () => {
    if (!canRestore || !currentPath) return;
    const ids = selectedItems.map((e) => e.name);
    try {
      await fileApi.restoreTrashItems(ids);
      clearSelection();
      await refetchTrash();
      const entries = await fileApi.getEntries(currentPath);
      setEntries(entries);
      toasts.restoredFromTrash(ids.length);
    } catch (err) {
      toasts.restoreFromTrashFailed(
        err instanceof Error ? err.message : String(err)
      );
    }
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b border-border/60 bg-background/95 px-4 py-2 backdrop-blur-sm">
      <nav className="flex shrink-0 items-center" aria-label={t("nav.ariaLabel")}>
        <NavigationButtons />
      </nav>
      <ToolbarBreadcrumb />

      {canRestore && (
        <>
          {SEP}
          <Button variant="outline" size="sm" onClick={handleRestore} className="gap-2">
            <RotateCcw className="size-4" />
            {t("toolbar.restore")}
          </Button>
        </>
      )}

      {SEP}

      <form className="flex min-w-0 flex-1 items-center" role="search">
        <div className="relative flex min-w-0 flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70 pointer-events-none" />
          <input
            type="search"
            value={directoryFilter}
            onChange={(e) => setDirectoryFilter(e.target.value)}
            placeholder={t("toolbar.searchPlaceholder")}
            className="h-8 w-full rounded-lg border border-transparent bg-muted/40 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-input hover:bg-muted/50"
            aria-label={t("toolbar.search")}
          />
        </div>
      </form>

      <div className="flex shrink-0 items-center gap-2">
        <ViewModeToggle />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        onClick={() => setOptionsViewActive(true)}
        aria-label={t("sidebar.options")}
      >
        <Settings className="size-4" />
      </Button>
    </header>
  );
}
