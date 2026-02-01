import { FileIcon, FolderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EntryIconProps = {
  isDirectory: boolean;
  /** When set, shows image thumbnail instead of file icon (for PNG, JPG, etc.). */
  imageSrc?: string | null;
  className?: string;
};

/** Shared icon for file/directory entries. Shows image thumbnail when imageSrc is provided. */
export function EntryIcon({
  isDirectory,
  imageSrc,
  className,
}: EntryIconProps) {
  if (isDirectory) {
    return (
      <FolderIcon
        className={cn("size-5 text-muted-foreground", className)}
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
  return (
    <FileIcon
      className={cn("size-5 text-muted-foreground", className)}
      aria-hidden
    />
  );
}
