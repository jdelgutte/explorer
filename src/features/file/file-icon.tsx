import type { LucideIcon } from "lucide-react";
import {
  Archive,
  FileCode,
  FileIcon,
  FileSpreadsheet,
  FileText,
  Film,
  Music,
} from "lucide-react";

/** Extensions mapped to Lucide icon components for file list/grid display. */
const EXTENSION_ICONS: Record<string, LucideIcon> = {
  // Documents & text
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  md: FileText,
  rtf: FileText,
  odt: FileText,
  // Spreadsheets
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  ods: FileSpreadsheet,
  // Archives
  zip: Archive,
  tar: Archive,
  gz: Archive,
  bz2: Archive,
  xz: Archive,
  "7z": Archive,
  rar: Archive,
  // Video
  mp4: Film,
  mkv: Film,
  webm: Film,
  avi: Film,
  mov: Film,
  wmv: Film,
  m4v: Film,
  // Audio
  mp3: Music,
  wav: Music,
  flac: Music,
  ogg: Music,
  m4a: Music,
  aac: Music,
  wma: Music,
  // Code / config
  js: FileCode,
  ts: FileCode,
  jsx: FileCode,
  tsx: FileCode,
  py: FileCode,
  html: FileCode,
  htm: FileCode,
  css: FileCode,
  scss: FileCode,
  json: FileCode,
  yaml: FileCode,
  yml: FileCode,
  xml: FileCode,
  sh: FileCode,
  bash: FileCode,
};

/**
 * Returns the Lucide icon component for the given file name based on its extension.
 * Falls back to FileIcon for unknown extensions.
 */
export function getIconForFileName(fileName: string): LucideIcon {
  const lower = fileName.toLowerCase();
  const dot = lower.lastIndexOf(".");
  if (dot === -1) return FileIcon;
  const ext = lower.slice(dot + 1);
  return EXTENSION_ICONS[ext] ?? FileIcon;
}
