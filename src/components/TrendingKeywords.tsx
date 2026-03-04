'use client';

import { useMemo } from 'react';
import { NewsItem } from '@/types/news';
import { getTrendingKeywords } from '@/lib/trending';

interface TrendingKeywordsProps {
  news: NewsItem[];
  onKeywordClick: (keyword: string) => void;
  activeKeyword?: string;
}

export function TrendingKeywords({ news, onKeywordClick, activeKeyword }: TrendingKeywordsProps) {
  const keywords = useMemo(() => getTrendingKeywords(news), [news]);

  if (keywords.length === 0) return null;

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap flex-shrink-0">
        <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13.5 2C13.5 2 14.5 7 11 10c-1.5 1.5-3 2-4.5 2.5C9 14 9.5 17.5 8 20c6-2 10-7.5 10-13.5 0-1.7-.2-3.3-.5-4.5z M6 22c0-3 1.5-5.5 4-7C8.5 17.5 8 20 6 22z"/>
        </svg>
        トレンド
      </span>
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        {keywords.map(({ word, count }) => (
          <button
            key={word}
            onClick={() => onKeywordClick(activeKeyword === word ? '' : word)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
              activeKeyword === word
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30'
                : 'glass text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-400/40'
            }`}
          >
            {word}
            <span className={`text-[10px] px-1 py-0.5 rounded-full ${
              activeKeyword === word
                ? 'bg-white/20'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
