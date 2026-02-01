import { join } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";
import { DirEntry, mkdir, readDir, stat, writeTextFile } from "@tauri-apps/plugin-fs";

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
};