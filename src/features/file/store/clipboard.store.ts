import { create } from "zustand";

export type ClipboardMode = "copy" | "cut";

interface State {
  paths: string[];
  mode: ClipboardMode | null;
}

interface Actions {
  setClipboard: (paths: string[], mode: ClipboardMode) => void;
  clearClipboard: () => void;
}

export const useClipboardStore = create<State & Actions>((set) => ({
  paths: [],
  mode: null,
  setClipboard: (paths, mode) => set({ paths, mode }),
  clearClipboard: () => set({ paths: [], mode: null }),
}));
