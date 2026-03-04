const KEY = 'ai-news-disabled-sources';

export function getDisabledSources(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

export function setDisabledSources(disabled: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify([...disabled]));
  } catch {
    // 無視
  }
}
