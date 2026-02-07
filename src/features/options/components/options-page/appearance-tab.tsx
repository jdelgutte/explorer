import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { LocaleId } from "@/i18n/locale.store";
import type { ThemeId } from "@/features/theme/useTheme";
import type { OptionsTFunction } from "./types";
import { OPTIONS_SELECT_TRIGGER_CLASS } from "./constants";

export type AppearanceTabProps = {
  t: OptionsTFunction;
  currentTheme: string;
  setTheme: (value: ThemeId) => void;
  locale: LocaleId;
  setLocale: (value: LocaleId) => void;
};

export function AppearanceTab({
  t,
  currentTheme,
  setTheme,
  locale,
  setLocale,
}: AppearanceTabProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            {t("options.theme")}
          </div>
          <Select value={currentTheme} onValueChange={(value) => setTheme(value as ThemeId)}>
            <SelectTrigger className={OPTIONS_SELECT_TRIGGER_CLASS}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">{t("options.themeSystem")}</SelectItem>
              <SelectItem value="light">{t("options.themeLight")}</SelectItem>
              <SelectItem value="dark">{t("options.themeDark")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("options.language")}
        </h2>
        <Select value={locale} onValueChange={(value) => setLocale(value as LocaleId)}>
          <SelectTrigger className={OPTIONS_SELECT_TRIGGER_CLASS}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t("options.languageEn")}</SelectItem>
            <SelectItem value="fr">{t("options.languageFr")}</SelectItem>
          </SelectContent>
        </Select>
      </section>
    </div>
  );
}
