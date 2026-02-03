import type { DirEntry } from "@tauri-apps/plugin-fs";
import { create } from "zustand";

interface State {
  open: boolean;
  entry: DirEntry | null;
  currentPath: string | null;
}

interface Actions {
  openPropertiesDialog: (entry: DirEntry, currentPath: string | null) => void;
  closePropertiesDialog: () => void;
}

export const usePropertiesDialogStore = create<State & Actions>((set) => ({
  open: false,
  entry: null,
  currentPath: null,
  openPropertiesDialog: (entry, currentPath) =>
    set({ open: true, entry, currentPath }),
  closePropertiesDialog: () =>
    set({ open: false, entry: null, currentPath: null }),
}));
