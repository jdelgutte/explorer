import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { FolderOpen } from "lucide-react";

export function EmptyFile() {
  return (
    <div className="flex flex-1 items-center justify-center h-full min-h-[280px]">
      <Empty className="gap-5">
        <EmptyHeader className="gap-3">
          <EmptyMedia
            variant="icon"
            className="size-20 rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400"
          >
            <FolderOpen className="size-10" aria-hidden />
          </EmptyMedia>
          <EmptyTitle className="text-base font-semibold">
            Dossier vide
          </EmptyTitle>
          <EmptyDescription className="text-muted-foreground/90">
            Aucun fichier ou sous-dossier ici. Glissez-déposez ou créez un élément pour commencer.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}