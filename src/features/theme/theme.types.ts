/** User-facing theme preference: light, dark, or follow system. */
export type ThemeId = "light" | "dark" | "system";

/** Resolved theme after applying system preference (only when theme is "system"). */
export type ResolvedThemeId = "light" | "dark";
