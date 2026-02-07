import { create } from "zustand";
import { persist } from "zustand/middleware";
import { pathBasename } from "@/lib/path-utils";

export type QuickAccessItem = {
  id: string;
  path: string;
  name: string;
};

interface State {
  items: QuickAccessItem[];
}

interface Actions {
  add: (path: string, name: string) => void;
  remove: (id: string) => void;
  removeByPath: (path: string) => void;
  hasPath: (path: string) => boolean;
}

export const useQuickAccessStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      items: [],

      add: (path, name) => {
        const { items } = get();
        if (items.some((item) => item.path === path)) return;
        set({
          items: [
            ...items,
            { id: crypto.randomUUID(), path, name: name || pathBasename(path, "Folder") },
          ],
        });
      },

      remove: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      removeByPath: (path) =>
        set((state) => ({
          items: state.items.filter((item) => item.path !== path),
        })),

      hasPath: (path) => get().items.some((item) => item.path === path),
    }),
    { name: "quick-access-store" }
  )
);
