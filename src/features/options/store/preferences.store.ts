import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  showHiddenFiles: boolean;
}

interface Actions {
  setShowHiddenFiles: (value: boolean) => void;
}

export const usePreferencesStore = create<State & Actions>()(
  persist(
    (set) => ({
      showHiddenFiles: false,
      setShowHiddenFiles: (showHiddenFiles) => set({ showHiddenFiles }),
    }),
    { name: "options-preferences" }
  )
);
