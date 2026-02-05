import { useLocaleStore, type LocaleId } from "./locale.store";
import { Button } from "@/shared/components/ui/button";

const LOCALES: { id: LocaleId; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "fr", label: "FR" },
];

export function LanguageSwitcher() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <div className="flex rounded-lg border border-border/60 bg-muted/30 p-0.5" role="group" aria-label="Language">
      {LOCALES.map(({ id, label }) => (
        <Button
          key={id}
          type="button"
          variant={locale === id ? "secondary" : "ghost"}
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => setLocale(id)}
          aria-pressed={locale === id}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
