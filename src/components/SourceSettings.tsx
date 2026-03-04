'use client';

import { useState, useEffect, useRef } from 'react';
import { RSS_FEEDS } from '@/lib/feeds';
import { getDisabledSources, setDisabledSources } from '@/lib/sourceSettings';

interface SourceSettingsProps {
  onChange: () => void;
}

// カテゴリ順
const CATEGORY_ORDER = ['日本語', '公式', 'MCP', '海外ニュース', 'コミュニティ', 'YouTube'];

const CATEGORY_ICONS: Record<string, string> = {
  '日本語': '🇯🇵',
  '公式': '🏢',
  'MCP': '🔌',
  '海外ニュース': '🌏',
  'コミュニティ': '💬',
  'YouTube': '▶️',
};

export function SourceSettings({ onChange }: SourceSettingsProps) {
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisabled(getDisabledSources());
  }, []);

  // パネル外クリックで閉じる
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (sourceName: string) => {
    const next = new Set(disabled);
    if (next.has(sourceName)) {
      next.delete(sourceName);
    } else {
      next.add(sourceName);
    }
    setDisabled(next);
    setDisabledSources(next);
    onChange();
  };

  const enableAll = () => {
    setDisabled(new Set());
    setDisabledSources(new Set());
    onChange();
  };

  // カテゴリごとにグループ化
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    sources: RSS_FEEDS.filter((f) => f.category === cat),
  }));

  const disabledCount = disabled.size;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
          disabledCount > 0
            ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-600 dark:text-violet-400'
            : 'glass text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
        }`}
        title="表示するソースを設定"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        ソース設定
        {disabledCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full text-xs bg-violet-500 text-white">
            {disabledCount}非表示
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 glass rounded-2xl shadow-xl border border-white/10 z-50 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <span className="font-medium text-sm text-slate-700 dark:text-white">表示ソースを選択</span>
            {disabledCount > 0 && (
              <button
                onClick={enableAll}
                className="text-xs text-indigo-500 hover:text-indigo-400 transition-colors"
              >
                すべて有効化
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto p-3 space-y-4">
            {grouped.map(({ category, sources }) => (
              <div key={category}>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2 px-1 flex items-center gap-1">
                  <span>{CATEGORY_ICONS[category]}</span>
                  <span>{category}</span>
                </div>
                <div className="space-y-1">
                  {sources.map((feed) => {
                    const isEnabled = !disabled.has(feed.name);
                    return (
                      <button
                        key={feed.name}
                        onClick={() => toggle(feed.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                          isEnabled
                            ? 'text-slate-700 dark:text-slate-200 hover:bg-white/10'
                            : 'text-slate-400 dark:text-slate-600 hover:bg-white/5'
                        }`}
                      >
                        <span className={isEnabled ? '' : 'line-through'}>
                          {feed.name.replace('YouTube: ', '')}
                        </span>
                        <div className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${
                          isEnabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}>
                          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${
                            isEnabled ? 'translate-x-4' : 'translate-x-0.5'
                          }`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
