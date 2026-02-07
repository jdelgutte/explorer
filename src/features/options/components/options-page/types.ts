import type { TFunction } from "i18next";

export type OptionsTabId =
  | "appearance"
  | "general"
  | "system"
  | "shortcuts"
  | "about";

/** Translation function passed to option tab components. */
export type OptionsTFunction = TFunction;
