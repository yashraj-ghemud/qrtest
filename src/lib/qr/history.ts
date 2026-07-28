/**
 * History persistence — uses localStorage with quota-error recovery,
 * deduplication, and graceful malformed-data purge.
 */

export interface HistoryItem {
  id: string;
  category: string;
  content: string;
  label: string;
  thumbnail?: string; // base64 PNG data URL
  customization: {
    foreground: string;
    background: string;
    errorCorrection: string;
    size: number;
    template: string;
    gradientFrom?: string;
    gradientTo?: string;
  };
  createdAt: number;
}

const STORAGE_KEY = 'qrcraft_history_v2';
const MAX_ITEMS = 50;
const MAX_THUMBNAIL_BYTES = 5000; // base64 size cap per thumbnail

function safeParse(raw: string | null): HistoryItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is HistoryItem =>
        x &&
        typeof x === 'object' &&
        typeof x.id === 'string' &&
        typeof x.content === 'string',
    );
  } catch {
    // Purge malformed storage so we don't poison every future read
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    return [];
  }
}

export function loadHistory(): HistoryItem[] {
  try {
    return safeParse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (e) {
    // Quota exceeded — drop oldest thumbnails and retry once
    if (
      e instanceof DOMException &&
      (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      try {
        const stripped = items.map((x, i) =>
          i === 0 ? x : { ...x, thumbnail: undefined },
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export function addToHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem[] {
  const items = loadHistory();
  // Deduplicate — if same content + same customization, replace the existing entry
  const dedupIdx = items.findIndex(
    (x) =>
      x.content === item.content &&
      x.category === item.category &&
      x.customization.foreground === item.customization.foreground &&
      x.customization.background === item.customization.background,
  );
  const newItem: HistoryItem = {
    ...item,
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    createdAt: Date.now(),
    // Cap thumbnail size to avoid quota issues
    thumbnail:
      item.thumbnail && item.thumbnail.length > MAX_THUMBNAIL_BYTES
        ? undefined
        : item.thumbnail,
  };
  if (dedupIdx >= 0) {
    items.splice(dedupIdx, 1);
  }
  items.unshift(newItem);
  const trimmed = items.slice(0, MAX_ITEMS);
  saveHistory(trimmed);
  return trimmed;
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  const items = loadHistory().filter((x) => x.id !== id);
  saveHistory(items);
  return items;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
