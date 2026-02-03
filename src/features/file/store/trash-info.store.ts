import { create } from "zustand";
import { fileApi } from "../file.api";

interface TrashInfoState {
  itemCount: number;
  totalSizeBytes: number;
  restoreAvailable: boolean;
  trashPath: string | null;
  isLoading: boolean;
  emptyDialogOpen: boolean;
}

interface TrashInfoActions {
  refetch: () => Promise<void>;
  openEmptyDialog: () => void;
  closeEmptyDialog: () => void;
}

export const useTrashInfoStore = create<TrashInfoState & TrashInfoActions>(
  (set, get) => ({
    itemCount: 0,
    totalSizeBytes: 0,
    restoreAvailable: false,
    trashPath: null,
    isLoading: false,
    emptyDialogOpen: false,

    refetch: async () => {
      set({ isLoading: true });
      try {
        const [info, path] = await Promise.all([
          fileApi.getTrashInfo(),
          fileApi.getTrashDir(),
        ]);
        set({
          itemCount: info.item_count,
          totalSizeBytes: info.total_size_bytes,
          restoreAvailable: info.restore_available,
          trashPath: path,
        });
      } catch {
        set({
          itemCount: 0,
          totalSizeBytes: 0,
          restoreAvailable: false,
          trashPath: null,
        });
      } finally {
        set({ isLoading: false });
      }
    },

    openEmptyDialog: () => set({ emptyDialogOpen: true }),
    closeEmptyDialog: () => set({ emptyDialogOpen: false }),
  })
);
