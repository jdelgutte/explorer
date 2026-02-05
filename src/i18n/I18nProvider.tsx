import { useEffect } from "react";
import { useLocaleStore } from "./locale.store";
import { loadLocale } from "./i18n";
import i18n from "./i18n";

/**
 * Syncs persisted locale to i18next and lazy-loads non-default locale bundles.
 * Default (en) is already loaded in i18n.ts so the app renders immediately.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    let cancelled = false;
    loadLocale(locale).then(() => {
      if (!cancelled) {
        i18n.changeLanguage(locale);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return <>{children}</>;
}
