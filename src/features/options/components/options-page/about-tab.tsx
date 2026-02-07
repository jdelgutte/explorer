import { OptionSectionHeader } from "./option-section-header";
import type { OptionsTFunction } from "./types";

const VERSION = "0.1.0";
const SOURCE_URL = "https://github.com/jdelgutte/explorer";

export type AboutTabProps = {
  t: OptionsTFunction;
};

export function AboutTab({ t }: AboutTabProps) {
  return (
    <section className="flex flex-col items-center justify-center space-y-3 text-center">
      <OptionSectionHeader
        title={t("options.about")}
        tooltip={t("options.aboutDescription")}
      />
      <p className="text-sm text-muted-foreground">
        {t("options.aboutAppDescription")}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("options.version")}: {VERSION}
      </p>
      <a
        href={SOURCE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary underline underline-offset-4 hover:no-underline"
      >
        {t("options.sourceCode")}
      </a>
    </section>
  );
}
