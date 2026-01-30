import "./App.css";
import { Toolbar } from "@/shared/components/toolbar";
import { Sidebar } from "@/shared/components/sidebar";
import { FileView } from "@/features/file/components/file-view";

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
    </div>
  );
}

export default App;
