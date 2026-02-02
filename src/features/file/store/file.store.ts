import { DirEntry } from "@tauri-apps/plugin-fs";
import { create } from "zustand";

interface State {
  entries: DirEntry[];
  selectedItem: DirEntry | null;
}

interface Actions {
  setEntries: (entries: DirEntry[]) => void;
  setSelectedItem: (entry: DirEntry | null) => void;
}

export function isEntrySelected(
  entry: DirEntry,
  selectedItem: DirEntry | null
): boolean {
  return (
    selectedItem !== null &&
    selectedItem.name === entry.name &&
    selectedItem.isDirectory === entry.isDirectory
  );
}

export const useFileStore = create<State & Actions>((set) => ({
  entries: [],
  selectedItem: null,
  setEntries: (entries) => set({ entries }),
  setSelectedItem: (selectedItem) => set({ selectedItem }),
}));
