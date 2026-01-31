"use client";

import { FilePlus, FolderPlus } from "lucide-react";
import { useCreateDialogStore } from "@/features/file/create-dialog.store";
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

  const handleSelectCreate = (type: "file" | "folder") => {
    onOpenChange(false);
    openCreateDialog(type);
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
      </CommandList>
    </CommandDialog>
  );
}
