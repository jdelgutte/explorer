import { create } from "zustand";

export type ListColumnId = "name" | "type" | "size" | "dateModified";

const DEFAULT_COLUMNS: Record<ListColumnId, boolean> = {
  name: true,
  type: true,
  size: true,
  dateModified: true,
};

interface State {
  columns: Record<ListColumnId, boolean>;
}

interface Actions {
  setColumnVisible: (id: ListColumnId, visible: boolean) => void;
  toggleColumn: (id: ListColumnId) => void;
}

export const useListColumnsStore = create<State & Actions>((set) => ({
  columns: { ...DEFAULT_COLUMNS },
  setColumnVisible: (id, visible) =>
    set((s) => ({
      columns: { ...s.columns, [id]: visible },
    })),
  toggleColumn: (id) =>
    set((s) => ({
      columns: { ...s.columns, [id]: !s.columns[id] },
    })),
}));
