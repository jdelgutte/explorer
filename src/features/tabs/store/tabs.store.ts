import type { DirEntry } from "@tauri-apps/plugin-fs";
import { create } from "zustand";

/** Navigation state for a single tab (mirrors navigation.store shape). */
export interface TabNavigationState {
  currentPath: string;
  navigationStack: string[];
  navigationIndex: number;
}

/** File state for a single tab (mirrors file.store shape). */
export interface TabFileState {
  entries: DirEntry[];
  selectedItem: DirEntry | null;
}

export interface TabSlice {
  navigation: TabNavigationState;
  file: TabFileState;
}

export const DEFAULT_NAV: TabNavigationState = {
  currentPath: "",
  navigationStack: [],
  navigationIndex: -1,
};

export const DEFAULT_FILE: TabFileState = {
  entries: [],
  selectedItem: null,
};

function createDefaultTabSlice(): TabSlice {
  return {
    navigation: { ...DEFAULT_NAV },
    file: { ...DEFAULT_FILE },
  };
}

export interface TabMeta {
  id: string;
  label: string;
}

interface TabsState {
  tabs: TabMeta[];
  activeTabId: string | null;
  /** Per-tab navigation + file state. */
  tabState: Record<string, TabSlice>;
}

interface TabsActions {
  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  getActiveTabId: () => string | null;
  getNavigationState: (tabId: string | null) => TabNavigationState;
  getFileState: (tabId: string | null) => TabFileState;
  /** Raw setter: update navigation state for a tab. Used by navigation.store. */
  setTabNavigation: (tabId: string, state: TabNavigationState) => void;
  /** Raw setter: update file state for a tab. Used by file.store. */
  setTabFile: (tabId: string, state: TabFileState) => void;
}

const INITIAL_TAB_ID = "tab-initial";

export const useTabsStore = create<TabsState & TabsActions>((set, get) => ({
  tabs: [{ id: INITIAL_TAB_ID, label: "Home" }],
  activeTabId: INITIAL_TAB_ID,
  tabState: {
    [INITIAL_TAB_ID]: createDefaultTabSlice(),
  },

  addTab: () => {
    const id = `tab-${Date.now()}`;
    const label = "New tab";
    set((state) => ({
      tabs: [...state.tabs, { id, label }],
      activeTabId: id,
      tabState: {
        ...state.tabState,
        [id]: createDefaultTabSlice(),
      },
    }));
  },

  closeTab: (id) => {
    set((state) => {
      if (state.tabs.length <= 1) return state;
      const idx = state.tabs.findIndex((t) => t.id === id);
      if (idx === -1) return state;
      const newTabs = state.tabs.filter((t) => t.id !== id);
      const newState = { ...state.tabState };
      delete newState[id];
      let newActive = state.activeTabId;
      if (state.activeTabId === id) {
        if (newTabs.length === 0) newActive = null;
        else if (idx >= newTabs.length) newActive = newTabs[newTabs.length - 1].id;
        else newActive = newTabs[idx].id;
      }
      return {
        tabs: newTabs,
        activeTabId: newActive,
        tabState: newState,
      };
    });
  },

  setActiveTab: (id) => {
    set({ activeTabId: id });
  },

  getActiveTabId: () => get().activeTabId,

  getNavigationState: (tabId) => {
    const id = tabId ?? get().activeTabId;
    if (!id) return DEFAULT_NAV;
    return get().tabState[id]?.navigation ?? DEFAULT_NAV;
  },

  getFileState: (tabId) => {
    const id = tabId ?? get().activeTabId;
    if (!id) return DEFAULT_FILE;
    return get().tabState[id]?.file ?? DEFAULT_FILE;
  },

  setTabNavigation: (tabId, state) => {
    set((s) => {
      const slice = s.tabState[tabId] ?? createDefaultTabSlice();
      return {
        tabState: {
          ...s.tabState,
          [tabId]: { ...slice, navigation: state },
        },
      };
    });
  },

  setTabFile: (tabId, state) => {
    set((s) => {
      const slice = s.tabState[tabId] ?? createDefaultTabSlice();
      return {
        tabState: {
          ...s.tabState,
          [tabId]: { ...slice, file: state },
        },
      };
    });
  },
}));
