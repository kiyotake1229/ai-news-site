'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { NewsItem } from '@/types/news';
import { NewsCard } from './NewsCard';
import { FilterBar } from './FilterBar';
import { LanguageSwitch, Language } from './LanguageSwitch';
import { Pagination } from './Pagination';
import { SearchBar } from './SearchBar';
import { SortSelector, SortType } from './SortSelector';
import { DateRangeFilter, DateRange } from './DateRangeFilter';
import { SourceSettings } from './SourceSettings';
import { translateText } from '@/lib/translate';
import { getFavorites } from '@/lib/favorites';
import { sortByPriority, sortByDate, ScoredNewsItem } from '@/lib/priority';
import { getDisabledSources } from '@/lib/sourceSettings';
import { ITEMS_PER_PAGE } from '@/lib/constants';

interface NewsListProps {
  initialNews: NewsItem[];
  externalSearch?: string;
  onExternalSearchChange?: (q: string) => void;
}

interface TranslatedNews extends NewsItem {
  translatedTitle?: string;
  translatedDescription?: string;
}

type TabType = 'all' | 'favorites';

function isInDateRange(pubDate: string, range: DateRange): boolean {
  if (range === 'all') return true;
  const date = new Date(pubDate);
  const now = new Date();

  if (range === 'today') {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }
  if (range === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  }
  if (range === 'month') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return date >= monthAgo;
  }
  return true;
}

