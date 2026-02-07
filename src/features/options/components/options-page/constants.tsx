import { Monitor, HardDrive, Settings, Keyboard, Info } from "lucide-react";
import type { OptionsTabId } from "./types";

export const OPTIONS_TABS: {
  id: OptionsTabId;
  labelKey: string;
  icon: React.ReactNode;
}[] = [
  { id: "appearance", labelKey: "options.appearance", icon: <Monitor className="size-4" /> },
  { id: "general", labelKey: "options.general", icon: <Settings className="size-4" /> },
  {
    id: "system",
    labelKey: "options.defaultFileManager",
    icon: <HardDrive className="size-4" />,
  },
  { id: "shortcuts", labelKey: "options.shortcuts", icon: <Keyboard className="size-4" /> },
  { id: "about", labelKey: "options.about", icon: <Info className="size-4" /> },
];

/** Shared width for all Select triggers in options (consistent sizing). */
export const OPTIONS_SELECT_TRIGGER_CLASS = "w-[200px]";
