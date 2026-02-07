import type { SearchResult } from "@/features/search/search.api";
import { searchApi } from "@/features/search/search.api";
import { create } from "zustand";

interface State {
  searchDialogOpen: boolean;
  query: string;
  rootPath: string;
  queryResults: SearchResult[];
  isLoading: boolean;
  currentSearchId: string | null;
}

interface Actions {
  setSearchDialogOpen: (open: boolean) => void;
  setQuery: (query: string) => void;
  setRootPath: (path: string) => void;
  appendResults: (searchId: string, results: SearchResult[]) => void;
  setSearchDone: (searchId: string) => void;
  clearResults: () => void;
  startSearch: (rootPath: string, query: string) => Promise<void>;
}

export const useSearchStore = create<State & Actions>((set, get) => ({
  searchDialogOpen: false,
  query: "",
  rootPath: "",
  queryResults: [],
  isLoading: false,
  currentSearchId: null,

  setSearchDialogOpen: (searchDialogOpen) => set({ searchDialogOpen }),
  setQuery: (query) => set({ query }),
  setRootPath: (rootPath) => set({ rootPath }),

  appendResults: (searchId, results) => {
    const { currentSearchId, queryResults } = get();
    if (searchId !== currentSearchId) return;
    set({ queryResults: [...queryResults, ...results] });
  },

  setSearchDone: (searchId) => {
    const { currentSearchId } = get();
    if (searchId !== currentSearchId) return;
    set({ isLoading: false, currentSearchId: null });
  },

  clearResults: () =>
    set({
      queryResults: [],
      isLoading: false,
      currentSearchId: null,
    }),

  startSearch: async (rootPath, query) => {
    const searchId = crypto.randomUUID();
    set({
      rootPath,
      query,
      queryResults: [],
      isLoading: true,
      currentSearchId: searchId,
    });

    try {
      await searchApi.startSearch(rootPath, query, searchId);
    } catch (e) {
      console.error("Search failed:", e);
      set({ isLoading: false, currentSearchId: null });
    }
  },
}));
