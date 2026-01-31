import { invoke } from "@tauri-apps/api/core";

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
};
