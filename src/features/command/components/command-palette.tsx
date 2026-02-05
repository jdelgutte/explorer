"use client";

import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { open, onOpenChange, commands, groups } = useCommandPalette();

  const renderGroup = (group: CommandGroupName) => (
    <CommandGroup key={group} heading={t(group)}>
      {commands
        .filter((command) => command.group === group)
        .map(({ label, icon: Icon, onSelect }) => (
          <CommandItem key={label} onSelect={onSelect}>
            <Icon className="size-4" />
            {t(label)}
          </CommandItem>
        ))}
    </CommandGroup>
  );

  return (
    <CommandDialog
      title={t("command.title")}
      description={t("command.description")}
      open={open}
      onOpenChange={onOpenChange}
    >
      <CommandInput placeholder={t("command.searchPlaceholder")} />
      <CommandList>
        <CommandEmpty>{t("command.noResults")}</CommandEmpty>
        {groups.map(renderGroup)}
      </CommandList>
    </CommandDialog>
  );
}
