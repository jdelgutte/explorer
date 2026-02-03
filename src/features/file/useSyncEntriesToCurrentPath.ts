import { useEffect } from "react";
import { fileApi, isAccessDeniedError } from "@/features/file/file.api";
import { useFileStore } from "@/features/file/store/file.store";
import { useNavigationStore } from "@/features/navigation/store/navigation.store";
import { toasts } from "@/shared/toasts";

/**
 * Syncs the file store entries with the current navigation path.
 * When currentPath changes, fetches directory entries and updates the store.
 * On access denied, clears entries and shows a toast.
 * Call this once at app level (e.g. in App.tsx).
 */
export function useSyncEntriesToCurrentPath(): void {
  const currentPath = useNavigationStore((s) => s.currentPath);

  useEffect(() => {
    if (!currentPath) return;
    let cancelled = false;
    (async () => {
      try {
        const entries = await fileApi.getEntries(currentPath);
        if (!cancelled) useFileStore.getState().setEntries(entries);
      } catch (err) {
        if (!cancelled) {
          useFileStore.getState().setEntries([]);
          if (isAccessDeniedError(err)) toasts.accessDenied();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentPath]);
}
