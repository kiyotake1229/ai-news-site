'use client';

import { useState, useEffect, ReactNode } from 'react';
import { NewsItem } from '@/types/news';
import { isFavorite, addFavorite, removeFavorite } from '@/lib/favorites';
import { ScoredNewsItem, getPriorityLevel } from '@/lib/priority';
import { markAsRead, isRead } from '@/lib/readHistory';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return '1時間以内';
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
}

function highlightText(text: string, query: string): ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function isScoredNews(news: NewsItem | ScoredNewsItem): news is ScoredNewsItem {
  return 'priorityScore' in news;
}

interface NewsCardProps {
  news: NewsItem | ScoredNewsItem;
  onFavoriteChange?: () => void;
  showPriority?: boolean;
  searchQuery?: string;
}

export function NewsCard({
  news,
  onFavoriteChange,
  showPriority = false,
  searchQuery = '',
}: NewsCardProps) {
  const [favorite, setFavorite] = useState(false);
  const [read, setRead] = useState(false);

  useEffect(() => {
    setFavorite(isFavorite(news.link));
    setRead(isRead(news.link));
  }, [news.link]);

  const handleFavoriteClick = () => {
    if (favorite) {
      removeFavorite(news.link);
    } else {
      addFavorite(news);
    }
    setFavorite(!favorite);
    onFavoriteChange?.();
  };

  const handleArticleClick = () => {
    markAsRead(news.link);
    setRead(true);
  };

  const getCategoryStyle = (source: string) => {
    if (source.includes('YouTube')) return 'from-red-600 to-red-500';
    if (source.includes('ITmedia')) return 'from-red-500 to-orange-500';
    if (source.includes('GIGAZINE')) return 'from-amber-500 to-yellow-500';
    if (source.includes('Impress')) return 'from-blue-500 to-cyan-500';
    if (source.includes('はてブ')) return 'from-sky-500 to-blue-500';
    if (source.includes('Zenn')) return 'from-blue-500 to-indigo-500';
    if (source.includes('Qiita')) return 'from-green-500 to-emerald-500';
    if (source.includes('MCP')) return 'from-pink-500 to-rose-500';
    if (source.includes('OpenAI')) return 'from-emerald-500 to-green-500';
    if (source.includes('Google')) return 'from-blue-500 to-indigo-500';
    if (source.includes('Anthropic')) return 'from-orange-500 to-amber-500';
    if (source.includes('Verge')) return 'from-purple-500 to-violet-500';
    if (source.includes('Hacker')) return 'from-orange-500 to-red-500';
    if (source.includes('Reddit')) return 'from-orange-600 to-red-600';
    if (source.includes('MIT')) return 'from-cyan-500 to-blue-500';
    if (source.includes('Ars')) return 'from-indigo-500 to-purple-500';
    return 'from-slate-500 to-gray-500';
  };

  const priorityScore = isScoredNews(news) ? news.priorityScore : 0;
  const priorityLevel = getPriorityLevel(priorityScore);

  const tweetUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(news.link)}&text=${encodeURIComponent(news.title)}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(news.link)}`;

  return (
    <article
      className={`group relative glass rounded-2xl p-5 card-hover glow-hover overflow-hidden transition-opacity ${
        read ? 'opacity-60' : ''
      }`}
    >
      {/* Gradient accent line */}
      <div
        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getCategoryStyle(news.source)} opacity-80`}
      ></div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getCategoryStyle(news.source)} shadow-sm flex items-center gap-1`}
            >
              {news.source.includes('YouTube') && (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              )}
              {news.source}
            </span>
            {showPriority && priorityScore > 0 && priorityLevel === 'high' && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-500/30">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                必読
              </span>
            )}
            {showPriority && priorityScore > 0 && priorityLevel === 'medium' && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                注目
              </span>
            )}
            {read && (
              <span className="text-xs text-slate-400 dark:text-slate-500">既読</span>
            )}
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(news.pubDate)}
            </span>
          </div>

          <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            onClick={handleArticleClick}
          >
            <h2 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
              {highlightText(news.title, searchQuery)}
            </h2>
          </a>

          {news.description && (
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {highlightText(
                news.description.substring(0, 150) + (news.description.length > 150 ? '...' : ''),
                searchQuery
              )}
            </p>
          )}

          {/* 共有ボタン（ホバー時に表示） */}
          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-xs text-slate-400 dark:text-slate-500">共有:</span>
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Xでシェア"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.732-8.85L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
              X
            </a>
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-xs text-green-700 dark:text-green-400 transition-colors"
              aria-label="LINEでシェア"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              LINE
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={handleFavoriteClick}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              favorite
                ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30'
                : 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20'
            }`}
            aria-label={favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
          >
            <svg
              className="w-5 h-5"
              fill={favorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300"
            aria-label="記事を開く"
            onClick={handleArticleClick}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
