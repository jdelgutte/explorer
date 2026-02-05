import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LocaleId = "en" | "fr";

type LocaleStore = {
  locale: LocaleId;
  setLocale: (locale: LocaleId) => void;
};

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "explorer-locale" }
  )
);
