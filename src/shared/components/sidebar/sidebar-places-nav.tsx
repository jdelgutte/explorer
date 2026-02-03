import { Clock } from "lucide-react";
import { SidebarNavButton } from "@/shared/components/sidebar-nav-button";
import { SIDEBAR_ITEMS, type SidebarItem } from "./constants";
import type { SidebarSelection } from "./useSidebarSelection";

type SidebarPlacesNavProps = Pick<
  SidebarSelection,
  | "recentsSelected"
  | "selectedDeviceMountPoint"
  | "selectedItem"
  | "handleSelectRecents"
  | "handleSelectPlace"
>;

export function SidebarPlacesNav({
  recentsSelected,
  selectedDeviceMountPoint,
  selectedItem,
  handleSelectRecents,
  handleSelectPlace,
}: SidebarPlacesNavProps) {
  return (
    <nav className="flex flex-col gap-0.5 p-2" aria-label="Places">
      <SidebarNavButton
        icon={<Clock />}
        label="Récents"
        isSelected={recentsSelected && selectedDeviceMountPoint === null}
        onClick={handleSelectRecents}
      />
      {SIDEBAR_ITEMS.map((item) => (
        <SidebarNavButton
          key={item.id}
          icon={<item.icon />}
          label={item.label}
          isSelected={
            !recentsSelected &&
            selectedDeviceMountPoint === null &&
            selectedItem.id === item.id
          }
          onClick={() => handleSelectPlace(item)}
        />
      ))}
    </nav>
  );
}
