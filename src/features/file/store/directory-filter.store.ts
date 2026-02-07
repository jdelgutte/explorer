import { create } from "zustand";

interface State {
  /** Filter string for the current directory list (toolbar search). */
  directoryFilter: string;
}

interface Actions {
  setDirectoryFilter: (value: string) => void;
}

export const useDirectoryFilterStore = create<State & Actions>((set) => ({
  directoryFilter: "",
  setDirectoryFilter: (directoryFilter) => set({ directoryFilter }),
}));
