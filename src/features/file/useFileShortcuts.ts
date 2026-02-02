import { useEffect } from "react";
import { doCopy, doCut, doPaste, doDelete } from "./file.actions";

/** Returns true if the element is an editable field (we should not steal Ctrl+C/X/V). */
function isEditableElement(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea") return true;
  if (el.isContentEditable) return true;
  return false;
}

/**
 * Registers Ctrl+C / Ctrl+X / Ctrl+V / Ctrl+Suppr via JavaScript keydown (not Tauri global shortcut)
 * so they don't conflict with the system. Only handles when focus is not in an input/textarea.
 * Calls the same actions as the context menu (DRY).
 */
export function useFileShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditableElement(e.target)) return;
      const isMac =
        (navigator as Navigator & { userAgentData?: { platform: string } })
          .userAgentData?.platform === "macOS" || /mac/i.test(navigator.userAgent);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;

      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        doCopy();
        return;
      }
      if (e.key.toLowerCase() === "x") {
        e.preventDefault();
        doCut();
        return;
      }
      if (e.key.toLowerCase() === "v") {
        e.preventDefault();
        doPaste();
        return;
      }
      if (e.key === "Delete") {
        e.preventDefault();
        doDelete();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, []);
}
