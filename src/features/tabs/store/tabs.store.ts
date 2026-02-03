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
  selectedItems: DirEntry[];
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
  selectedItems: [],
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
  /** Tab IDs selected with Ctrl+click (multi-select). */
  selectedTabIds: string[];
}

interface TabsActions {
  addTab: () => void;
  closeTab: (id: string) => void;
  /** Close all tabs whose IDs are in the current selection (e.g. after multi-select). */
  closeSelectedTabs: () => void;
  setActiveTab: (id: string) => void;
  /** Select a tab. With additive (e.g. Ctrl+click), toggles this tab in selection; otherwise selects only this tab. */
  selectTab: (id: string, additive: boolean) => void;
  clearTabSelection: () => void;
  renameTab: (id: string, label: string) => void;
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
  selectedTabIds: [],

  addTab: () => {
    const id = `tab-${Date.now()}`;
    const label = "New tab";
    set((state) => ({
      tabs: [...state.tabs, { id, label }],
      activeTabId: id,
      selectedTabIds: [],
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
        selectedTabIds: state.selectedTabIds.filter((sid) => sid !== id),
      };
    });
  },

  closeSelectedTabs: () => {
    const { selectedTabIds } = get();
    if (selectedTabIds.length === 0) return;
    set((state) => {
      const toRemove = new Set(selectedTabIds);
      const newTabs = state.tabs.filter((t) => !toRemove.has(t.id));
      if (newTabs.length === 0) return state;
      const newState = { ...state.tabState };
      for (const id of toRemove) delete newState[id];
      const activeId = state.activeTabId;
      let newActive = activeId;
      if (activeId && toRemove.has(activeId)) {
        const idx = state.tabs.findIndex((t) => t.id === activeId);
        if (idx >= newTabs.length) newActive = newTabs[newTabs.length - 1].id;
        else newActive = newTabs[Math.min(idx, newTabs.length - 1)].id;
      }
      return {
        tabs: newTabs,
        activeTabId: newActive,
        tabState: newState,
        selectedTabIds: [],
      };
    });
  },

  setActiveTab: (id) => {
    set({ activeTabId: id });
  },

  selectTab: (id, additive) => {
    set((state) => {
      if (additive) {
        const set = new Set(state.selectedTabIds);
        if (set.has(id)) set.delete(id);
        else set.add(id);
        return { selectedTabIds: [...set], activeTabId: id };
      }
      return { selectedTabIds: [id], activeTabId: id };
    });
  },

  clearTabSelection: () => {
    set({ selectedTabIds: [] });
  },

  renameTab: (id, label) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, label: trimmed } : t)),
    }));
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
