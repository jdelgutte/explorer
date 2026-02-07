"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { fileApi } from "@/features/file/file.api";
import { useTrashInfoStore } from "@/features/file/store/trash-info.store";
import { toasts } from "@/shared/toasts";

export function EmptyTrashDialog() {
  const { t } = useTranslation();
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
          <DialogTitle>{t("emptyTrash.title")}</DialogTitle>
          <DialogDescription>
            {t("emptyTrash.description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton={false}>
          <Button
            variant="outline"
            onClick={() => closeEmptyDialog()}
            disabled={isDeleting}
          >
            {t("emptyTrash.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? t("emptyTrash.deleting") : t("emptyTrash.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
