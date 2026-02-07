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
 * On access denied, clears entries and shows a toast; other errors are logged and a generic toast is shown.
 * Call this once at app level (e.g. in App.tsx).
 */
export function useSyncEntriesToCurrentPath(): void {
  const currentPath = useNavigationStore((s) => s.currentPath);
  const unwatchRef = useRef<UnwatchFn | null>(null);

  const showHiddenFiles = usePreferencesStore((s) => s.showHiddenFiles);
  const refreshEntries = useCallback(async () => {
    if (!currentPath) return;
    const { setEntries, setEntriesLoading } = useFileStore.getState();
    setEntriesLoading(true);
    try {
      const entries = await fileApi.getEntries(currentPath, { showHidden: showHiddenFiles });
      setEntries(entries);
    } catch (err) {
      if (isAccessDeniedError(err)) {
        toasts.accessDenied();
      } else {
        console.error("Sync entries failed", err);
        toasts.loadFolderFailed();
      }
    } finally {
      useFileStore.getState().setEntriesLoading(false);
    }
  }, [currentPath, showHiddenFiles]);

  useEffect(() => {
    if (!currentPath) return;
    let cancelled = false;

    (async () => {
      try {
        if (!cancelled) await refreshEntries();
      } catch (err) {
        if (!cancelled) {
          if (isAccessDeniedError(err)) toasts.accessDenied();
          else {
            console.error("Sync entries failed", err);
            toasts.loadFolderFailed();
          }
          useFileStore.getState().setEntriesLoading(false);
        }
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