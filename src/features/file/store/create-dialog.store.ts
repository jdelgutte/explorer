import { create } from "zustand";

export type CreateType = "file" | "folder" | null;

interface State {
  open: boolean;
  createType: CreateType;
}

interface Actions {
  openCreateDialog: (type: "file" | "folder") => void;
  closeCreateDialog: () => void;
}

export const useCreateDialogStore = create<State & Actions>((set) => ({
  open: false,
  createType: null,
  openCreateDialog: (createType) => set({ open: true, createType }),
  closeCreateDialog: () => set({ open: false, createType: null }),
}));
