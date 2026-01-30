import { DirEntry } from "@tauri-apps/plugin-fs";
import { create } from "zustand";

interface State {
  entries: DirEntry[];
  currentPath: string;
  selectedItem: DirEntry | null;
}

interface Actions {
  setEntries: (entries: DirEntry[]) => void;
  setCurrentPath: (path: string) => void;
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
  currentPath: "",
  selectedItem: null,
  setEntries: (entries) => set({ entries }),
  setCurrentPath: (path) => set({ currentPath: path }),
  setSelectedItem: (selectedItem) => set({ selectedItem }),
}));