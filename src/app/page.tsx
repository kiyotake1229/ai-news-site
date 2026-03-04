'use client';

import { useState, useEffect } from 'react';
import { NewsItem } from '@/types/news';
import { pickupWebDevNews } from '@/lib/pickup';
import { NewsList } from '@/components/NewsList';
import { PickupSection } from '@/components/PickupSection';
import { RSS_FEEDS } from '@/lib/feeds';
import { getCachedNews, setCachedNews } from '@/lib/cache';
import { useLastUpdated } from '@/lib/lastUpdatedContext';
import { TrendingKeywords } from '@/components/TrendingKeywords';
import {
  CORS_PROXIES,
  FETCH_TIMEOUT_MS,
  ITEMS_PER_FEED,
  MAX_DESCRIPTION_LENGTH,
  AUTO_REFRESH_INTERVAL,
} from '@/lib/constants';

// ---- モジュールレベル（React に依存しない） ----

async function fetchWithProxy(url: string): Promise<string> {
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(proxy + encodeURIComponent(url), {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (res.ok) {
        return await res.text();
      }
    } catch {
      // 次のプロキシを試す
    }
  }
  throw new Error(`All proxies failed for ${url}`);
}

async function fetchAllFeeds(): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];

  const feedPromises = RSS_FEEDS.map(async (feed) => {
    try {
      const text = await fetchWithProxy(feed.url);
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');

      const newsItems: NewsItem[] = [];

      // RSS 2.0 / RSS 1.0
      xml.querySelectorAll('item').forEach((item) => {
        if (newsItems.length >= ITEMS_PER_FEED) return;
        newsItems.push({
          title: item.querySelector('title')?.textContent?.trim() || 'タイトルなし',
          link: item.querySelector('link')?.textContent?.trim() || '#',
          pubDate:
            item.querySelector('pubDate')?.textContent ||
            item.querySelector('date')?.textContent ||
            new Date().toISOString(),
          source: feed.name,
          sourceUrl: feed.url,
          description:
            item
              .querySelector('description')
              ?.textContent?.replace(/<[^>]*>/g, '')
              .trim()
              .substring(0, MAX_DESCRIPTION_LENGTH) || '',
          categories: [feed.category],
        });
      });

      // Atom
      xml.querySelectorAll('entry').forEach((entry) => {
        if (newsItems.length >= ITEMS_PER_FEED) return;
        const link =
          entry.querySelector('link')?.getAttribute('href') ||
          entry.querySelector('link')?.textContent?.trim() ||
          '#';
        newsItems.push({
          title: entry.querySelector('title')?.textContent?.trim() || 'タイトルなし',
          link,
          pubDate:
            entry.querySelector('published')?.textContent ||
            entry.querySelector('updated')?.textContent ||
            new Date().toISOString(),
          source: feed.name,
          sourceUrl: feed.url,
          description:
            entry
              .querySelector('summary')
              ?.textContent?.replace(/<[^>]*>/g, '')
              .trim()
              .substring(0, MAX_DESCRIPTION_LENGTH) ||
            entry
              .querySelector('content')
              ?.textContent?.replace(/<[^>]*>/g, '')
              .trim()
              .substring(0, MAX_DESCRIPTION_LENGTH) ||
            '',
          categories: [feed.category],
        });
      });

      return newsItems;
    } catch (e) {
      console.warn(`[RSS] Failed: ${feed.name}`, e);
      return [];
    }
  });

  const results = await Promise.allSettled(feedPromises);
  results.forEach((r) => {
    if (r.status === 'fulfilled') allNews.push(...r.value);
  });

  // 日付降順 + 重複除去
  allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  const seen = new Set<string>();
  return allNews.filter((item) => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  });
}

// ---- コンポーネント ----

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { lastUpdated, setLastUpdated } = useLastUpdated();

  useEffect(() => {
    // キャッシュがあれば即表示
    const cached = getCachedNews();
    if (cached && cached.length > 0) {
      setNews(cached);
      setLoading(false);
    }

    // フェッシュ取得（元のコードと同じパターン）
    fetchAllFeeds().then((items) => {
      if (items.length > 0) {
        setNews(items);
        setCachedNews(items);
        setLastUpdated(new Date());
      }
      setLoading(false);
    });

    // 自動更新
    const interval = setInterval(() => {
      fetchAllFeeds().then((items) => {
        if (items.length > 0) {
          setNews(items);
          setCachedNews(items);
          setLastUpdated(new Date());
        }
      });
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            {lastUpdated
              ? `更新: ${Math.floor((Date.now() - lastUpdated.getTime()) / 60000)}分前`
              : '30分ごとに自動更新'}
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

      <PickupSection pickups={pickups} />

      {/* トレンドキーワード */}
      {news.length > 0 && (
        <TrendingKeywords
          news={news}
          onKeywordClick={setSearchQuery}
          activeKeyword={searchQuery}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            すべてのニュース
          </h2>
        </div>
        <NewsList initialNews={news} externalSearch={searchQuery} onExternalSearchChange={setSearchQuery} />
      </div>
    </div>
  );
}
