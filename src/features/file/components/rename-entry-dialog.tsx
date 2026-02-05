"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { doRename } from "@/features/file/file.actions";
import { useRenameDialogStore } from "@/features/file/store/rename-dialog.store";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/lib/utils";

const inputClassName = cn(
  "border-input bg-background ring-offset-background",
  "flex h-10 w-full rounded-md border px-3 py-2 text-sm",
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "disabled:cursor-not-allowed disabled:opacity-50"
);

export function RenameEntryDialog() {
  const { t } = useTranslation();
  const { open, entry, closeRenameDialog } = useRenameDialogStore();
  const [name, setName] = useState("");

  useEffect(() => {
    if (open && entry) setName(entry.name);
  }, [open, entry]);

  const handleConfirm = useCallback(() => {
    if (!entry || !name.trim()) return;
    doRename(entry, name.trim());
    closeRenameDialog();
    setName("");
  }, [entry, name, closeRenameDialog]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      closeRenameDialog();
      setName("");
    }
  };

  if (!open || !entry) return null;

  const isValid =
    name.trim() &&
    name.trim() !== entry.name &&
    !name.includes("/") &&
    !name.includes("\\");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{entry.isDirectory ? t("file.renameFolder") : t("file.renameFile")}</DialogTitle>
        </DialogHeader>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm();
            if (e.key === "Escape") handleOpenChange(false);
          }}
          placeholder={entry.name}
          className={inputClassName}
          autoFocus
          aria-label={t("file.newName")}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t("file.cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid}>
            {t("file.rename")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
