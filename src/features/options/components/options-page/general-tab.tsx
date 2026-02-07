import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { usePreferencesStore } from "@/features/options/store/preferences.store";
import { useViewStore, type ViewMode } from "@/features/viewmode/view.store";
import { OptionSectionHeader } from "./option-section-header";
import type { OptionsTFunction } from "./types";
import { OPTIONS_SELECT_TRIGGER_CLASS } from "./constants";

export type GeneralTabProps = {
  t: OptionsTFunction;
};

export function GeneralTab({ t }: GeneralTabProps) {
  const showHiddenFiles = usePreferencesStore((s) => s.showHiddenFiles);
  const setShowHiddenFiles = usePreferencesStore((s) => s.setShowHiddenFiles);
  const viewMode = useViewStore((s) => s.viewMode);
  const setViewMode = useViewStore((s) => s.setViewMode);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <OptionSectionHeader
          title={t("options.showHiddenFiles")}
          tooltip={t("options.showHiddenFilesDescription")}
        />
        <Select
          value={showHiddenFiles ? "yes" : "no"}
          onValueChange={(v) => setShowHiddenFiles(v === "yes")}
        >
          <SelectTrigger className={OPTIONS_SELECT_TRIGGER_CLASS}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no">{t("options.no")}</SelectItem>
            <SelectItem value="yes">{t("options.yes")}</SelectItem>
          </SelectContent>
        </Select>
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("options.defaultView")}
        </h2>
        <Select
          value={viewMode}
          onValueChange={(v) => setViewMode(v as ViewMode)}
        >
          <SelectTrigger className={OPTIONS_SELECT_TRIGGER_CLASS}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="list">{t("options.defaultViewList")}</SelectItem>
            <SelectItem value="grid">{t("options.defaultViewGrid")}</SelectItem>
          </SelectContent>
        </Select>
      </section>
    </div>
  );
}
