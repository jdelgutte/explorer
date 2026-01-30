import {
  desktopDir,
  documentDir,
  downloadDir,
  homeDir,
  pictureDir,
  videoDir,
  audioDir,
} from "@tauri-apps/api/path";
import {
  Monitor,
  FileText,
  Download,
  Home,
  Music,
  Image,
  Video,
  Trash2,
  Folder,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fileApi } from "@/features/file/file.api";
import { useEffect, useState } from "react";
import { useFileStore } from "@/features/file/file.store";

export type SidebarLocation =
  | "home"
  | "desktop"
  | "documents"
  | "downloads"
  | "pictures"
  | "music"
  | "videos"
  | "trash"
  | "other";

export type SidebarItem = {
  id: SidebarLocation;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  getPath: () => Promise<string>;
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "home", label: "Home", icon: Home, getPath: homeDir },
  { id: "desktop", label: "Desktop", icon: Monitor, getPath: desktopDir },
  { id: "documents", label: "Documents", icon: FileText, getPath: documentDir },
  { id: "downloads", label: "Downloads", icon: Download, getPath: downloadDir },
  { id: "pictures", label: "Pictures", icon: Image, getPath: pictureDir },
  { id: "music", label: "Music", icon: Music, getPath: audioDir },
  { id: "videos", label: "Videos", icon: Video, getPath: videoDir },
  { id: "trash", label: "Trash", icon: Trash2, getPath: () => fileApi.getTrashDir() },
  { id: "other", label: "Other", icon: Folder, getPath: () => Promise.resolve("") },
];

type SidebarProps = {
  selectedId?: SidebarLocation | null;
  onSelect?: (id: SidebarLocation) => void;
  className?: string;
};

export function Sidebar({
  className,
}: SidebarProps) {
  const currentPath = useFileStore((state) => state.currentPath);
  const setCurrentPath = useFileStore((state) => state.setCurrentPath);
  const [selectedItem, setSelectedItem] = useState<SidebarItem>(SIDEBAR_ITEMS[0]);

  const handleSelect = async (item: SidebarItem) => {
    setSelectedItem(item);
    setCurrentPath(await item.getPath());
  };

  // Initial load: set currentPath from sidebar selection when empty
  useEffect(() => {
    if (currentPath) return;
    let cancelled = false;
    (async () => {
      const path = await selectedItem.getPath();
      if (!cancelled) setCurrentPath(path);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentPath, selectedItem, setCurrentPath]);

  // Refetch entries whenever currentPath changes (sidebar or list navigation)
  useEffect(() => {
    if (!currentPath) return;
    let cancelled = false;
    (async () => {
      const entries = await fileApi.getEntries(currentPath);
      if (!cancelled) useFileStore.getState().setEntries(entries);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentPath]);

  return (
    <aside
      className={cn(
        "flex w-52 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className
      )}
      aria-label="Places"
    >
      <nav className="flex flex-col gap-0.5 p-2" aria-label="Places">
        {SIDEBAR_ITEMS.map((item) => {
          const isSelected = selectedItem.id === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className={cn(
                "flex h-9 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors",
                isSelected
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
              )}
              aria-current={isSelected ? "true" : undefined}
            >
              <item.icon className="size-5 shrink-0 text-muted-foreground" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
