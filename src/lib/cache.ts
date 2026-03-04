import { NewsItem } from '@/types/news';
import { CACHE_DURATION_MS } from './constants';

const CACHE_KEY = 'ai-news-cache';

interface CacheData {
  news: NewsItem[];
  timestamp: number;
}

export function getCachedNews(): NewsItem[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return null;

    const data: CacheData = JSON.parse(stored);
    if (Date.now() - data.timestamp > CACHE_DURATION_MS) return null;

    return data.news;
  } catch {
    return null;
  }
}

export function setCachedNews(news: NewsItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    const data: CacheData = { news, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage 容量超過などは無視
  }
}

export function clearNewsCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
}
