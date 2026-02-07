import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme, type ThemeId } from "@/features/theme/useTheme";
import { toast } from "sonner";
import {
  Monitor,
  HardDrive,
  Settings,
  Keyboard,
  Info,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
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
import { usePreferencesStore } from "@/features/options/store/preferences.store";
import { useViewStore, type ViewMode } from "@/features/viewmode/view.store";

export type OptionsTabId = "appearance" | "general" | "system" | "shortcuts" | "about";

const OPTIONS_TABS: { id: OptionsTabId; labelKey: string; icon: React.ReactNode }[] = [
  { id: "appearance", labelKey: "options.appearance", icon: <Monitor className="size-4" /> },
  { id: "general", labelKey: "options.general", icon: <Settings className="size-4" /> },
  { id: "system", labelKey: "options.defaultFileManager", icon: <HardDrive className="size-4" /> },
  { id: "shortcuts", labelKey: "options.shortcuts", icon: <Keyboard className="size-4" /> },
  { id: "about", labelKey: "options.about", icon: <Info className="size-4" /> },
];

/** Shared width for all Select triggers in options (consistent sizing). */
const OPTIONS_SELECT_TRIGGER_CLASS = "w-[200px]";

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

type AppearanceTabProps = {
  t: ReturnType<typeof useTranslation>["t"];
  currentTheme: string;
  setTheme: (value: ThemeId) => void;
  locale: LocaleId;
  setLocale: (value: LocaleId) => void;
};

function AppearanceTab({
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
              <SelectItem value="system">
                {t("options.themeSystem")}
              </SelectItem>
              <SelectItem value="light">
                {t("options.themeLight")}
              </SelectItem>
              <SelectItem value="dark">
                {t("options.themeDark")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("options.language")}
        </h2>
        <Select
          value={locale}
          onValueChange={(value) => setLocale(value as LocaleId)}
        >
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

type SystemTabProps = {
  t: ReturnType<typeof useTranslation>["t"];
  onSetAsDefault: () => Promise<void>;
  onResetDefault: () => Promise<void>;
};

function SystemTab({ t, onSetAsDefault, onResetDefault }: SystemTabProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-1.5">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("options.defaultFileManager")}
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label={t("options.setAsDefaultDescription")}
            >
              <HelpCircle className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            {t("options.setAsDefaultDescription")}
          </TooltipContent>
        </Tooltip>
      </div>
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

type GeneralTabProps = { t: ReturnType<typeof useTranslation>["t"] };

function GeneralTab({ t }: GeneralTabProps) {
  const showHiddenFiles = usePreferencesStore((s) => s.showHiddenFiles);
  const setShowHiddenFiles = usePreferencesStore((s) => s.setShowHiddenFiles);
  const viewMode = useViewStore((s) => s.viewMode);
  const setViewMode = useViewStore((s) => s.setViewMode);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-medium text-muted-foreground">
            {t("options.showHiddenFiles")}
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={t("options.showHiddenFilesDescription")}
              >
                <HelpCircle className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              {t("options.showHiddenFilesDescription")}
            </TooltipContent>
          </Tooltip>
        </div>
        <Select
          value={showHiddenFiles ? "yes" : "no"}
          onValueChange={(v) => setShowHiddenFiles(v === "yes")}
        >
          <SelectTrigger className={OPTIONS_SELECT_TRIGGER_CLASS}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no">{t("options.no")}</SelectItem>
            <SelectItem value="yes">{t("options.yes")}</SelectItem>
          </SelectContent>
        </Select>
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("options.defaultView")}
        </h2>
        <Select
          value={viewMode}
          onValueChange={(v) => setViewMode(v as ViewMode)}
        >
          <SelectTrigger className={OPTIONS_SELECT_TRIGGER_CLASS}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="list">{t("options.defaultViewList")}</SelectItem>
            <SelectItem value="grid">{t("options.defaultViewGrid")}</SelectItem>
          </SelectContent>
        </Select>
      </section>
    </div>
  );
}

type ShortcutsTabProps = { t: ReturnType<typeof useTranslation>["t"] };

function ShortcutsTab({ t }: ShortcutsTabProps) {
  const shortcuts: { keys: string; labelKey: string }[] = [
    { keys: "Ctrl+K", labelKey: "options.shortcutCommandPalette" },
    { keys: "Ctrl+Shift+F", labelKey: "options.shortcutSearch" },
    { keys: "F2", labelKey: "options.shortcutRename" },
    { keys: "Ctrl+C", labelKey: "options.shortcutCopy" },
    { keys: "Ctrl+X", labelKey: "options.shortcutCut" },
    { keys: "Ctrl+V", labelKey: "options.shortcutPaste" },
    { keys: "Ctrl+Del", labelKey: "options.shortcutDelete" },
  ];
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-1.5">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("options.shortcuts")}
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label={t("options.shortcutsDescription")}
            >
              <HelpCircle className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            {t("options.shortcutsDescription")}
          </TooltipContent>
        </Tooltip>
      </div>
      <ul className="space-y-2 text-sm">
        {shortcuts.map(({ keys, labelKey }) => (
          <li
            key={labelKey}
            className="flex items-center justify-between gap-4 rounded border bg-muted/30 px-3 py-2"
          >
            <span>{t(labelKey)}</span>
            <kbd className="font-mono text-xs text-muted-foreground">{keys}</kbd>
          </li>
        ))}
      </ul>
    </section>
  );
}

type AboutTabProps = { t: ReturnType<typeof useTranslation>["t"] };

function AboutTab({ t }: AboutTabProps) {
  const version = "0.1.0";
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-1.5">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("options.about")}
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label={t("options.aboutDescription")}
            >
              <HelpCircle className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            {t("options.aboutDescription")}
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("options.version")}: {version}
      </p>
    </section>
  );
}
