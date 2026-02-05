import { HardDrive } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <>
      {
        useQuickAccessStore.getState().items.length > 0 && (
          <>
          <Separator className="my-1" />
          <nav className="flex flex-col gap-0.5 p-2" aria-label={t("sidebar.quickAccess")}>
            <QuickAccessList
              selectedQuickAccessId={selectedQuickAccessId}
              onSelectQuickAccess={handleSelectQuickAccess}
            />
          </nav>
          </>
        )
      }
      <Separator className="my-1" />
      <nav className="flex flex-col gap-0.5 p-2" aria-label={t("sidebar.devices")}>
        <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
          {t("sidebar.devices")}
        </p>
        {devices.map((device) => {
          const label = device.name || device.mount_point || t("sidebar.unknownDevice");
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
