import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RecentItem = {
  id: string;
  path: string;
  name: string;
  isDirectory: boolean;
  openedAt: number;
};

const MAX_RECENT = 25;

function nameFromPath(path: string, isDirectory: boolean): string {
  const segment = path.split(/[/\\]/).filter(Boolean).pop();
  return segment || (isDirectory ? "Folder" : "File");
}

interface State {
  items: RecentItem[];
  /** When true, main content shows recent files list (sidebar "Récents" selected). */
  recentsViewActive: boolean;
}

interface Actions {
  /** Add or bump a path in recent list (folders when navigating, files when opening). */
  add: (path: string, name?: string, isDirectory?: boolean) => void;
  remove: (id: string) => void;
  clear: () => void;
  setRecentsViewActive: (active: boolean) => void;
}

export const useRecentStore = create<State & Actions>()(
  persist(
    (set) => ({
      items: [],
      recentsViewActive: false,

      setRecentsViewActive: (active) => set({ recentsViewActive: active }),

      add: (path, name, isDirectory = false) => {
        const normalized = path.replace(/\/+$/, "") || path;
        const displayName = name ?? nameFromPath(normalized, isDirectory);
        set((state) => {
          const existing = state.items.find((item) => item.path === normalized);
          const rest = state.items.filter((item) => item.path !== normalized);
          const newItem: RecentItem = existing
            ? { ...existing, name: displayName, isDirectory, openedAt: Date.now() }
            : {
                id: crypto.randomUUID(),
                path: normalized,
                name: displayName,
                isDirectory,
                openedAt: Date.now(),
              };
          const next = [newItem, ...rest].slice(0, MAX_RECENT);
          return { items: next };
        });
      },

      remove: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: "recent-store", partialize: (s) => ({ items: s.items }) }
  )
);
