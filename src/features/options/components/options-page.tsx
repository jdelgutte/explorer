import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useLocaleStore, type LocaleId } from "@/i18n/locale.store";
import {
  setAsDefaultFileManager,
  resetDefaultFileManager,
} from "@/features/options/options.api";

export function OptionsPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  async function handleSetAsDefault() {
    try {
      await setAsDefaultFileManager();
      toast.success(t("options.setAsDefaultSuccess"));
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(t("options.setAsDefaultError", { message }));
    }
  }

  async function handleResetDefault() {
    try {
      await resetDefaultFileManager();
      toast.success(t("options.resetDefaultSuccess"));
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(t("options.resetDefaultError", { message }));
    }
  }

  return (
    <div className="p-6 max-w-xl space-y-8">
      <h1 className="text-xl font-semibold">{t("options.title")}</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("options.language")}
        </h2>
        <Select
          value={locale}
          onValueChange={(value) => setLocale(value as LocaleId)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t("options.languageEn")}</SelectItem>
            <SelectItem value="fr">{t("options.languageFr")}</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("options.defaultFileManager")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("options.setAsDefaultDescription")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSetAsDefault} variant="secondary">
            {t("options.setAsDefault")}
          </Button>
          <Button onClick={handleResetDefault} variant="outline">
            {t("options.resetDefault")}
          </Button>
        </div>
      </section>
    </div>
  );
}
