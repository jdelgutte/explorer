import "./App.css";
import { useTranslation } from "react-i18next";
import { CommandPalette } from "@/features/command/components/command-palette";
import { useFileShortcuts } from "@/features/file/useFileShortcuts";
import { useSyncEntriesToCurrentPath } from "@/features/file/useSyncEntriesToCurrentPath";
import { CreateEntryDialog } from "@/features/file/components/create-entry-dialog";
import { EmptyTrashDialog } from "@/features/file/components/empty-trash-dialog";
import { PropertiesDialog } from "@/features/file/components/properties-dialog";
import { RenameEntryDialog } from "@/features/file/components/rename-entry-dialog";
import { FileView } from "@/features/file/components/file-view";
import { RecentList } from "@/features/recent/components/recent-list";
import { useRecentStore } from "@/features/recent/store/recent.store";
import { OptionsPage } from "@/features/options/components/options-page";
import { useOptionsStore } from "@/features/options/store/options.store";
import { TabBar } from "@/features/tabs/components/tab-bar";
import { SearchDialog } from "@/features/search/components/search-dialog";
import { useSearchDialogShortcut } from "@/features/search/useSearchDialogShortcut";
import { Sidebar } from "@/shared/components/sidebar";
import { Toaster } from "@/shared/components/ui/sonner";
import { Toolbar } from "@/shared/components/toolbar";

function App() {
  const { t } = useTranslation();
  useSearchDialogShortcut();
  useFileShortcuts();
  useSyncEntriesToCurrentPath();
  const recentsViewActive = useRecentStore((s) => s.recentsViewActive);
  const optionsViewActive = useOptionsStore((s) => s.optionsViewActive);

  return (
    <div className="flex h-screen flex-col">
      <Toolbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex flex-1 flex-col min-h-0 min-w-0">
          <TabBar />
          <div className="flex-1 min-h-0 overflow-auto">
            {optionsViewActive ? (
              <OptionsPage />
            ) : recentsViewActive ? (
              <nav className="p-3" aria-label={t("recent.title")}>
                <RecentList
                  selectedRecentId={null}
                  onSelectRecent={() => {}}
                  variant="content"
                />
              </nav>
            ) : (
              <FileView />
            )}
          </div>
        </main>
      </div>
      <CommandPalette />
      <SearchDialog />
      <CreateEntryDialog />
      <EmptyTrashDialog />
      <RenameEntryDialog />
      <PropertiesDialog />
      <Toaster />
    </div>
  );
}

export default App;
