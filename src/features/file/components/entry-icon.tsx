import { FileIcon, FolderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EntryIconProps = {
  isDirectory: boolean;
  className?: string;
};

/** Shared icon for file/directory entries. */
export function EntryIcon({ isDirectory, className }: EntryIconProps) {
  const Icon = isDirectory ? FolderIcon : FileIcon;
  return <Icon className={cn("size-5 text-muted-foreground", className)} aria-hidden />;
}
