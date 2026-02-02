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
  HardDrive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fileApi } from "@/features/file/file.api";
import { devicesApi } from "@/features/devices/devices.api";
import type { MountableDevice } from "@/features/devices/devices.api";
import { useEffect, useState } from "react";
import { useFileStore } from "@/features/file/store/file.store";
import { useNavigationStore } from "@/features/navigation/store/navigation.store";
import { Separator } from "@/shared/components/ui/separator";
import { QuickAccessList } from "@/features/quick-access/components/quick-access-list";
import {
  useQuickAccessStore,
  type QuickAccessItem,
} from "@/features/quick-access/store/quick-access.store";

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
];

type SidebarProps = {
  selectedId?: SidebarLocation | null;
  onSelect?: (id: SidebarLocation) => void;
  className?: string;
};

export function Sidebar({
  className,
}: SidebarProps) {
  const currentPath = useNavigationStore((state) => state.currentPath);
  const setCurrentPath = useNavigationStore((state) => state.setCurrentPath);
  const [selectedItem, setSelectedItem] = useState<SidebarItem>(SIDEBAR_ITEMS[0]);
  const [selectedDeviceMountPoint, setSelectedDeviceMountPoint] = useState<
    string | null
  >(null);
  const [selectedQuickAccessId, setSelectedQuickAccessId] = useState<
    string | null
  >(null);
  const [devices, setDevices] = useState<MountableDevice[]>([]);
  const quickAccessItems = useQuickAccessStore((s) => s.items);

  const handleSelectPlace = async (item: SidebarItem) => {
    setSelectedItem(item);
    setSelectedDeviceMountPoint(null);
    setSelectedQuickAccessId(null);
    setCurrentPath(await item.getPath());
  };

  const handleSelectQuickAccess = (item: QuickAccessItem) => {
    setSelectedItem(SIDEBAR_ITEMS[0]); // clear place selection
    setSelectedDeviceMountPoint(null);
    setSelectedQuickAccessId(item.id);
    setCurrentPath(item.path);
  };

  const handleSelectDevice = (device: MountableDevice) => {
    setSelectedDeviceMountPoint(device.mount_point);
    setSelectedQuickAccessId(null);
    setCurrentPath(device.mount_point);
  };

  // Initial fetch and listen for mountable device updates
  useEffect(() => {
    let cancelled = false;
    let unlisten: (() => void) | null = null;
    devicesApi.getMountableDevices().then((list) => {
      if (!cancelled) setDevices(list);
    });
    devicesApi
      .listenMountableDevices((list) => {
        if (!cancelled) setDevices(list);
      })
      .then((fn) => {
        unlisten = fn;
      });
    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    if (!currentPath) return;
    const quickItem = quickAccessItems.find((item) => item.path === currentPath);
    if (quickItem) {
      setSelectedQuickAccessId(quickItem.id);
      setSelectedDeviceMountPoint(null);
    } else {
      setSelectedQuickAccessId(null);
    }
  }, [currentPath, quickAccessItems]);

  // Sync sidebar place selection: when navigating, highlight the place that contains currentPath (e.g. Documents when in ~/Documents/foo)
  useEffect(() => {
    if (!currentPath) return;
    let cancelled = false;
    (async () => {
      const normalizedCurrent = currentPath.replace(/\/+$/, "") || "/";
      let bestMatch: SidebarItem | null = null;
      let bestMatchLength = -1;
      for (const item of SIDEBAR_ITEMS) {
        const itemPath = await item.getPath();
        const normalizedItem = itemPath.replace(/\/+$/, "") || "/";
        const isInside =
          normalizedCurrent === normalizedItem ||
          normalizedCurrent.startsWith(normalizedItem + "/");
        if (isInside && normalizedItem.length > bestMatchLength) {
          bestMatchLength = normalizedItem.length;
          bestMatch = item;
        }
      }
      if (!cancelled && bestMatch) {
        setSelectedItem(bestMatch);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentPath]);

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
      aria-label="Places and devices"
    >
      <nav className="flex flex-col gap-0.5 p-2" aria-label="Places">
        {SIDEBAR_ITEMS.map((item) => {
          const isSelected =
            selectedDeviceMountPoint === null && selectedItem.id === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectPlace(item)}
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

      <Separator className="my-1" />

      <nav className="flex flex-col gap-0.5 p-2" aria-label="Quick access">
        <QuickAccessList
          selectedQuickAccessId={selectedQuickAccessId}
          onSelectQuickAccess={handleSelectQuickAccess}
        />
      </nav>

      <Separator className="my-1" />

      <nav className="flex flex-col gap-0.5 p-2" aria-label="Devices">
        <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
          Devices
        </p>
        {devices.map((device) => {
          const isSelected = selectedDeviceMountPoint === device.mount_point;
          const label =
            device.name || device.mount_point || "Unknown device";
          return (
            <button
              key={device.mount_point}
              type="button"
              onClick={() => handleSelectDevice(device)}
              className={cn(
                "flex h-9 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors",
                isSelected
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
              )}
              aria-current={isSelected ? "true" : undefined}
              title={`${device.mount_point} (${device.file_system})`}
            >
              <HardDrive className="size-5 shrink-0 text-muted-foreground" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
