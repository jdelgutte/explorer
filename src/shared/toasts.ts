import { toast } from "sonner";
import i18n from "@/i18n/i18n";

/** Centralized toast messages. All copy is translated via i18n. */
export const toasts = {
  selectItemToCopy: () => toast.info(i18n.t("toast.selectItemToCopy")),
  copiedToClipboard: () => toast.success(i18n.t("toast.copiedToClipboard")),
  selectItemToCut: () => toast.info(i18n.t("toast.selectItemToCut")),
  cutToClipboard: () => toast.success(i18n.t("toast.cutToClipboard")),

  openFolderToPaste: () => toast.info(i18n.t("toast.openFolderToPaste")),
  clipboardEmpty: () => toast.info(i18n.t("toast.clipboardEmpty")),
  pasted: () => toast.success(i18n.t("toast.pasted")),
  movedItems: (count: number) =>
    toast.success(i18n.t("toast.movedItems", { count })),
  pasteFailed: () => toast.error(i18n.t("toast.pasteFailed")),

  nameCannotBeEmpty: () => toast.info(i18n.t("toast.nameCannotBeEmpty")),
  nameNoPathSeparators: () => toast.error(i18n.t("toast.nameNoPathSeparators")),
  nameUnchanged: () => toast.info(i18n.t("toast.nameUnchanged")),
  renamed: () => toast.success(i18n.t("toast.renamed")),
  renameFailed: () => toast.error(i18n.t("toast.renameFailed")),

  selectItemToDelete: () => toast.info(i18n.t("toast.selectItemToDelete")),
  movedToTrash: () => toast.success(i18n.t("toast.movedToTrash")),
  deleteFailed: () => toast.error(i18n.t("toast.deleteFailed")),

  trashEmptied: () => toast.success(i18n.t("toast.trashEmptied")),
  emptyTrashFailed: (message: string) => toast.error(message),

  restoredFromTrash: (count: number) =>
    toast.success(
      count === 1
        ? i18n.t("toast.restoredOne")
        : i18n.t("toast.restoredMany", { count })
    ),
  restoreFromTrashFailed: (message: string) => toast.error(message),

  fileCreated: (name: string) =>
    toast.success(i18n.t("toast.fileCreated", { name })),
  folderCreated: (name: string) =>
    toast.success(i18n.t("toast.folderCreated", { name })),
  createFailed: (message: string) => toast.error(message),

  alreadyInQuickAccess: () =>
    toast.info(i18n.t("toast.alreadyInQuickAccess")),
  addedToQuickAccess: (name: string) =>
    toast.success(i18n.t("toast.addedToQuickAccess", { name })),

  accessDenied: () => toast.error(i18n.t("toast.accessDenied")),

  error: (message: string) => toast.error(message),
};
