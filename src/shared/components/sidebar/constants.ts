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

/** Translation keys for labels. Resolve with t(key) where rendered. */
export const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "home", label: "sidebar.home", icon: Home, getPath: homeDir },
  { id: "desktop", label: "sidebar.desktop", icon: Monitor, getPath: desktopDir },
  { id: "documents", label: "sidebar.documents", icon: FileText, getPath: documentDir },
  { id: "downloads", label: "sidebar.downloads", icon: Download, getPath: downloadDir },
  { id: "pictures", label: "sidebar.pictures", icon: Image, getPath: pictureDir },
  { id: "music", label: "sidebar.music", icon: Music, getPath: audioDir },
  { id: "videos", label: "sidebar.videos", icon: Video, getPath: videoDir },
  { id: "trash", label: "sidebar.trash", icon: Trash2, getPath: () => fileApi.getTrashDir() },
];
