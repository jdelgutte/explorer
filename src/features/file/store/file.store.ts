import type { DirEntry } from "@tauri-apps/plugin-fs";
import { useTabsStore } from "@/features/tabs/store/tabs.store";

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

function setEntries(entries: DirEntry[]): void {
  const tabs = useTabsStore.getState();
  const active = tabs.activeTabId;
  if (!active) return;
  const file = tabs.getFileState(active);
  tabs.setTabFile(active, { ...file, entries });
}

function setSelectedItem(entry: DirEntry | null): void {
  const tabs = useTabsStore.getState();
  const active = tabs.activeTabId;
  if (!active) return;
  const file = tabs.getFileState(active);
  tabs.setTabFile(active, { ...file, selectedItem: entry });
}

/** Facade over the active tab's file state in the tabs store. */
function useFileStore(): {
  entries: DirEntry[];
  selectedItem: DirEntry | null;
  setEntries: (entries: DirEntry[]) => void;
  setSelectedItem: (entry: DirEntry | null) => void;
};
function useFileStore<T>(
  selector: (state: {
    entries: DirEntry[];
    selectedItem: DirEntry | null;
    setEntries: (entries: DirEntry[]) => void;
    setSelectedItem: (entry: DirEntry | null) => void;
  }) => T
): T;
function useFileStore<T>(
  selector?: (state: {
    entries: DirEntry[];
    selectedItem: DirEntry | null;
    setEntries: (entries: DirEntry[]) => void;
    setSelectedItem: (entry: DirEntry | null) => void;
  }) => T
) {
  const file = useTabsStore((s) => s.getFileState(s.activeTabId));
  const state = { ...file, setEntries, setSelectedItem };
  if (selector) return selector(state) as T;
  return state;
}

useFileStore.getState = () => {
  const tabs = useTabsStore.getState();
  const file = tabs.getFileState(tabs.activeTabId);
  return {
    ...file,
    setEntries,
    setSelectedItem,
  };
};

export { useFileStore };
