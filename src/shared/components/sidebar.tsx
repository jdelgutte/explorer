import { cn } from "@/lib/utils";
import { useSidebarSelection } from "./sidebar/useSidebarSelection";
import { SidebarPlacesNav } from "./sidebar/sidebar-places-nav";
import { SidebarContent } from "./sidebar/sidebar-content";

export type { SidebarItem, SidebarLocation } from "./sidebar/constants";
export { SIDEBAR_ITEMS } from "./sidebar/constants";

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const selection = useSidebarSelection();

  return (
    <aside
      className={cn(
        "flex w-52 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className
      )}
      aria-label="Places and devices"
    >
      <SidebarPlacesNav
        recentsSelected={selection.recentsSelected}
        selectedDeviceMountPoint={selection.selectedDeviceMountPoint}
        selectedItem={selection.selectedItem}
        handleSelectRecents={selection.handleSelectRecents}
        handleSelectPlace={selection.handleSelectPlace}
      />
      <div className="flex-1 min-h-0 overflow-auto">
        <SidebarContent
          selectedQuickAccessId={selection.selectedQuickAccessId}
          selectedDeviceMountPoint={selection.selectedDeviceMountPoint}
          devices={selection.devices}
          handleSelectQuickAccess={selection.handleSelectQuickAccess}
          handleSelectDevice={selection.handleSelectDevice}
        />
      </div>
    </aside>
  );
}
