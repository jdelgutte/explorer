import { useCallback, useEffect, useRef } from "react";
import { fileApi, isAccessDeniedError } from "@/features/file/file.api";
import { useFileStore } from "@/features/file/store/file.store";
import { useNavigationStore } from "@/features/navigation/store/navigation.store";
import { usePreferencesStore } from "@/features/options/store/preferences.store";
import { toasts } from "@/shared/toasts";
import { UnwatchFn, watch } from "@tauri-apps/plugin-fs";

/**
 * Syncs the file store entries with the current navigation path.
 * When currentPath changes, fetches directory entries and updates the store.
 * On access denied, clears entries and shows a toast.
 * Call this once at app level (e.g. in App.tsx).
 */
export function useSyncEntriesToCurrentPath(): void {
  const currentPath = useNavigationStore((s) => s.currentPath);
  const unwatchRef = useRef<UnwatchFn | null>(null);

  const showHiddenFiles = usePreferencesStore((s) => s.showHiddenFiles);
  const refreshEntries = useCallback(async () => {
    if (!currentPath) return;
    try {
      const entries = await fileApi.getEntries(currentPath, { showHidden: showHiddenFiles });
      useFileStore.getState().setEntries(entries);
    } catch (err) {
      if (isAccessDeniedError(err)) toasts.accessDenied();
    }
  }, [currentPath, showHiddenFiles]);

  useEffect(() => {
    if (!currentPath) return;
    let cancelled = false;

    (async () => {
      try {
        if (!cancelled) await refreshEntries();
      } catch (err) {
        if (!cancelled && isAccessDeniedError(err)) toasts.accessDenied();
      }

      if (cancelled) return;
      const unwatch = await watch(
        currentPath,
        async () => {
          if (!cancelled) await refreshEntries();
        },
        { delayMs: 1000 }
      );
      if (cancelled) {
        unwatch();
        return;
      }
      unwatchRef.current = unwatch;
    })();

    return () => {
      cancelled = true;
      unwatchRef.current?.();
      unwatchRef.current = null;
    };
  }, [currentPath, refreshEntries]);
}