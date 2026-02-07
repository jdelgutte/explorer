import type { DirEntry } from "@tauri-apps/plugin-fs";
import { useTabsStore } from "@/features/tabs/store/tabs.store";

/**
 * Facade over the active tab's file state in the tabs store.
 * This is not a standalone Zustand store; it reads/writes via useTabsStore.
 */

/** Same entry = same name and type (file/dir). */
function sameEntry(a: DirEntry, b: DirEntry): boolean {
  return a.name === b.name && a.isDirectory === b.isDirectory;
}

export function isEntrySelected(
  entry: DirEntry,
  selectedItems: DirEntry[],
): boolean {
  return selectedItems.some((s) => sameEntry(s, entry));
}

function setEntries(entries: DirEntry[]): void {
  const tabs = useTabsStore.getState();
  const active = tabs.activeTabId;
  if (!active) return;
  const file = tabs.getFileState(active);
  tabs.setTabFile(active, { ...file, entries, entriesLoading: false });
}

function setEntriesLoading(loading: boolean): void {
  const tabs = useTabsStore.getState();
  const active = tabs.activeTabId;
  if (!active) return;
  const file = tabs.getFileState(active);
  tabs.setTabFile(active, { ...file, entriesLoading: loading });
}

/** Select one entry (replace selection) or toggle in selection when additive (e.g. Ctrl+click). */
function selectEntry(entry: DirEntry, additive: boolean): void {
  const tabs = useTabsStore.getState();
  const active = tabs.activeTabId;
  if (!active) return;
  const file = tabs.getFileState(active);
  if (!additive) {
    tabs.setTabFile(active, { ...file, selectedItems: [entry] });
    return;
  }
  const current = file.selectedItems;
  const idx = current.findIndex((s) => sameEntry(s, entry));
  let next: DirEntry[];
  if (idx === -1) {
    next = [...current, entry];
  } else {
    next = current.filter((_, i) => i !== idx);
  }
  tabs.setTabFile(active, { ...file, selectedItems: next });
}

function clearSelection(): void {
  const tabs = useTabsStore.getState();
  const active = tabs.activeTabId;
  if (!active) return;
  const file = tabs.getFileState(active);
  tabs.setTabFile(active, { ...file, selectedItems: [] });
}

function useFileStore(): {
  entries: DirEntry[];
  selectedItems: DirEntry[];
  /** True while directory entries are being fetched. */
  entriesLoading: boolean;
  /** Focused item (last in selection), for F2 rename / single-item actions. */
  selectedItem: DirEntry | null;
  setEntries: (entries: DirEntry[]) => void;
  setEntriesLoading: (loading: boolean) => void;
  selectEntry: (entry: DirEntry, additive: boolean) => void;
  clearSelection: () => void;
};
function useFileStore<T>(
  selector: (state: {
    entries: DirEntry[];
    selectedItems: DirEntry[];
    entriesLoading: boolean;
    selectedItem: DirEntry | null;
    setEntries: (entries: DirEntry[]) => void;
    setEntriesLoading: (loading: boolean) => void;
    selectEntry: (entry: DirEntry, additive: boolean) => void;
    clearSelection: () => void;
  }) => T,
): T;
function useFileStore<T>(
  selector?: (state: {
    entries: DirEntry[];
    selectedItems: DirEntry[];
    entriesLoading: boolean;
    selectedItem: DirEntry | null;
    setEntries: (entries: DirEntry[]) => void;
    setEntriesLoading: (loading: boolean) => void;
    selectEntry: (entry: DirEntry, additive: boolean) => void;
    clearSelection: () => void;
  }) => T,
) {
  const file = useTabsStore((s) => s.getFileState(s.activeTabId));
  const selectedItem =
    file.selectedItems.length > 0
      ? file.selectedItems[file.selectedItems.length - 1]
      : null;
  const state = {
    ...file,
    selectedItem,
    setEntries,
    setEntriesLoading,
    selectEntry,
    clearSelection,
  };
  if (selector) return selector(state) as T;
  return state;
}

useFileStore.getState = () => {
  const tabs = useTabsStore.getState();
  const file = tabs.getFileState(tabs.activeTabId);
  const selectedItem =
    file.selectedItems.length > 0
      ? file.selectedItems[file.selectedItems.length - 1]
      : null;
  return {
    ...file,
    selectedItem,
    setEntries,
    setEntriesLoading,
    selectEntry,
    clearSelection,
  };
};

export { useFileStore };
