'use client';

export type Language = 'original' | 'ja' | 'en';

interface LanguageSwitchProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  isTranslating: boolean;
}

export function LanguageSwitch({
  currentLang,
  onLanguageChange,
  isTranslating,
}: LanguageSwitchProps) {
  const languages: { value: Language; label: string; icon: string }[] = [
    { value: 'original', label: 'オリジナル', icon: '🌐' },
    { value: 'ja', label: '日本語', icon: '🇯🇵' },
    { value: 'en', label: 'English', icon: '🇺🇸' },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">翻訳:</span>
      <div className="flex rounded-xl overflow-hidden glass">
        {languages.map((lang) => (
          <button
            key={lang.value}
            onClick={() => onLanguageChange(lang.value)}
            disabled={isTranslating}
            className={`px-4 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
              currentLang === lang.value
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span>{lang.icon}</span>
            <span className="hidden sm:inline">{lang.label}</span>
          </button>
        ))}
      </div>
      {isTranslating && (
        <span className="text-sm text-indigo-500 dark:text-indigo-400 flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          翻訳中...
        </span>
      )}
    </div>
  );
}
