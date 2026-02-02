import type { DirEntry } from "@tauri-apps/plugin-fs";
import { create } from "zustand";

interface State {
  open: boolean;
  entry: DirEntry | null;
}

interface Actions {
  openRenameDialog: (entry: DirEntry) => void;
  closeRenameDialog: () => void;
}

export const useRenameDialogStore = create<State & Actions>((set) => ({
  open: false,
  entry: null,
  openRenameDialog: (entry) => set({ open: true, entry }),
  closeRenameDialog: () => set({ open: false, entry: null }),
}));
