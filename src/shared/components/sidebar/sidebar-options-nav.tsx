import { useTranslation } from "react-i18next";
import { Settings } from "lucide-react";
import { SidebarNavButton } from "@/shared/components/sidebar-nav-button";

type SidebarOptionsNavProps = {
  optionsSelected: boolean;
  handleSelectOptions: () => void;
};

export function SidebarOptionsNav({
  optionsSelected,
  handleSelectOptions,
}: SidebarOptionsNavProps) {
  const { t } = useTranslation();
  return (
    <nav className="flex flex-col gap-0.5 border-t border-sidebar-border p-2" aria-label={t("sidebar.options")}>
      <SidebarNavButton
        icon={<Settings />}
        label={t("sidebar.options")}
        isSelected={optionsSelected}
        onClick={handleSelectOptions}
      />
    </nav>
  );
}
