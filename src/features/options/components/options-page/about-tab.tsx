import { OptionSectionHeader } from "./option-section-header";
import type { OptionsTFunction } from "./types";

const VERSION = "0.1.0";

export type AboutTabProps = {
  t: OptionsTFunction;
};

export function AboutTab({ t }: AboutTabProps) {
  return (
    <section className="space-y-3">
      <OptionSectionHeader
        title={t("options.about")}
        tooltip={t("options.aboutDescription")}
      />
      <p className="text-sm text-muted-foreground">
        {t("options.version")}: {VERSION}
      </p>
    </section>
  );
}
