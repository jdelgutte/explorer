import { FolderIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getIconForFileName } from "@/features/file/file-icon";

type EntryIconProps = {
  isDirectory: boolean;
  /** File name (used to pick icon by extension when not directory and no image). */
  fileName?: string;
  /** When set, shows image thumbnail instead of file icon (for PNG, JPG, etc.). */
  imageSrc?: string | null;
  className?: string;
};

/** Shared icon for file/directory entries. Shows image thumbnail when imageSrc is provided, else icon by extension. */
export function EntryIcon({
  isDirectory,
  fileName,
  imageSrc,
  className,
}: EntryIconProps) {
  if (isDirectory) {
    return (
      <FolderIcon
        className={cn("size-6 text-muted-foreground", className)}
        aria-hidden
      />
    );
  }
  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt=""
        className={cn("size-full object-cover rounded", className)}
        loading="lazy"
      />
    );
  }
  const FileIcon = getIconForFileName(fileName ?? "");
  return (
    <FileIcon
      className={cn("size-6 text-muted-foreground", className)}
      aria-hidden
    />
  );
}
