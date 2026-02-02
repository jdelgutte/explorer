"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fileApi } from "@/features/file/file.api";
import { useCreateDialogStore } from "@/features/file/store/create-dialog.store";
import { useFileStore } from "@/features/file/store/file.store";
import { useNavigationStore } from "@/features/navigation/store/navigation.store";
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

export function CreateEntryDialog() {
  const { open, createType, closeCreateDialog } = useCreateDialogStore();
  const currentPath = useNavigationStore((state) => state.currentPath);
  const setEntries = useFileStore((state) => state.setEntries);
  const [name, setName] = useState("");

  const refreshEntries = useCallback(async () => {
    if (!currentPath) return;
    const entries = await fileApi.getEntries(currentPath);
    setEntries(entries);
  }, [currentPath, setEntries]);

  // Reset name when dialog opens
  useEffect(() => {
    if (open) setName("");
  }, [open]);

  const handleConfirm = async () => {
    const trimmed = name.trim();
    if (!trimmed || !currentPath || !createType) return;

    try {
      if (createType === "file") {
        await fileApi.createFile(currentPath, trimmed);
        toast.success(`File "${trimmed}" created`);
      } else {
        await fileApi.createFolder(currentPath, trimmed);
        toast.success(`Folder "${trimmed}" created`);
      }
      await refreshEntries();
      closeCreateDialog();
      setName("");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      closeCreateDialog();
      setName("");
    }
  };

  // Only render when dialog is open and type is set (set together via openCreateDialog)
  if (!open || !createType) return null;

  const title = createType === "file" ? "New file" : "New folder";
  const placeholder =
    createType === "file" ? "filename.txt" : "Folder name";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm();
          }}
          placeholder={placeholder}
          className={inputClassName}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!name.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
