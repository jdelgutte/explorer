/**
 * In-memory cache for thumbnail data URLs (path -> url).
 * Shared across all useThumbnail instances to avoid re-requesting the same file.
 */

const MAX_ENTRIES = 150;
const keyOrder: string[] = [];
const cache = new Map<string, string>();

function evictIfNeeded(): void {
  while (keyOrder.length >= MAX_ENTRIES && keyOrder.length > 0) {
    const oldest = keyOrder.shift();
    if (oldest != null) cache.delete(oldest);
  }
}

export const thumbnailCache = {
  get(path: string): string | undefined {
    return cache.get(path);
  },

  set(path: string, url: string): void {
    if (cache.has(path)) {
      cache.set(path, url);
      return;
    }
    evictIfNeeded();
    keyOrder.push(path);
    cache.set(path, url);
  },
};
