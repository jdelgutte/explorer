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

export type EntryMetadata = {
  size: number;
  mtime: Date | null;
};

/** Hidden files/dirs (name starting with .) are excluded. Folders first, then by name. */
export const fileApi = {
  getEntries: async (path: string): Promise<DirEntry[]> => {
    const entries = await readDir(path);
    const visible = entries.filter((e) => !e.name.startsWith("."));
    return visible.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory)
        return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
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
    const baseName = srcPath.replace(/^.*[/\\]/, "") || srcPath;
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
    const baseName = srcPath.replace(/^.*[/\\]/, "") || srcPath;
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
};