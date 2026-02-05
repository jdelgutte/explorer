import { useEffect, useState } from "react";
import { useNavigationStore } from "@/features/navigation/store/navigation.store";
import { useMountableDevices } from "@/features/devices/useMountableDevices";
import type { MountableDevice } from "@/features/devices/devices.api";
import { useQuickAccessStore } from "@/features/quick-access/store/quick-access.store";
import type { QuickAccessItem } from "@/features/quick-access/store/quick-access.store";
import { useRecentStore } from "@/features/recent/store/recent.store";
import { SIDEBAR_ITEMS, type SidebarItem } from "./constants";

export type SidebarSelection = {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  selectedItem: SidebarItem;
  selectedDeviceMountPoint: string | null;
  selectedQuickAccessId: string | null;
  recentsSelected: boolean;
  devices: MountableDevice[];
  handleSelectRecents: () => void;
  handleSelectPlace: (item: SidebarItem) => void;
  handleSelectQuickAccess: (item: QuickAccessItem) => void;
  handleSelectDevice: (device: MountableDevice) => void;
};

export function useSidebarSelection(): SidebarSelection {
  const currentPath = useNavigationStore((state) => state.currentPath);
  const setCurrentPath = useNavigationStore((state) => state.setCurrentPath);
  const [selectedItem, setSelectedItem] = useState<SidebarItem>(SIDEBAR_ITEMS[0]);
  const [selectedDeviceMountPoint, setSelectedDeviceMountPoint] = useState<string | null>(null);
  const [selectedQuickAccessId, setSelectedQuickAccessId] = useState<string | null>(null);
  const devices = useMountableDevices();
  const quickAccessItems = useQuickAccessStore((s) => s.items);
  const recentsSelected = useRecentStore((s) => s.recentsViewActive);
  const setRecentsViewActive = useRecentStore((s) => s.setRecentsViewActive);

  const handleSelectRecents = () => {
    setRecentsViewActive(true);
    setSelectedDeviceMountPoint(null);
    setSelectedQuickAccessId(null);
  };

  const handleSelectPlace = async (item: SidebarItem) => {
    setRecentsViewActive(false);
    setSelectedItem(item);
    setSelectedDeviceMountPoint(null);
    setSelectedQuickAccessId(null);
    setCurrentPath(await item.getPath());
  };

  const handleSelectQuickAccess = (item: QuickAccessItem) => {
    setRecentsViewActive(false);
    setSelectedItem(SIDEBAR_ITEMS[0]);
    setSelectedDeviceMountPoint(null);
    setSelectedQuickAccessId(item.id);
    setCurrentPath(item.path);
  };

  const handleSelectDevice = (device: MountableDevice) => {
    setRecentsViewActive(false);
    setSelectedDeviceMountPoint(device.mount_point);
    setSelectedQuickAccessId(null);
    setCurrentPath(device.mount_point);
  };

  // Sync quick access selection when currentPath matches a quick access item
  useEffect(() => {
    if (!currentPath) return;
    const quickItem = quickAccessItems.find((item) => item.path === currentPath);
    if (quickItem) {
      setSelectedQuickAccessId(quickItem.id);
      setSelectedDeviceMountPoint(null);
      setRecentsViewActive(false);
    } else {
      setSelectedQuickAccessId(null);
    }
  }, [currentPath, quickAccessItems, setRecentsViewActive]);

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
        setRecentsViewActive(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentPath, setRecentsViewActive]);

  // Initial load: set currentPath from sidebar selection when empty (not when Recents is selected)
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
    recentsSelected,
    devices,
    handleSelectRecents,
    handleSelectPlace,
    handleSelectQuickAccess,
    handleSelectDevice,
  };
}
