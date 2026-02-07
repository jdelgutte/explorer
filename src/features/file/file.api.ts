import { join } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";
import {
  copyFile,
  DirEntry,
  mkdir,
  readDir,
  rename,
  stat,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { pathBasenameOrPath } from "@/lib/path-utils";

export type EntryMetadata = {
  size: number;
  mtime: Date | null;
};

/** Full metadata for a single entry (Properties dialog). */
export type EntryProperties = {
  path: string;
  name: string;
  isDirectory: boolean;
  size: number;
  mtime: Date | null;
  atime: Date | null;
};

/** Returns true if the error indicates denied access (permissions / scope). */
export function isAccessDeniedError(err: unknown): boolean {
  const msg =
    (err instanceof Error ? err.message : String(err ?? "")).toLowerCase();
  return (
    msg.includes("permission denied") ||
    msg.includes("access denied") ||
    msg.includes("eacces") ||
    msg.includes("eperm") ||
    msg.includes("operation not permitted") ||
    msg.includes("not allowed")
  );
}

/** Optional: showHidden includes entries whose name starts with a dot. Folders first, then by name. */
export const fileApi = {
  getEntries: async (
    path: string,
    options?: { showHidden?: boolean }
  ): Promise<DirEntry[]> => {
    const entries = await readDir(path);
    const visible =
      options?.showHidden === true
        ? entries
        : entries.filter((e) => !e.name.startsWith("."));
    return visible.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory)
        return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
  },

  /**
   * Fetches full metadata for a single entry (path, name, type, size, mtime, atime).
   * Used by the Properties dialog.
   */
  getEntryProperties: async (
    parentPath: string,
    entry: DirEntry,
  ): Promise<EntryProperties> => {
    const path = await join(parentPath, entry.name);
    const info = await stat(path);
    return {
      path,
      name: entry.name,
      isDirectory: entry.isDirectory,
      size: info.size,
      mtime: info.mtime,
      atime: info.atime ?? null,
    };
  },

  /**
   * Fetches size and mtime for each entry in parallel.
   * Keys are entry names; failed stats are omitted.
   */
  getEntriesMetadata: async (
    parentPath: string,
    entries: DirEntry[]
  ): Promise<Record<string, EntryMetadata>> => {
    const results = await Promise.allSettled(
      entries.map(async (entry) => {
        const path = await join(parentPath, entry.name);
        const info = await stat(path);
        return { name: entry.name, size: info.size, mtime: info.mtime };
      })
    );
    const out: Record<string, EntryMetadata> = {};
    for (const r of results) {
      if (r.status === "fulfilled")
        out[r.value.name] = { size: r.value.size, mtime: r.value.mtime };
    }
    return out;
  },

  /** Returns the path to the system Trash / Recycle Bin directory. */
  getTrashDir: (): Promise<string> => invoke<string>("get_trash_dir"),

  /** Returns item count, total size (bytes), and whether restore is available (Linux/Windows). */
  getTrashInfo: (): Promise<{
    item_count: number;
    total_size_bytes: number;
    restore_available: boolean;
  }> => invoke("get_trash_info"),

  /** Permanently deletes all items in the trash. */
  emptyTrash: (): Promise<void> => invoke("empty_trash"),

  /** Moves the given paths to the system trash (creates .trashinfo on Linux, proper Recycle Bin on Windows). */
  moveToTrash: (paths: string[]): Promise<void> =>
    invoke("move_to_trash", { paths }),

  /** Restores the given trash items by their id/name in the trash. Linux/Windows only. */
  restoreTrashItems: (ids: string[]): Promise<void> =>
    invoke("restore_trash_items", { ids }),

  /** Creates an empty file at parentPath/name. */
  createFile: async (parentPath: string, name: string): Promise<void> => {
    const path = await join(parentPath, name);
    await writeTextFile(path, "", { create: true });
  },

  /** Creates a directory at parentPath/name. */
  createFolder: async (parentPath: string, name: string): Promise<void> => {
    const path = await join(parentPath, name);
    await mkdir(path);
  },

  /**
   * Copies a file or directory (recursively) from srcPath into destDir.
   * Destination is destDir/basename(srcPath). Overwrites if it exists.
   */
  copyPath: async (srcPath: string, destDir: string): Promise<void> => {
    const info = await stat(srcPath);
    const baseName = pathBasenameOrPath(srcPath);
    const destPath = await join(destDir, baseName);

    if (info.isFile) {
      await copyFile(srcPath, destPath);
      return;
    }
    if (info.isDirectory) {
      await mkdir(destPath, { recursive: true });
      const entries = await readDir(srcPath);
      for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        const srcChild = await join(srcPath, entry.name);
        await fileApi.copyPath(srcChild, destPath);
      }
    }
  },

  /**
   * Moves a file or directory from srcPath into destDir (rename).
   * Destination is destDir/basename(srcPath).
   */
  movePath: async (srcPath: string, destDir: string): Promise<void> => {
    const baseName = pathBasenameOrPath(srcPath);
    const destPath = await join(destDir, baseName);
    await rename(srcPath, destPath);
  },

  /**
   * Renames a file or directory within the same parent directory.
   * newName must not contain path separators.
   */
  renameEntry: async (
    parentPath: string,
    oldName: string,
    newName: string,
  ): Promise<void> => {
    const oldPath = await join(parentPath, oldName);
    const newPath = await join(parentPath, newName);
    await rename(oldPath, newPath);
  },

  /** Image thumbnail as data URL (backend may resize). Cached in backend. */
  getImageThumbnail: (path: string): Promise<string> =>
    invoke<string>("image_thumbnail", { path }),

  /** PDF thumbnail as base64 PNG payload (prepend data:image/png;base64,). Cached in backend. */
  getPdfThumbnail: (path: string): Promise<string> =>
    invoke<string>("pdf_thumbnail", { path }),

  /** Opens the system default terminal with the given directory as working directory. */
  openInTerminal: (path: string): Promise<void> =>
    invoke("open_in_terminal", { path }),
};