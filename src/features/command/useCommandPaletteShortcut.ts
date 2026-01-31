import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { useCallback, useEffect, useState } from "react";

const COMMAND_PALETTE_SHORTCUT = "CommandOrControl+K";

export function useCommandPaletteShortcut() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await register(COMMAND_PALETTE_SHORTCUT, () => {
          if (!cancelled) setOpen(true);
        });
      } catch (e) {
        console.error("Failed to register command palette shortcut:", e);
      }
    })();
    return () => {
      cancelled = true;
      unregister(COMMAND_PALETTE_SHORTCUT).catch(() => {});
    };
  }, []);

  const onOpenChange = useCallback((next: boolean) => setOpen(next), []);

  return { open, onOpenChange };
}
