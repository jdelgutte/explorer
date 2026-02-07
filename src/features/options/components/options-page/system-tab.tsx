import { Button } from "@/shared/components/ui/button";
import { OptionSectionHeader } from "./option-section-header";
import type { OptionsTFunction } from "./types";

export type SystemTabProps = {
  t: OptionsTFunction;
  onSetAsDefault: () => Promise<void>;
  onResetDefault: () => Promise<void>;
};

export function SystemTab({ t, onSetAsDefault, onResetDefault }: SystemTabProps) {
  return (
    <section className="space-y-3">
      <OptionSectionHeader
        title={t("options.defaultFileManager")}
        tooltip={t("options.setAsDefaultDescription")}
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={onSetAsDefault} variant="secondary">
          {t("options.setAsDefault")}
        </Button>
        <Button onClick={onResetDefault} variant="outline">
          {t("options.resetDefault")}
        </Button>
      </div>
    </section>
  );
}
