import { HardDrive } from "lucide-react";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarNavButton } from "@/shared/components/sidebar-nav-button";
import { QuickAccessList } from "@/features/quick-access/components/quick-access-list";
import type { SidebarSelection } from "./useSidebarSelection";
import { useQuickAccessStore } from "@/features/quick-access/store/quick-access.store";

type SidebarExplorerContentProps = Pick<
  SidebarSelection,
  | "selectedQuickAccessId"
  | "selectedDeviceMountPoint"
  | "devices"
  | "handleSelectQuickAccess"
  | "handleSelectDevice"
>;

export function SidebarExplorerContent({
  selectedQuickAccessId,
  selectedDeviceMountPoint,
  devices,
  handleSelectQuickAccess,
  handleSelectDevice,
}: SidebarExplorerContentProps) {
  return (
    <>
      {
        useQuickAccessStore.getState().items.length > 0 && (
          <>
          <Separator className="my-1" />
          <nav className="flex flex-col gap-0.5 p-2" aria-label="Quick access">
            <QuickAccessList
              selectedQuickAccessId={selectedQuickAccessId}
              onSelectQuickAccess={handleSelectQuickAccess}
            />
          </nav>
          </>
        )
      }
      <Separator className="my-1" />
      <nav className="flex flex-col gap-0.5 p-2" aria-label="Devices">
        <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
          Devices
        </p>
        {devices.map((device) => {
          const label = device.name || device.mount_point || "Unknown device";
          return (
            <SidebarNavButton
              key={device.mount_point}
              icon={<HardDrive />}
              label={label}
              isSelected={selectedDeviceMountPoint === device.mount_point}
              onClick={() => handleSelectDevice(device)}
              title={`${device.mount_point} (${device.file_system})`}
            />
          );
        })}
      </nav>
    </>
  );
}
