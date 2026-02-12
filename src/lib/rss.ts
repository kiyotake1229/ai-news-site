import Parser from 'rss-parser';
import { NewsItem } from '@/types/news';
import { RSS_FEEDS } from './feeds';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'AI News Aggregator/1.0',
  },
});

export async function fetchAllFeeds(): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];

  const feedPromises = RSS_FEEDS.map(async (feed) => {
    try {
      const parsedFeed = await parser.parseURL(feed.url);

      const items: NewsItem[] = (parsedFeed.items || []).slice(0, 10).map((item) => ({
        title: item.title || 'タイトルなし',
        link: item.link || '#',
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        source: feed.name,
        sourceUrl: parsedFeed.link || feed.url,
        description: item.contentSnippet || item.content || '',
        categories: item.categories || [feed.category],
      }));

      return items;
    } catch (error) {
      console.error(`Failed to fetch ${feed.name}:`, error);
      return [];
    }
  });

  const results = await Promise.allSettled(feedPromises);

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allNews.push(...result.value);
    }
  });

  // 日付で並び替え（新しい順）
  allNews.sort((a, b) => {
    const dateA = new Date(a.pubDate).getTime();
    const dateB = new Date(b.pubDate).getTime();
    return dateB - dateA;
  });

  return allNews;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return '1時間以内';
  } else if (diffHours < 24) {
    return `${diffHours}時間前`;
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  } else {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
