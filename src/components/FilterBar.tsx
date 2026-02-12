'use client';

interface FilterBarProps {
  sources: string[];
  selectedSource: string;
  onSourceChange: (source: string) => void;
}

export function FilterBar({ sources, selectedSource, onSourceChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSourceChange('all')}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
          selectedSource === 'all'
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20'
            : 'glass text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
        }`}
      >
        すべて
      </button>
      {sources.map((source) => (
        <button
          key={source}
          onClick={() => onSourceChange(source)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
            selectedSource === source
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20'
              : 'glass text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          {source}
        </button>
      ))}
    </div>
  );
}
