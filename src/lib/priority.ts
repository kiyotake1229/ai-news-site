import { NewsItem } from '@/types/news';

// 重要なキーワード（スコア付き）
const IMPORTANT_KEYWORDS: { keyword: string; score: number }[] = [
  // 最重要（新発表・リリース）
  { keyword: 'launch', score: 10 },
  { keyword: 'released', score: 10 },
  { keyword: 'releases', score: 10 },
  { keyword: 'announce', score: 10 },
  { keyword: 'announcing', score: 10 },
  { keyword: 'introducing', score: 10 },
  { keyword: 'リリース', score: 10 },
  { keyword: '発表', score: 10 },
  { keyword: '公開', score: 8 },
  { keyword: '登場', score: 8 },

  // 重要（アップデート・変更）
  { keyword: 'update', score: 7 },
  { keyword: 'upgrade', score: 7 },
  { keyword: 'new feature', score: 8 },
  { keyword: 'new model', score: 9 },
  { keyword: 'アップデート', score: 7 },
  { keyword: '新機能', score: 8 },
  { keyword: '新モデル', score: 9 },

  // 重要（ビジネスインパクト）
  { keyword: 'breaking', score: 10 },
  { keyword: 'major', score: 6 },
  { keyword: 'partnership', score: 7 },
  { keyword: 'acquisition', score: 8 },
  { keyword: '提携', score: 7 },
  { keyword: '買収', score: 8 },
  { keyword: '資金調達', score: 7 },

  // API・開発者向け
  { keyword: 'api', score: 6 },
  { keyword: 'sdk', score: 6 },
  { keyword: 'pricing', score: 7 },
  { keyword: '料金', score: 7 },
  { keyword: '価格', score: 6 },
  { keyword: '無料', score: 5 },
  { keyword: 'free', score: 5 },
  { keyword: 'open source', score: 7 },
  { keyword: 'オープンソース', score: 7 },

  // 次世代モデル
  { keyword: 'gpt-5', score: 15 },
  { keyword: 'gpt5', score: 15 },
  { keyword: 'claude 4', score: 15 },
  { keyword: 'claude-4', score: 15 },
  { keyword: 'gemini 2', score: 12 },
  { keyword: 'gemini 3', score: 15 },
  { keyword: 'o1', score: 8 },
  { keyword: 'o3', score: 10 },

  // セキュリティ・規制
  { keyword: 'security', score: 6 },
  { keyword: 'vulnerability', score: 7 },
  { keyword: 'regulation', score: 6 },
  { keyword: 'セキュリティ', score: 6 },
  { keyword: '規制', score: 6 },

  // チュートリアル・ハウツー
  { keyword: 'tutorial', score: 4 },
  { keyword: 'how to', score: 4 },
  { keyword: 'guide', score: 4 },
  { keyword: '使い方', score: 4 },
  { keyword: '入門', score: 4 },
  { keyword: '解説', score: 3 },
];

// ソースの重要度スコア
const SOURCE_SCORES: { [key: string]: number } = {
  // 公式（最重要）
  'OpenAI Blog': 15,
  'Google AI Blog': 15,
  'Anthropic': 15,

  // MCP関連
  'MCP GitHub Releases': 12,
  'MCP Spec Updates': 12,
  'MCP - Hacker News': 8,
  'MCP - Reddit': 6,

  // 日本語ニュース
  'ITmedia AI+': 8,
  'GIGAZINE AI': 7,
  'Impress Watch AI': 7,
  'Zenn AI': 6,
  'Qiita AI': 5,
  'はてブ AI': 5,

  // 海外ニュース
  'MIT Technology Review': 10,
  'The Verge AI': 8,
  'Ars Technica': 7,

  // コミュニティ
  'Hacker News AI': 6,

  // YouTube
  'YouTube: Two Minute Papers': 9,
  'YouTube: Yannic Kilcher': 8,
  'YouTube: AI Explained': 8,
  'YouTube: Matt Wolfe': 7,
  'YouTube: Fireship': 8,
  'YouTube: TheAIGRID': 7,
};

// 時間による減衰（新しいほど高スコア）
function getRecencyScore(pubDate: string): number {
  const now = new Date();
  const published = new Date(pubDate);
  const hoursAgo = (now.getTime() - published.getTime()) / (1000 * 60 * 60);

  if (hoursAgo < 6) return 10;      // 6時間以内
  if (hoursAgo < 24) return 8;      // 24時間以内
  if (hoursAgo < 48) return 6;      // 2日以内
  if (hoursAgo < 72) return 4;      // 3日以内
  if (hoursAgo < 168) return 2;     // 1週間以内
  return 1;
}

export interface ScoredNewsItem extends NewsItem {
  priorityScore: number;
  scoreBreakdown: {
    source: number;
    keywords: number;
    recency: number;
  };
}

export function calculatePriorityScore(news: NewsItem): ScoredNewsItem {
  const text = `${news.title} ${news.description || ''}`.toLowerCase();

  // ソーススコア
  const sourceScore = SOURCE_SCORES[news.source] || 3;

  // キーワードスコア
  let keywordScore = 0;
  for (const { keyword, score } of IMPORTANT_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      keywordScore += score;
    }
  }
  // キーワードスコアの上限
  keywordScore = Math.min(keywordScore, 30);

  // 時間スコア
  const recencyScore = getRecencyScore(news.pubDate);

  // 総合スコア（重み付け）
  const priorityScore = (sourceScore * 2) + keywordScore + (recencyScore * 1.5);

  return {
    ...news,
    priorityScore,
    scoreBreakdown: {
      source: sourceScore,
      keywords: keywordScore,
      recency: recencyScore,
    },
  };
}

export function sortByPriority(news: NewsItem[]): ScoredNewsItem[] {
  return news
    .map(calculatePriorityScore)
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export function sortByDate(news: NewsItem[]): NewsItem[] {
  return [...news].sort((a, b) => {
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });
}

// 優先度レベルを取得
export function getPriorityLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 50) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}
