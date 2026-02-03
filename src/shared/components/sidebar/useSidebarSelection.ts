import { useEffect, useState } from "react";
import { useNavigationStore } from "@/features/navigation/store/navigation.store";
import { useMountableDevices } from "@/features/devices/useMountableDevices";
import type { MountableDevice } from "@/features/devices/devices.api";
import { useQuickAccessStore } from "@/features/quick-access/store/quick-access.store";
import type { QuickAccessItem } from "@/features/quick-access/store/quick-access.store";
import type { RecentItem } from "@/features/recent/store/recent.store";
import { SIDEBAR_ITEMS, type SidebarItem } from "./constants";

export type SidebarSelection = {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  selectedItem: SidebarItem;
  selectedDeviceMountPoint: string | null;
  selectedQuickAccessId: string | null;
  selectedRecentId: string | null;
  recentsSelected: boolean;
  devices: MountableDevice[];
  handleSelectRecents: () => void;
  handleSelectPlace: (item: SidebarItem) => void;
  handleSelectQuickAccess: (item: QuickAccessItem) => void;
  handleSelectRecent: (item: RecentItem) => void;
  handleSelectDevice: (device: MountableDevice) => void;
};

export function useSidebarSelection(): SidebarSelection {
  const currentPath = useNavigationStore((state) => state.currentPath);
  const setCurrentPath = useNavigationStore((state) => state.setCurrentPath);
  const [selectedItem, setSelectedItem] = useState<SidebarItem>(SIDEBAR_ITEMS[0]);
  const [selectedDeviceMountPoint, setSelectedDeviceMountPoint] = useState<string | null>(null);
  const [selectedQuickAccessId, setSelectedQuickAccessId] = useState<string | null>(null);
  const [selectedRecentId, setSelectedRecentId] = useState<string | null>(null);
  const [recentsSelected, setRecentsSelected] = useState(false);
  const devices = useMountableDevices();
  const quickAccessItems = useQuickAccessStore((s) => s.items);

  const handleSelectRecents = () => {
    setRecentsSelected(true);
    setSelectedDeviceMountPoint(null);
    setSelectedQuickAccessId(null);
    setSelectedRecentId(null);
  };

  const handleSelectPlace = async (item: SidebarItem) => {
    setRecentsSelected(false);
    setSelectedItem(item);
    setSelectedDeviceMountPoint(null);
    setSelectedQuickAccessId(null);
    setSelectedRecentId(null);
    setCurrentPath(await item.getPath());
  };

  const handleSelectQuickAccess = (item: QuickAccessItem) => {
    setRecentsSelected(false);
    setSelectedItem(SIDEBAR_ITEMS[0]);
    setSelectedDeviceMountPoint(null);
    setSelectedQuickAccessId(item.id);
    setSelectedRecentId(null);
    setCurrentPath(item.path);
  };

  const handleSelectRecent = (item: RecentItem) => {
    setSelectedQuickAccessId(null);
    setSelectedRecentId(item.id);
  };

  const handleSelectDevice = (device: MountableDevice) => {
    setRecentsSelected(false);
    setSelectedDeviceMountPoint(device.mount_point);
    setSelectedQuickAccessId(null);
    setSelectedRecentId(null);
    setCurrentPath(device.mount_point);
  };

  // Sync quick access selection when currentPath matches a quick access item
  useEffect(() => {
    if (!currentPath) return;
    const quickItem = quickAccessItems.find((item) => item.path === currentPath);
    if (quickItem) {
      setSelectedQuickAccessId(quickItem.id);
      setSelectedDeviceMountPoint(null);
      setSelectedRecentId(null);
      setRecentsSelected(false);
    } else {
      setSelectedQuickAccessId(null);
    }
  }, [currentPath, quickAccessItems]);

  // Sync place selection when navigating (highlight the place that contains currentPath)
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
        setRecentsSelected(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentPath]);

  // Initial load: set currentPath from sidebar selection when empty (only when not on Récents)
  useEffect(() => {
    if (currentPath || recentsSelected) return;
    let cancelled = false;
    (async () => {
      const path = await selectedItem.getPath();
      if (!cancelled) setCurrentPath(path);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentPath, recentsSelected, selectedItem, setCurrentPath]);

  return {
    currentPath,
    setCurrentPath,
    selectedItem,
    selectedDeviceMountPoint,
    selectedQuickAccessId,
    selectedRecentId,
    recentsSelected,
    devices,
    handleSelectRecents,
    handleSelectPlace,
    handleSelectQuickAccess,
    handleSelectRecent,
    handleSelectDevice,
  };
}
