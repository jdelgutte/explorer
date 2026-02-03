"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { fileApi } from "../file.api";
import { toasts } from "@/shared/toasts";
import { useTrashInfoStore } from "../store/trash-info.store";
import { useState } from "react";

export function EmptyTrashDialog() {
  const emptyDialogOpen = useTrashInfoStore((s) => s.emptyDialogOpen);
  const closeEmptyDialog = useTrashInfoStore((s) => s.closeEmptyDialog);
  const refetch = useTrashInfoStore((s) => s.refetch);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await fileApi.emptyTrash();
      toasts.trashEmptied();
      closeEmptyDialog();
      await refetch();
    } catch (err) {
      toasts.emptyTrashFailed(
        err instanceof Error ? err.message : String(err)
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={emptyDialogOpen} onOpenChange={(open) => !open && closeEmptyDialog()}>
      <DialogContent showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>Empty trash</DialogTitle>
          <DialogDescription>
            Permanently delete all items in the trash? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton={false}>
          <Button
            variant="outline"
            onClick={() => closeEmptyDialog()}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Empty trash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
