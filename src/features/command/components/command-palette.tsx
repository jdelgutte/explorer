"use client";

import { FilePlus, FolderPlus, Search, Trash2 } from "lucide-react";
import { useCreateDialogStore } from "@/features/file/store/create-dialog.store";
import { useTrashInfoStore } from "@/features/file/store/trash-info.store";
import { useSearchStore } from "@/features/search/store/search.store";
import { useCommandPaletteShortcut } from "@/features/command/useCommandPaletteShortcut";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";

export function CommandPalette() {
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

  return (
    <CommandDialog
      title="Command Palette"
      description="Create a file or folder in the current directory."
      open={open}
      onOpenChange={onOpenChange}
    >
      <CommandInput placeholder="Search commands..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Search">
          <CommandItem onSelect={handleSelectGlobalSearch}>
            <Search className="size-4" />
            Global search
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Create">
          <CommandItem onSelect={() => handleSelectCreate("file")}>
            <FilePlus className="size-4" />
            Create file
          </CommandItem>
          <CommandItem onSelect={() => handleSelectCreate("folder")}>
            <FolderPlus className="size-4" />
            Create folder
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Trash">
          <CommandItem onSelect={handleSelectEmptyTrash}>
            <Trash2 className="size-4" />
            Empty trash
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