export function NewsList({ initialNews, externalSearch, onExternalSearchChange }: NewsListProps) {
  const [selectedSource, setSelectedSource] = useState('all');
  const [currentLang, setCurrentLang] = useState<Language>('ja');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedNews, setTranslatedNews] = useState<Map<string, TranslatedNews>>(new Map());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [favorites, setFavorites] = useState<NewsItem[]>([]);
  const [sortType, setSortType] = useState<SortType>('priority');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [disabledSources, setDisabledSources] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDisabledSources(getDisabledSources());
  }, []);

  // 外部 search（トレンドキーワードクリック）に追従
  useEffect(() => {
    if (externalSearch !== undefined) {
      setSearchQuery(externalSearch);
      setCurrentPage(1);
    }
  }, [externalSearch]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const refreshFavorites = useCallback(() => {
    setFavorites(getFavorites());
  }, []);

  const sources = useMemo(() => {
    const uniqueSources = [...new Set(initialNews.map((item) => item.source))];
    return uniqueSources.sort();
  }, [initialNews]);

  const baseNews = activeTab === 'favorites' ? favorites : initialNews;

  const filteredNews = useMemo(() => {
    let result = baseNews;

    // 非表示ソースを除外
    if (disabledSources.size > 0) {
      result = result.filter((item) => !disabledSources.has(item.source));
    }

    if (selectedSource !== 'all') {
      result = result.filter((item) => item.source === selectedSource);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          (item.description?.toLowerCase().includes(query) ?? false) ||
          item.source.toLowerCase().includes(query)
      );
    }

    result = result.filter((item) => isInDateRange(item.pubDate, dateRange));

    if (sortType === 'priority') {
      return sortByPriority(result);
    } else {
      return sortByDate(result);
    }
  }, [baseNews, selectedSource, searchQuery, sortType, dateRange]);

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);

  const currentPageNews = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNews.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredNews, currentPage]);

  const translateNews = useCallback(
    async (lang: Language, newsToTranslate: (NewsItem | ScoredNewsItem)[]) => {
      if (lang === 'original') return;

      setIsTranslating(true);

      try {
        const newTranslations = new Map(translatedNews);

        for (const news of newsToTranslate) {
          const cacheKey = `${news.link}_${lang}`;

          if (!newTranslations.has(cacheKey)) {
            const translatedTitle = await translateText(news.title, lang);
            const translatedDescription = news.description
              ? await translateText(news.description.substring(0, 200), lang)
              : undefined;

            newTranslations.set(cacheKey, {
              ...news,
              translatedTitle,
              translatedDescription,
            });
          }
        }

        setTranslatedNews(newTranslations);
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setIsTranslating(false);
      }
    },
    [translatedNews]
  );

  useEffect(() => {
    if (currentLang !== 'original' && currentPageNews.length > 0) {
      const untranslated = currentPageNews.filter(
        (news) => !translatedNews.has(`${news.link}_${currentLang}`)
      );
      if (untranslated.length > 0) {
        translateNews(currentLang, currentPageNews);
      }
    }
  }, [currentPageNews, currentLang, translatedNews, translateNews]);

  const handleLanguageChange = useCallback(
    async (lang: Language) => {
      setCurrentLang(lang);
      if (lang !== 'original') {
        await translateNews(lang, currentPageNews);
      }
    },
    [currentPageNews, translateNews]
  );

  const handleSourceChange = useCallback((source: string) => {
    setSelectedSource(source);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    onExternalSearchChange?.(query);
  }, [onExternalSearchChange]);

  const handleTabChange = useCallback(
    (tab: TabType) => {
      setActiveTab(tab);
      setCurrentPage(1);
      setSelectedSource('all');
      setSearchQuery('');
      if (tab === 'favorites') {
        refreshFavorites();
      }
    },
    [refreshFavorites]
  );

  const handleSortChange = useCallback((sort: SortType) => {
    setSortType(sort);
    setCurrentPage(1);
  }, []);

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
    setCurrentPage(1);
  }, []);

  const getDisplayNews = useCallback(
    (news: NewsItem | ScoredNewsItem) => {
      if (currentLang === 'original') return news;

      const cacheKey = `${news.link}_${currentLang}`;
      const translated = translatedNews.get(cacheKey);

      if (translated) {
        return {
          ...news,
          title: translated.translatedTitle || news.title,
          description: translated.translatedDescription || news.description,
        };
      }

      return news;
    },
    [currentLang, translatedNews]
  );

  return (
    <div className="space-y-6">
      {/* タブ切り替え */}
      <div className="flex gap-2">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
              : 'glass text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          すべて
        </button>
        <button
          onClick={() => handleTabChange('favorites')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'favorites'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30'
              : 'glass text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          お気に入り
          {favorites.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'favorites'
                  ? 'bg-white/20'
                  : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
              }`}
            >
              {favorites.length}
            </span>
          )}
        </button>
      </div>

      <SearchBar onSearch={handleSearch} value={searchQuery} />

      {/* ソートと言語切り替えとソース設定 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <SortSelector currentSort={sortType} onSortChange={handleSortChange} />
        <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
        <LanguageSwitch
          currentLang={currentLang}
          onLanguageChange={handleLanguageChange}
          isTranslating={isTranslating}
        />
        <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
        <SourceSettings onChange={() => setDisabledSources(getDisabledSources())} />
      </div>

      {/* 日付フィルター */}
      <DateRangeFilter value={dateRange} onChange={handleDateRangeChange} />

      <FilterBar
        sources={sources}
        selectedSource={selectedSource}
        onSourceChange={handleSourceChange}
      />

      {filteredNews.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {activeTab === 'favorites'
              ? 'お気に入りはまだありません'
              : searchQuery
              ? '検索結果が見つかりませんでした'
              : 'ニュースが見つかりませんでした'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {currentPageNews.map((news, index) => (
              <NewsCard
                key={`${news.link}-${index}`}
                news={getDisplayNews(news)}
                onFavoriteChange={refreshFavorites}
                showPriority={sortType === 'priority'}
                searchQuery={searchQuery}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <div className="text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {filteredNews.length}件中 {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredNews.length)}〜
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredNews.length)}件を表示
          {sortType === 'priority' && (
            <span className="text-amber-500 dark:text-amber-400">• おすすめ順</span>
          )}
          {currentLang !== 'original' && (
            <span className="text-indigo-500 dark:text-indigo-400">
              • {currentLang === 'ja' ? '日本語' : '英語'}翻訳
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
