/**
 * Shared path utilities. Use for path normalization and basename extraction (DRY).
 */

/** Normalize path for comparison: unified slashes and no trailing slash. */
export function normalizePath(p: string): string {
  return p.replace(/\\/g, "/").replace(/\/+$/, "") || "/";
}

/** Last segment of a path (file or folder name). Returns fallback when path is empty or only separators. */
export function pathBasename(path: string, fallback = ""): string {
  const segment = path.split(/[/\\]/).filter(Boolean).pop();
  return segment ?? fallback;
}

/** Basename for a full path (e.g. for copy/move destination). Same as pathBasename but with path as fallback when empty. */
export function pathBasenameOrPath(path: string): string {
  const segment = path.split(/[/\\]/).filter(Boolean).pop();
  return segment ?? path;
}
