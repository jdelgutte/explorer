import { useTheme as useNextTheme } from "next-themes";
import type { ThemeId, ResolvedThemeId } from "./theme.types";

export type { ThemeId, ResolvedThemeId };

/**
 * Theme hook: user preference (light | dark | system) and resolved theme.
 * Use setTheme to change preference; resolvedTheme is the actual applied theme when using system.
 */
export function useTheme() {
  const next = useNextTheme();
  const theme = (next.theme ?? "system") as ThemeId;
  const resolvedTheme = next.resolvedTheme as ResolvedThemeId | undefined;
  const setTheme = (value: ThemeId) => next.setTheme(value);
  return { theme, setTheme, resolvedTheme };
}
