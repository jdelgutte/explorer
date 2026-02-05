import type { LucideIcon } from "lucide-react";
import { FilePlus, FolderPlus, Search, Trash2 } from "lucide-react";
import { useCreateDialogStore } from "@/features/file/store/create-dialog.store";
import { useTrashInfoStore } from "@/features/file/store/trash-info.store";
import { useSearchStore } from "@/features/search/store/search.store";
import { useCommandPaletteShortcut } from "@/features/command/useCommandPaletteShortcut";

/** Translation keys for command group headings. */
export type CommandGroupName = "command.group.search" | "command.group.create" | "command.group.trash";

export type CommandConfig = {
  group: CommandGroupName;
  /** Translation key for the command label. */
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
};

export function useCommandPalette() {
  const { open, onOpenChange } = useCommandPaletteShortcut();
  const openCreateDialog = useCreateDialogStore((state) => state.openCreateDialog);
  const openEmptyDialog = useTrashInfoStore((state) => state.openEmptyDialog);
  const setSearchDialogOpen = useSearchStore((state) => state.setSearchDialogOpen);

  const handleSelectCreate = (type: "file" | "folder") => {
    onOpenChange(false);
    openCreateDialog(type);
  };

  const handleSelectGlobalSearch = () => {
    onOpenChange(false);
    setSearchDialogOpen(true);
  };

  const handleSelectEmptyTrash = () => {
    onOpenChange(false);
    openEmptyDialog();
  };

  const commands: CommandConfig[] = [
    {
      group: "command.group.search",
      label: "command.globalSearch",
      icon: Search,
      onSelect: handleSelectGlobalSearch,
    },
    {
      group: "command.group.create",
      label: "command.createFile",
      icon: FilePlus,
      onSelect: () => handleSelectCreate("file"),
    },
    {
      group: "command.group.create",
      label: "command.createFolder",
      icon: FolderPlus,
      onSelect: () => handleSelectCreate("folder"),
    },
    {
      group: "command.group.trash",
      label: "command.emptyTrash",
      icon: Trash2,
      onSelect: handleSelectEmptyTrash,
    },
  ];

  const groups: CommandGroupName[] = ["command.group.search", "command.group.create", "command.group.trash"];

  return {
    open,
    onOpenChange,
    commands,
    groups,
  };
}

