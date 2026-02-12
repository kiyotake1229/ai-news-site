import { NewsItem } from '@/types/news';

// Webサイト作成に関連するキーワード
const WEB_DEV_KEYWORDS = [
  // 開発全般
  'web', 'website', 'frontend', 'front-end', 'backend', 'back-end',
  'fullstack', 'full-stack', 'developer', 'development', 'programming',
  'coding', 'code', 'engineer',
  // フレームワーク・ライブラリ
  'react', 'vue', 'angular', 'next.js', 'nextjs', 'nuxt', 'svelte',
  'tailwind', 'css', 'html', 'javascript', 'typescript', 'node.js', 'nodejs',
  // AI開発ツール
  'copilot', 'cursor', 'v0', 'vercel', 'replit', 'bolt', 'lovable',
  'claude code', 'windsurf', 'cline', 'aider',
  // デザイン・UI
  'ui', 'ux', 'design', 'figma', 'prototype', 'wireframe',
  'component', 'layout', 'responsive',
  // コード生成
  'code generation', 'code completion', 'autocomplete', 'snippet',
  'refactor', 'debug', 'testing', 'test',
  // CMS・ノーコード
  'cms', 'wordpress', 'no-code', 'low-code', 'nocode', 'lowcode',
  'builder', 'editor', 'drag and drop',
  // API・バックエンド
  'api', 'rest', 'graphql', 'database', 'server', 'deploy', 'hosting',
  // その他
  'app', 'application', 'software', 'tool', 'ide', 'vscode',
];

// 日本語キーワード
const WEB_DEV_KEYWORDS_JA = [
  'ウェブ', 'サイト', 'フロントエンド', 'バックエンド',
  '開発', 'プログラミング', 'コーディング', 'エンジニア',
  'デザイン', 'コード生成', 'ノーコード', 'ローコード',
  'アプリ', 'ツール', '自動生成', '効率化',
];

export interface PickupResult {
  item: NewsItem;
  score: number;
  matchedKeywords: string[];
}

export function analyzeWebDevRelevance(news: NewsItem): PickupResult | null {
  const text = `${news.title} ${news.description || ''}`.toLowerCase();
  const matchedKeywords: string[] = [];
  let score = 0;

  // 英語キーワードチェック
  for (const keyword of WEB_DEV_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
      score += 1;

      // 特に重要なキーワードは加点
      if (['copilot', 'cursor', 'v0', 'code generation', 'claude code', 'bolt', 'lovable'].includes(keyword)) {
        score += 2;
      }
    }
  }

  // 日本語キーワードチェック
  for (const keyword of WEB_DEV_KEYWORDS_JA) {
    if (text.includes(keyword)) {
      matchedKeywords.push(keyword);
      score += 1;
    }
  }

  // スコアが2以上なら関連記事として返す
  if (score >= 2) {
    return {
      item: news,
      score,
      matchedKeywords: [...new Set(matchedKeywords)], // 重複除去
    };
  }

  return null;
}

export function pickupWebDevNews(news: NewsItem[]): PickupResult[] {
  const results: PickupResult[] = [];

  for (const item of news) {
    const result = analyzeWebDevRelevance(item);
    if (result) {
      results.push(result);
    }
  }

  // スコア順にソート（高い順）
  results.sort((a, b) => b.score - a.score);

  // 上位10件を返す
  return results.slice(0, 10);
}
