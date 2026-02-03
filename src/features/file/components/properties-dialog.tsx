"use client";

import { useEffect, useState } from "react";
import { fileApi, type EntryProperties } from "@/features/file/file.api";
import { usePropertiesDialogStore } from "@/features/file/store/properties-dialog.store";
import { formatDate, formatFileSize } from "@/features/file/utils/format";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

function PropertyRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,8rem)_1fr] gap-2 py-1.5 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="min-w-0 break-all font-medium">{value ?? "—"}</span>
    </div>
  );
}

export function PropertiesDialog() {
  const { open, entry, currentPath, closePropertiesDialog } =
    usePropertiesDialogStore();
  const [properties, setProperties] = useState<EntryProperties | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !entry || !currentPath) {
      setProperties(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fileApi
      .getEntryProperties(currentPath, entry)
      .then((p) => {
        setProperties(p);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
  }, [open, entry, currentPath]);

  if (!open) return null;

  const title = entry
    ? `Properties: ${entry.name}`
    : "Properties";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closePropertiesDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {loading && (
          <p className="py-4 text-sm text-muted-foreground">Loading…</p>
        )}
        {error && (
          <p className="py-4 text-sm text-destructive">{error}</p>
        )}
        {!loading && !error && properties && (
          <div className="space-y-0 border-t border-border pt-2">
            <PropertyRow label="Name" value={properties.name} />
            <PropertyRow
              label="Type"
              value={properties.isDirectory ? "Folder" : "File"}
            />
            <PropertyRow label="Location" value={properties.path} />
            <PropertyRow
              label="Size"
              value={
                properties.isDirectory
                  ? "—"
                  : formatFileSize(properties.size)
              }
            />
            <PropertyRow
              label="Date modified"
              value={formatDate(properties.mtime)}
            />
            {properties.atime != null && (
              <PropertyRow
                label="Date accessed"
                value={formatDate(properties.atime)}
              />
            )}
          </div>
        )}

        <DialogFooter>
          <Button onClick={closePropertiesDialog}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
