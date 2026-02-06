"use client";

import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { useOptionsStore } from "@/features/options/store/options.store";
import { OptionsPage } from "./options-page";

export function OptionsDialog() {
  const open = useOptionsStore((s) => s.optionsViewActive);
  const setOptionsViewActive = useOptionsStore((s) => s.setOptionsViewActive);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) setOptionsViewActive(false);
      }}
    >
      <DialogContent
        showCloseButton={true}
        className="max-h-[calc(100%-2rem)] overflow-hidden p-0 w-full h-full"
      >
        <OptionsPage />
      </DialogContent>
    </Dialog>
  );
}

