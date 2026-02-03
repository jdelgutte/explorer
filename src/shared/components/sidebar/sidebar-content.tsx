import { RecentList } from "@/features/recent/components/recent-list";
import { SidebarExplorerContent } from "./sidebar-explorer-content";
import type { SidebarSelection } from "./useSidebarSelection";

type SidebarContentProps = Pick<
  SidebarSelection,
  | "recentsSelected"
  | "selectedRecentId"
  | "selectedQuickAccessId"
  | "selectedDeviceMountPoint"
  | "devices"
  | "handleSelectRecent"
  | "handleSelectQuickAccess"
  | "handleSelectDevice"
>;

export function SidebarContent(props: SidebarContentProps) {
  const { recentsSelected, selectedRecentId, handleSelectRecent } = props;

  if (recentsSelected) {
    return (
      <nav className="flex flex-col gap-0.5 p-2" aria-label="Récents">
        <RecentList
          selectedRecentId={selectedRecentId}
          onSelectRecent={handleSelectRecent}
        />
      </nav>
      
    );
  }

  return (
    <SidebarExplorerContent
      selectedQuickAccessId={props.selectedQuickAccessId}
      selectedDeviceMountPoint={props.selectedDeviceMountPoint}
      devices={props.devices}
      handleSelectQuickAccess={props.handleSelectQuickAccess}
      handleSelectDevice={props.handleSelectDevice}
    />
  );
}
