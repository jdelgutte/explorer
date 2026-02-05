"use client";

import type { CommandGroupName } from "@/features/command/useCommandPalette";
import { useCommandPalette } from "@/features/command/useCommandPalette";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";

export function CommandPalette() {
  const { open, onOpenChange, commands, groups } = useCommandPalette();

  const renderGroup = (group: CommandGroupName) => (
    <CommandGroup key={group} heading={group}>
      {commands
        .filter((command) => command.group === group)
        .map(({ label, icon: Icon, onSelect }) => (
          <CommandItem key={label} onSelect={onSelect}>
            <Icon className="size-4" />
            {label}
          </CommandItem>
        ))}
    </CommandGroup>
  );

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
        {groups.map(renderGroup)}
      </CommandList>
    </CommandDialog>
  );
}
