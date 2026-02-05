import { create } from "zustand";

interface State {
  /** When true, main content shows the Options page. */
  optionsViewActive: boolean;
}

interface Actions {
  setOptionsViewActive: (active: boolean) => void;
}

export const useOptionsStore = create<State & Actions>()((set) => ({
  optionsViewActive: false,
  setOptionsViewActive: (active) => set({ optionsViewActive: active }),
}));
