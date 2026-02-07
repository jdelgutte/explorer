import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/features/theme/useTheme";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { useLocaleStore } from "@/i18n/locale.store";
import {
  setAsDefaultFileManager,
  resetDefaultFileManager,
} from "@/features/options/options.api";
import { OPTIONS_TABS } from "./constants";
import type { OptionsTabId } from "./types";
import { AppearanceTab } from "./appearance-tab";
import { GeneralTab } from "./general-tab";
import { SystemTab } from "./system-tab";
import { ShortcutsTab } from "./shortcuts-tab";
import { AboutTab } from "./about-tab";

export type { OptionsTabId } from "./types";

export function OptionsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<OptionsTabId>("appearance");
  const { theme = "system", setTheme } = useTheme();
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

  const currentTheme = theme === "system" || !theme ? "system" : theme;
  const activeTabData = OPTIONS_TABS.find((tab) => tab.id === activeTab);

  return (
    <div className="h-full w-full overflow-auto">
      <div className="mx-auto flex h-full max-w-5xl flex-col gap-6 p-6">
        <div className="flex flex-1 flex-row gap-6 overflow-hidden">
          <aside
            className="flex w-12 shrink-0 flex-col gap-2 border-r pr-4 sm:w-3/12"
            aria-label={t("options.title")}
          >
            {OPTIONS_TABS.map(({ id, labelKey, icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? "secondary" : "ghost"}
                size="sm"
                className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-auto sm:w-full sm:justify-start sm:gap-2 sm:px-3 sm:py-2"
                onClick={() => setActiveTab(id)}
                aria-label={t(labelKey)}
                aria-current={activeTab === id ? "true" : undefined}
              >
                {icon}
                <span className="hidden sm:inline">{t(labelKey)}</span>
              </Button>
            ))}
          </aside>

          <div className="flex-1 overflow-auto rounded-lg border bg-card p-6">
            {activeTabData && (
              <div className="flex items-center gap-2">
                {activeTabData.icon}
                <span className="text-lg font-medium">{t(activeTabData.labelKey)}</span>
              </div>
            )}
            <div className="py-4">
              {activeTab === "appearance" && (
                <AppearanceTab
                  t={t}
                  currentTheme={currentTheme}
                  setTheme={setTheme}
                  locale={locale}
                  setLocale={setLocale}
                />
              )}
              {activeTab === "general" && <GeneralTab t={t} />}
              {activeTab === "system" && (
                <SystemTab
                  t={t}
                  onSetAsDefault={handleSetAsDefault}
                  onResetDefault={handleResetDefault}
                />
              )}
              {activeTab === "shortcuts" && <ShortcutsTab t={t} />}
              {activeTab === "about" && <AboutTab t={t} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
