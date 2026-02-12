'use client';

import { useState, useEffect } from 'react';
import { PickupResult } from '@/lib/pickup';
import { formatDate } from '@/lib/rss';
import { translateText } from '@/lib/translate';

interface PickupSectionProps {
  pickups: PickupResult[];
}

interface TranslatedPickup {
  translatedTitle: string;
}

export function PickupSection({ pickups }: PickupSectionProps) {
  const [translations, setTranslations] = useState<Map<string, TranslatedPickup>>(new Map());
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translatePickups = async () => {
      if (pickups.length === 0) return;

      setIsTranslating(true);
      const newTranslations = new Map<string, TranslatedPickup>();

      for (const pickup of pickups) {
        try {
          const translatedTitle = await translateText(pickup.item.title, 'ja');
          newTranslations.set(pickup.item.link, { translatedTitle });
        } catch (error) {
          console.error('Translation error:', error);
        }
      }

      setTranslations(newTranslations);
      setIsTranslating(false);
    };

    translatePickups();
  }, [pickups]);

  const getTitle = (pickup: PickupResult) => {
    const translated = translations.get(pickup.item.link);
    return translated?.translatedTitle || pickup.item.title;
  };

  if (pickups.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl -z-10"></div>

      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Web開発者向けPickup
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              AI×開発に関連する注目記事を自動抽出
            </p>
          </div>
          {isTranslating && (
            <span className="ml-auto text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              翻訳中
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {pickups.slice(0, 6).map((pickup, index) => (
            <a
              key={`${pickup.item.link}-${index}`}
              href={pickup.item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass rounded-2xl p-4 card-hover block"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                      {pickup.item.source}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(pickup.item.pubDate)}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
                    {getTitle(pickup)}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {pickup.matchedKeywords.slice(0, 3).map((keyword) => (
                      <span
                        key={keyword}
                        className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
