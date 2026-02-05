import { useEffect } from "react";
import { getInitialFolder } from "@/features/options/options.api";
import { useNavigationStore } from "./store/navigation.store";

/**
 * On mount, if the app was launched with a folder path (e.g. as default file manager),
 * navigates the current tab to that folder. The path is consumed once from the backend.
 */
export function useInitialFolder(): void {
  const setCurrentPath = useNavigationStore((s) => s.setCurrentPath);

  useEffect(() => {
    getInitialFolder().then((path) => {
      if (path) setCurrentPath(path);
    });
  }, [setCurrentPath]);
}
