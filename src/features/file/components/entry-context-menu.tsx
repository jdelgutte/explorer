import { DirEntry } from "@tauri-apps/plugin-fs";
import { useTranslation } from "react-i18next";
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
  Pin,
  Terminal,
} from "lucide-react";

export type EntryContextMenuHandlers = {
  onOpen?: (entry: DirEntry) => void;
  onRename?: (entry: DirEntry) => void;
  onProperties?: (entry: DirEntry) => void;
  onCopy?: (entry: DirEntry) => void;
  onCut?: (entry: DirEntry) => void;
  onPaste?: (entry: DirEntry) => void;
  onDelete?: (entry: DirEntry) => void;
  /** Add folder to Quick access (only shown for directories). */
  onAddToQuickAccess?: (entry: DirEntry) => void;
  /** Open in system terminal (only shown for directories). */
  onOpenInTerminal?: (entry: DirEntry) => void;
};

type EntryContextMenuProps = {
  entry: DirEntry;
  currentPath: string | null;
  handlers: EntryContextMenuHandlers;
  children: React.ReactNode;
};

export function EntryContextMenu({
  entry,
  currentPath: _currentPath,
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
  const handleAddToQuickAccess = () => handlers.onAddToQuickAccess?.(entry);
  const handleOpenInTerminal = () => handlers.onOpenInTerminal?.(entry);
  const { t } = useTranslation();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onSelect={handleOpen}>
          <FolderOpen className="size-4" />
          {t("contextMenu.open")}
        </ContextMenuItem>
        {entry.isDirectory && handlers.onAddToQuickAccess && (
          <ContextMenuItem onSelect={handleAddToQuickAccess}>
            <Pin className="size-4" />
            {t("sidebar.addToQuickAccess")}
          </ContextMenuItem>
        )}
        {entry.isDirectory && handlers.onOpenInTerminal && (
          <ContextMenuItem onSelect={handleOpenInTerminal}>
            <Terminal className="size-4" />
            {t("contextMenu.openInTerminal")}
          </ContextMenuItem>
        )}
        <ContextMenuItem onSelect={handleRename}>
          <Pencil className="size-4" />
          {t("contextMenu.rename")}
          <ContextMenuShortcut>{t("contextMenu.shortcut.f2")}</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleProperties}>
          <Info className="size-4" />
          {t("contextMenu.properties")}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={handleCopy}>
          <Copy className="size-4" />
          {t("contextMenu.copy")}
          <ContextMenuShortcut>{t("contextMenu.shortcut.ctrlC")}</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleCut}>
          <Scissors className="size-4" />
          {t("contextMenu.cut")}
          <ContextMenuShortcut>{t("contextMenu.shortcut.ctrlX")}</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={handlePaste}>
          <ClipboardPaste className="size-4" />
          {t("contextMenu.paste")}
          <ContextMenuShortcut>{t("contextMenu.shortcut.ctrlV")}</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={handleDelete} variant="destructive">
          <Trash2 className="size-4" />
          {t("contextMenu.delete")}
          <ContextMenuShortcut>{t("contextMenu.shortcut.ctrlDel")}</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
