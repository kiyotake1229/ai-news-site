'use client';

export type DateRange = 'all' | 'today' | 'week' | 'month';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const OPTIONS: { label: string; value: DateRange }[] = [
  { label: '全期間', value: 'all' },
  { label: '今日', value: 'today' },
  { label: '今週', value: 'week' },
  { label: '今月', value: 'month' },
];

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            value === opt.value
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30'
              : 'glass text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
