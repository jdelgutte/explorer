import "./App.css";
import { CommandPalette } from "@/features/command/components/command-palette";
import { useFileShortcuts } from "@/features/file/useFileShortcuts";
import { CreateEntryDialog } from "@/features/file/components/create-entry-dialog";
import { FileView } from "@/features/file/components/file-view";
import { SearchDialog } from "@/features/search/components/search-dialog";
import { useSearchDialogShortcut } from "@/features/search/useSearchDialogShortcut";
import { Sidebar } from "@/shared/components/sidebar";
import { Toaster } from "@/shared/components/ui/sonner";
import { Toolbar } from "@/shared/components/toolbar";

function App() {
  useSearchDialogShortcut();
  useFileShortcuts();

  return (
    <div className="flex h-screen flex-col">
      <Toolbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <FileView />
        </main>
      </div>
      <CommandPalette />
      <SearchDialog />
      <CreateEntryDialog />
      <Toaster />
    </div>
  );
}

export default App;
