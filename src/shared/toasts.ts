import { toast } from "sonner";

/**
 * Centralized toast messages. Use these instead of calling toast.* directly
 * so all copy is in one place and easy to change or i18n later.
 */
export const toasts = {
  // Copy / Cut
  selectItemToCopy: () => toast.info("Select an item to copy"),
  copiedToClipboard: () => toast.success("Copied to clipboard"),
  selectItemToCut: () => toast.info("Select an item to cut"),
  cutToClipboard: () => toast.success("Cut to clipboard"),

  // Paste
  openFolderToPaste: () => toast.info("Open a folder to paste into"),
  clipboardEmpty: () => toast.info("Clipboard is empty"),
  pasted: () => toast.success("Pasted"),
  movedItems: (count: number) =>
    toast.success(`Moved ${count} item(s)`),
  pasteFailed: () => toast.error("Paste failed"),

  // Rename
  nameCannotBeEmpty: () => toast.info("Name cannot be empty"),
  nameNoPathSeparators: () =>
    toast.error("Name cannot contain path separators"),
  nameUnchanged: () => toast.info("Name unchanged"),
  renamed: () => toast.success("Renamed"),
  renameFailed: () => toast.error("Rename failed"),

  // Delete
  selectItemToDelete: () => toast.info("Select an item to delete"),
  movedToTrash: () => toast.success("Moved to Trash"),
  deleteFailed: () => toast.error("Delete failed"),

  // Create (file / folder)
  fileCreated: (name: string) => toast.success(`File "${name}" created`),
  folderCreated: (name: string) => toast.success(`Folder "${name}" created`),
  createFailed: (message: string) => toast.error(message),

  // Quick access
  alreadyInQuickAccess: () => toast.info("Already in Quick access"),
  addedToQuickAccess: (name: string) =>
    toast.success(`"${name}" added to Quick access`),
};
