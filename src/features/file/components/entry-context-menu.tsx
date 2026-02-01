import { DirEntry } from "@tauri-apps/plugin-fs";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import {
  Copy,
  Info,
  Pencil,
  Scissors,
  ClipboardPaste,
  Trash2,
  FolderOpen,
} from "lucide-react";

export type EntryContextMenuHandlers = {
  onOpen?: (entry: DirEntry) => void;
  onRename?: (entry: DirEntry) => void;
  onProperties?: (entry: DirEntry) => void;
  onCopy?: (entry: DirEntry) => void;
  onCut?: (entry: DirEntry) => void;
  onPaste?: (entry: DirEntry) => void;
  onDelete?: (entry: DirEntry) => void;
};

type EntryContextMenuProps = {
  entry: DirEntry;
  currentPath: string | null;
  handlers: EntryContextMenuHandlers;
  children: React.ReactNode;
};

export function EntryContextMenu({
  entry,
  currentPath,
  handlers,
  children,
}: EntryContextMenuProps) {
  const handleOpen = () => handlers.onOpen?.(entry);
  const handleRename = () => handlers.onRename?.(entry);
  const handleProperties = () => handlers.onProperties?.(entry);
  const handleCopy = () => handlers.onCopy?.(entry);
  const handleCut = () => handlers.onCut?.(entry);
  const handlePaste = () => handlers.onPaste?.(entry);
  const handleDelete = () => handlers.onDelete?.(entry);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onSelect={handleOpen}>
          <FolderOpen className="size-4" />
          Open
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleRename}>
          <Pencil className="size-4" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleProperties}>
          <Info className="size-4" />
          Properties
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={handleCopy}>
          <Copy className="size-4" />
          Copy
          <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleCut}>
          <Scissors className="size-4" />
          Cut
          <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={handlePaste}>
          <ClipboardPaste className="size-4" />
          Paste
          <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={handleDelete} variant="destructive">
          <Trash2 className="size-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
