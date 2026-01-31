"use client";

import { FilePlus, FolderPlus } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { fileApi } from "@/features/file/file.api";
import { useFileStore } from "@/features/file/file.store";
import { useCommandPaletteShortcut } from "@/features/command/useCommandPaletteShortcut";
import { Button } from "@/shared/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/lib/utils";

type CreateAction = "file" | "folder" | null;

export function CommandPalette() {
  const { open, onOpenChange } = useCommandPaletteShortcut();
  const currentPath = useFileStore((state) => state.currentPath);
  const setEntries = useFileStore((state) => state.setEntries);

  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<CreateAction>(null);
  const [newName, setNewName] = useState("");

  const refreshEntries = useCallback(async () => {
    if (!currentPath) return;
    const entries = await fileApi.getEntries(currentPath);
    setEntries(entries);
  }, [currentPath, setEntries]);

  const handleSelectCreate = (action: "file" | "folder") => {
    onOpenChange(false);
    setPendingAction(action);
    setNewName("");
    setNameDialogOpen(true);
  };

  const handleConfirmCreate = async () => {
    const name = newName.trim();
    if (!name || !currentPath || !pendingAction) return;

    try {
      if (pendingAction === "file") {
        await fileApi.createFile(currentPath, name);
        toast.success(`File "${name}" created`);
      } else {
        await fileApi.createFolder(currentPath, name);
        toast.success(`Folder "${name}" created`);
      }
      await refreshEntries();
      setNameDialogOpen(false);
      setPendingAction(null);
      setNewName("");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
    }
  };

  const handleNameDialogOpenChange = (next: boolean) => {
    if (!next) {
      setPendingAction(null);
      setNewName("");
    }
    setNameDialogOpen(next);
  };

  return (
    <>
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

      <Dialog open={nameDialogOpen} onOpenChange={handleNameDialogOpenChange}>
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {pendingAction === "file" ? "New file" : "New folder"}
            </DialogTitle>
          </DialogHeader>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirmCreate();
            }}
            placeholder={pendingAction === "file" ? "filename.txt" : "Folder name"}
            className={cn(
              "border-input bg-background ring-offset-background",
              "flex h-10 w-full rounded-md border px-3 py-2 text-sm",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleNameDialogOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmCreate} disabled={!newName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
