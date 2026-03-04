import { NewsItem } from '@/types/news';
import { MAX_FAVORITES } from './constants';

const STORAGE_KEY = 'ai-news-favorites';

export function getFavorites(): NewsItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addFavorite(news: NewsItem): void {
  const favorites = getFavorites();
  if (favorites.some((f) => f.link === news.link)) return;

  if (favorites.length >= MAX_FAVORITES) {
    favorites.pop(); // 古いものを削除
  }

  favorites.unshift(news);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function removeFavorite(link: string): void {
  const favorites = getFavorites();
  const filtered = favorites.filter((f) => f.link !== link);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function isFavorite(link: string): boolean {
  const favorites = getFavorites();
  return favorites.some((f) => f.link === link);
}
