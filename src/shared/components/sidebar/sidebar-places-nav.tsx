import { Clock } from "lucide-react";
import { useEffect } from "react";
import { SidebarNavButton } from "@/shared/components/sidebar-nav-button";
import { SIDEBAR_ITEMS } from "./constants";
import type { SidebarSelection } from "./useSidebarSelection";
import { useTrashInfoStore } from "@/features/file/store/trash-info.store";
import { formatFileSize } from "@/features/file/utils/format";

type SidebarPlacesNavProps = Pick<
  SidebarSelection,
  | "recentsSelected"
  | "selectedDeviceMountPoint"
  | "selectedItem"
  | "handleSelectRecents"
  | "handleSelectPlace"
>;

function TrashSuffix() {
  const itemCount = useTrashInfoStore((s) => s.itemCount);
  const totalSizeBytes = useTrashInfoStore((s) => s.totalSizeBytes);
  const isLoading = useTrashInfoStore((s) => s.isLoading);
  if (isLoading || (itemCount === 0 && totalSizeBytes === 0)) return null;
  const parts: string[] = [];
  if (itemCount > 0) parts.push(String(itemCount));
  if (totalSizeBytes > 0) parts.push(formatFileSize(totalSizeBytes));
  return <>{parts.join(" · ")}</>;
}

export function SidebarPlacesNav({
  recentsSelected,
  selectedDeviceMountPoint,
  selectedItem,
  handleSelectRecents,
  handleSelectPlace,
}: SidebarPlacesNavProps) {
  const refetch = useTrashInfoStore((s) => s.refetch);

  useEffect(() => {
    refetch();
  }, [refetch]);

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
          suffix={item.id === "trash" ? <TrashSuffix /> : undefined}
        />
      ))}
    </nav>
  );
}
