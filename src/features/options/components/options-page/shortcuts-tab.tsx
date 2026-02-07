import { Kbd } from "@/shared/components/ui/kbd";
import { OptionSectionHeader } from "./option-section-header";
import type { OptionsTFunction } from "./types";

const SHORTCUTS: { keys: string; labelKey: string }[] = [
  { keys: "Ctrl+K", labelKey: "options.shortcutCommandPalette" },
  { keys: "Ctrl+Shift+F", labelKey: "options.shortcutSearch" },
  { keys: "F2", labelKey: "options.shortcutRename" },
  { keys: "Ctrl+C", labelKey: "options.shortcutCopy" },
  { keys: "Ctrl+X", labelKey: "options.shortcutCut" },
  { keys: "Ctrl+V", labelKey: "options.shortcutPaste" },
  { keys: "Ctrl+Del", labelKey: "options.shortcutDelete" },
];

/** Splits "Ctrl+Shift+F" into ["Ctrl", "Shift", "F"] for per-key rendering. */
function shortcutKeys(combo: string): string[] {
  return combo.split("+").map((k) => k.trim());
}

export type ShortcutsTabProps = {
  t: OptionsTFunction;
};

export function ShortcutsTab({ t }: ShortcutsTabProps) {
  return (
    <section className="space-y-3">
      <OptionSectionHeader
        title={t("options.shortcuts")}
        tooltip={t("options.shortcutsDescription")}
      />
      <ul className="space-y-1.5 text-sm">
        {SHORTCUTS.map(({ keys, labelKey }) => (
          <li
            key={labelKey}
            className="flex items-center justify-between gap-4 rounded-md border border-border/60 bg-muted/20 px-4 py-2.5 transition-colors hover:bg-muted/30"
          >
            <span className="text-foreground">{t(labelKey)}</span>
            <span className="inline-flex shrink-0 items-center gap-1" role="group" aria-label={keys}>
              {shortcutKeys(keys).map((key) => (
                <Kbd key={key} className="px-2 py-0.5">
                  {key}
                </Kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
