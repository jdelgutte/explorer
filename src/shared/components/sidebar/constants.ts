import {
  desktopDir,
  documentDir,
  downloadDir,
  homeDir,
  pictureDir,
  videoDir,
  audioDir,
} from "@tauri-apps/api/path";
import {
  Monitor,
  FileText,
  Download,
  Home,
  Music,
  Image,
  Video,
  Trash2,
} from "lucide-react";
import { fileApi } from "@/features/file/file.api";

export type SidebarLocation =
  | "home"
  | "desktop"
  | "documents"
  | "downloads"
  | "pictures"
  | "music"
  | "videos"
  | "trash"
  | "other";

export type SidebarItem = {
  id: SidebarLocation;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  getPath: () => Promise<string>;
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "home", label: "Home", icon: Home, getPath: homeDir },
  { id: "desktop", label: "Desktop", icon: Monitor, getPath: desktopDir },
  { id: "documents", label: "Documents", icon: FileText, getPath: documentDir },
  { id: "downloads", label: "Downloads", icon: Download, getPath: downloadDir },
  { id: "pictures", label: "Pictures", icon: Image, getPath: pictureDir },
  { id: "music", label: "Music", icon: Music, getPath: audioDir },
  { id: "videos", label: "Videos", icon: Video, getPath: videoDir },
  { id: "trash", label: "Trash", icon: Trash2, getPath: () => fileApi.getTrashDir() },
];
