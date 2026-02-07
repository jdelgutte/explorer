import { useEffect, useState } from "react";
import { devicesApi, type MountableDevice } from "@/features/devices/devices.api";

/**
 * Returns the list of mountable devices (disks/volumes), updated when the list
 * changes (e.g. USB plugged/unplugged).
 */
export function useMountableDevices(): MountableDevice[] {
  const [devices, setDevices] = useState<MountableDevice[]>([]);

  useEffect(() => {
    let cancelled = false;
    let unlisten: (() => void) | null = null;

    devicesApi.getMountableDevices().then((list) => {
      if (!cancelled) setDevices(list);
    });
    devicesApi
      .listenMountableDevices((list) => {
        if (!cancelled) setDevices(list);
      })
      .then((fn) => {
        unlisten = fn;
      });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  return devices;
}
