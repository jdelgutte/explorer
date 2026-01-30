import { invoke } from "@tauri-apps/api/core";
import { DirEntry, readDir } from "@tauri-apps/plugin-fs";

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

  /** Returns the path to the system Trash / Recycle Bin directory. */
  getTrashDir: (): Promise<string> => invoke<string>("get_trash_dir"),
};