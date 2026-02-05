import type { LucideIcon } from "lucide-react";
import { FilePlus, FolderPlus, Search, Trash2 } from "lucide-react";
import { useCreateDialogStore } from "@/features/file/store/create-dialog.store";
import { useTrashInfoStore } from "@/features/file/store/trash-info.store";
import { useSearchStore } from "@/features/search/store/search.store";
import { useCommandPaletteShortcut } from "@/features/command/useCommandPaletteShortcut";

export type CommandGroupName = "Search" | "Create" | "Trash";

export type CommandConfig = {
  group: CommandGroupName;
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
      group: "Search",
      label: "Global search",
      icon: Search,
      onSelect: handleSelectGlobalSearch,
    },
    {
      group: "Create",
      label: "Create file",
      icon: FilePlus,
      onSelect: () => handleSelectCreate("file"),
    },
    {
      group: "Create",
      label: "Create folder",
      icon: FolderPlus,
      onSelect: () => handleSelectCreate("folder"),
    },
    {
      group: "Trash",
      label: "Empty trash",
      icon: Trash2,
      onSelect: handleSelectEmptyTrash,
    },
  ];

  const groups: CommandGroupName[] = ["Search", "Create", "Trash"];

  return {
    open,
    onOpenChange,
    commands,
    groups,
  };
}

