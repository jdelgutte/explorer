import { invoke } from "@tauri-apps/api/core";

/**
 * Sets this app as the default file manager (e.g. for opening folders).
 * Linux: xdg-mime default com.jdelgutte.explorer.desktop inode/directory.
 * Other platforms: returns an error.
 */
export async function setAsDefaultFileManager(): Promise<void> {
  await invoke("set_default_file_manager");
}

/**
 * Resets the default file manager to a common system app (e.g. Nautilus, Nemo, Dolphin).
 * Linux only.
 */
export async function resetDefaultFileManager(): Promise<void> {
  await invoke("reset_default_file_manager");
}
