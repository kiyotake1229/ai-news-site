'use client';

import { useState, useEffect } from 'react';
import { NewsItem } from '@/types/news';
import { pickupWebDevNews } from '@/lib/pickup';
import { NewsList } from '@/components/NewsList';
import { PickupSection } from '@/components/PickupSection';
import { RSS_FEEDS } from '@/lib/feeds';

// CORSプロキシ経由でRSSを取得
async function fetchFeedsClient(): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];
  const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

  const feedPromises = RSS_FEEDS.map(async (feed) => {
    try {
      const response = await fetch(CORS_PROXY + encodeURIComponent(feed.url), {
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) return [];

      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');

      // RSS 2.0
      const items = xml.querySelectorAll('item');
      // Atom
      const entries = xml.querySelectorAll('entry');

      const newsItems: NewsItem[] = [];

      items.forEach((item) => {
        if (newsItems.length >= 10) return;
        newsItems.push({
          title: item.querySelector('title')?.textContent || 'タイトルなし',
          link: item.querySelector('link')?.textContent || '#',
          pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
          source: feed.name,
          sourceUrl: feed.url,
          description: item.querySelector('description')?.textContent?.replace(/<[^>]*>/g, '').substring(0, 300) || '',
          categories: [feed.category],
        });
      });

      entries.forEach((entry) => {
        if (newsItems.length >= 10) return;
        const link = entry.querySelector('link')?.getAttribute('href') || entry.querySelector('link')?.textContent || '#';
        newsItems.push({
          title: entry.querySelector('title')?.textContent || 'タイトルなし',
          link,
          pubDate: entry.querySelector('published')?.textContent || entry.querySelector('updated')?.textContent || new Date().toISOString(),
          source: feed.name,
          sourceUrl: feed.url,
          description: entry.querySelector('summary')?.textContent?.replace(/<[^>]*>/g, '').substring(0, 300) || entry.querySelector('content')?.textContent?.replace(/<[^>]*>/g, '').substring(0, 300) || '',
          categories: [feed.category],
        });
      });

      return newsItems;
    } catch {
      console.error(`Failed to fetch ${feed.name}`);
      return [];
    }
  });

  const results = await Promise.allSettled(feedPromises);
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allNews.push(...result.value);
    }
  });

  allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  return allNews;
}

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedsClient().then((items) => {
      setNews(items);
      setLoading(false);
    });
  }, []);

  const pickups = pickupWebDevNews(news);

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="text-center py-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl glass">
            <svg className="animate-spin h-5 w-5 text-indigo-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-slate-600 dark:text-slate-300 font-medium">ニュースを取得中...</span>
          </div>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-3"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            リアルタイム更新
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          <span className="gradient-text">最新のAIニュース</span>を
          <br className="sm:hidden" />
          キャッチアップ
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          OpenAI、Google、Anthropicなど主要AI企業の最新情報から、
          日本語のテック記事まで自動収集してお届けします
        </p>
      </div>

      {/* Web開発者向けPickupセクション */}
      <PickupSection pickups={pickups} />

      {/* 全ニュース一覧 */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            すべてのニュース
          </h2>
        </div>
        <NewsList initialNews={news} />
      </div>
    </div>
  );
}
