import "./App.css";
import { CommandPalette } from "@/features/command/components/command-palette";
import { CreateEntryDialog } from "@/features/file/components/create-entry-dialog";
import { FileView } from "@/features/file/components/file-view";
import { Sidebar } from "@/shared/components/sidebar";
import { Toaster } from "@/shared/components/ui/sonner";
import { Toolbar } from "@/shared/components/toolbar";

function App() {
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
      <CreateEntryDialog />
      <Toaster />
    </div>
  );
}

export default App;
