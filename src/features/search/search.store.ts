import { DirEntry } from "@tauri-apps/plugin-fs";
import { create } from "zustand";

interface State {
  query: string;
  queryResults: DirEntry[];
}

interface Actions {
  setQuery: (query: string) => void;
}

export const useSearchStore = create<State & Actions>((set) => ({
  query: "",
  queryResults: [],
  setQuery: (query) => set({ query }),
}));