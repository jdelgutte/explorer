import { create } from "zustand";

export type ViewMode = "list" | "grid";

interface ViewState {
  viewMode: ViewMode;
}

interface ViewActions {
  setViewMode: (mode: ViewMode) => void;
}

import { persist } from "zustand/middleware";

export const useViewStore = create<ViewState & ViewActions>()(
  persist(
    (set) => ({
      viewMode: "list",
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    {
      name: "view-mode-store",
    }
  )
);
