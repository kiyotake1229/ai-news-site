'use client';

export type SortType = 'priority' | 'date';

interface SortSelectorProps {
  currentSort: SortType;
  onSortChange: (sort: SortType) => void;
}

export function SortSelector({ currentSort, onSortChange }: SortSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">並び順:</span>
      <div className="flex rounded-xl overflow-hidden glass">
        <button
          onClick={() => onSortChange('priority')}
          className={`px-4 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
            currentSort === 'priority'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span className="hidden sm:inline">おすすめ順</span>
          <span className="sm:hidden">優先</span>
        </button>
        <button
          onClick={() => onSortChange('date')}
          className={`px-4 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
            currentSort === 'date'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">新着順</span>
          <span className="sm:hidden">新着</span>
        </button>
      </div>
    </div>
  );
}
