import { create } from "zustand";

interface State {
  /** Current folder path (also the path at navigationIndex in navigationStack). */
  currentPath: string;
  /** Stack of paths visited during navigation (currentPath is pushed when it changes). */
  navigationStack: string[];
  /** Index of current path in navigationStack (-1 when stack is empty). */
  navigationIndex: number;
}

interface Actions {
  setCurrentPath: (path: string) => void;
  goBack: () => void;
  goForward: () => void;
}

export const useNavigationStore = create<State & Actions>((set) => ({
  currentPath: "",
  navigationStack: [],
  navigationIndex: -1,
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
