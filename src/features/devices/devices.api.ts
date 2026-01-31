import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

/** Event name emitted by the backend when the list of mountable devices changes. */
export const MOUNTABLE_DEVICES_CHANGED = "mountable-devices-changed";

/** Mountable device (disk/volume) from the system. */
export type MountableDevice = {
  name: string;
  mount_point: string;
  file_system: string;
  total_space: number;
  available_space: number;
  is_removable: boolean;
};

/** Returns the list of mountable devices (disks/volumes). */
export const devicesApi = {
  getMountableDevices: (): Promise<MountableDevice[]> =>
    invoke<MountableDevice[]>("get_mountable_devices"),

  /**
   * Listens for mountable device list updates (e.g. USB plugged/unplugged).
   * @param onDevices Called with the new list when it changes.
   * @returns Promise that resolves to an unlisten function.
   */
  listenMountableDevices: (
    onDevices: (devices: MountableDevice[]) => void
  ): Promise<() => void> =>
    listen<MountableDevice[]>(MOUNTABLE_DEVICES_CHANGED, (event) =>
      onDevices(event.payload)
    ),
};
