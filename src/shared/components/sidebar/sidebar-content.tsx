import { SidebarExplorerContent } from "./sidebar-explorer-content";
import type { SidebarSelection } from "./useSidebarSelection";

type SidebarContentProps = Pick<
  SidebarSelection,
  | "selectedQuickAccessId"
  | "selectedDeviceMountPoint"
  | "devices"
  | "handleSelectQuickAccess"
  | "handleSelectDevice"
>;

export function SidebarContent(props: SidebarContentProps) {
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
