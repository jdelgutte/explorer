import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { LocaleId } from "./locale.store";

// Default locale loaded synchronously so UI renders immediately (no loading flash).
import en from "./locales/en.json";

const DEFAULT_LOCALE: LocaleId = "en";

const resources: Record<LocaleId, { translation: Record<string, string> }> = {
  en: { translation: en as Record<string, string> },
  fr: { translation: {} }, // Loaded on demand in loadLocale()
};

/** Load a locale bundle (e.g. fr). Called when user switches to a non-default language. */
export async function loadLocale(locale: LocaleId): Promise<void> {
  if (locale === DEFAULT_LOCALE || Object.keys(resources[locale].translation).length > 0) {
    return;
  }
  // Explicit path so Vite creates a separate chunk (lazy load), not bundled in main.
  const mod = await import("./locales/fr.json");
  resources[locale].translation = mod.default as Record<string, string>;
  i18n.addResourceBundle(locale, "translation", resources[locale].translation, true, true);
}

export function getI18nResources(): Record<string, { translation: Record<string, string> }> {
  return resources as Record<string, { translation: Record<string, string> }>;
}

i18n.use(initReactI18next).init({
  resources: getI18nResources(),
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
