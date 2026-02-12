import { fetchAllFeeds } from '@/lib/rss';
import { pickupWebDevNews } from '@/lib/pickup';
import { NewsList } from '@/components/NewsList';
import { PickupSection } from '@/components/PickupSection';

// 1時間ごとに再検証（キャッシュ更新）
export const revalidate = 3600;

export default async function Home() {
  const news = await fetchAllFeeds();
  const pickups = pickupWebDevNews(news);

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
            リアルタイム更新
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

      {/* Web開発者向けPickupセクション */}
      <PickupSection pickups={pickups} />

      {/* 全ニュース一覧 */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            すべてのニュース
          </h2>
        </div>
        <NewsList initialNews={news} />
      </div>
    </div>
  );
}
