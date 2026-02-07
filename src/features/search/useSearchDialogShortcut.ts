import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { useEffect } from "react";
import { useSearchStore } from "@/features/search/store/search.store";

const SEARCH_DIALOG_SHORTCUT = "CommandOrControl+Shift+F";

export function useSearchDialogShortcut() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await register(SEARCH_DIALOG_SHORTCUT, () => {
          if (!cancelled) {
            useSearchStore.getState().setSearchDialogOpen(true);
          }
        });
      } catch (e) {
        console.error("Failed to register search dialog shortcut:", e);
      }
    })();
    return () => {
      cancelled = true;
      unregister(SEARCH_DIALOG_SHORTCUT).catch(() => {});
    };
  }, []);
}
