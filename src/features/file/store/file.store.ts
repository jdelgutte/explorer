import { DirEntry } from "@tauri-apps/plugin-fs";
import { create } from "zustand";

interface State {
  entries: DirEntry[];
  currentPath: string;
  selectedItem: DirEntry | null;
  /** Stack of paths visited during navigation (currentPath is pushed when it changes). */
  navigationStack: string[];
  /** Index of current path in navigationStack (-1 when stack is empty). */
  navigationIndex: number;
}

interface Actions {
  setEntries: (entries: DirEntry[]) => void;
  setCurrentPath: (path: string) => void;
  setSelectedItem: (entry: DirEntry | null) => void;
  goBack: () => void;
  goForward: () => void;
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
  navigationStack: [],
  navigationIndex: -1,
  setEntries: (entries) => set({ entries }),
  setCurrentPath: (path) =>
    set((state) => {
      if (path === "" || path === state.currentPath) return state;

      const { navigationStack, navigationIndex } = state;

      // Back: new path is the previous entry in stack
      if (
        navigationIndex > 0 &&
        navigationStack[navigationIndex - 1] === path
      ) {
        return {
          currentPath: path,
          navigationIndex: navigationIndex - 1,
        };
      }

      // Forward: new path is the next entry in stack
      if (
        navigationIndex < navigationStack.length - 1 &&
        navigationStack[navigationIndex + 1] === path
      ) {
        return {
          currentPath: path,
          navigationIndex: navigationIndex + 1,
        };
      }

      // New navigation: trim "forward" history, push path, move index to end
      const trimmedStack = navigationStack.slice(0, navigationIndex + 1);
      const newStack =
        trimmedStack[trimmedStack.length - 1] === path
          ? trimmedStack
          : [...trimmedStack, path];
      const newIndex = newStack.length - 1;

      return {
        currentPath: path,
        navigationStack: newStack,
        navigationIndex: newIndex,
      };
    }),
  setSelectedItem: (selectedItem) => set({ selectedItem }),
  goBack: () =>
    set((state) => {
      if (state.navigationIndex <= 0) return state;
      const newIndex = state.navigationIndex - 1;
      return {
        currentPath: state.navigationStack[newIndex],
        navigationIndex: newIndex,
      };
    }),
  goForward: () =>
    set((state) => {
      if (
        state.navigationIndex < 0 ||
        state.navigationIndex >= state.navigationStack.length - 1
      )
        return state;
      const newIndex = state.navigationIndex + 1;
      return {
        currentPath: state.navigationStack[newIndex],
        navigationIndex: newIndex,
      };
    }),
}));