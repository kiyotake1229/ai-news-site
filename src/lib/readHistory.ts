const READ_KEY = 'ai-news-read';
const MAX_READ = 500;

function getReadSet(): Set<string> {
  if (typeof window === 'undefined') return new Set();

  try {
    const stored = localStorage.getItem(READ_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadSet(set: Set<string>): void {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...set]));
  } catch {
    // 無視
  }
}

export function markAsRead(link: string): void {
  const set = getReadSet();
  set.add(link);

  // 上限を超えたら古いものから削除
  if (set.size > MAX_READ) {
    const arr = [...set];
    const trimmed = arr.slice(arr.length - MAX_READ);
    saveReadSet(new Set(trimmed));
  } else {
    saveReadSet(set);
  }
}

export function isRead(link: string): boolean {
  return getReadSet().has(link);
}

export function getReadLinks(): Set<string> {
  return getReadSet();
}
