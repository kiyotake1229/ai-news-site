import { NewsItem } from '@/types/news';

// 除外ワード（英語）
const EN_STOP = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with','by',
  'from','is','are','was','were','be','been','has','have','had','will','would',
  'could','should','may','might','can','this','that','it','its','as','not',
  'new','now','how','why','what','when','where','who','which','all','more',
  'also','into','about','over','after','out','up','one','two','use','get',
  'make','just','like','know','than','then','them','they','their','our','your',
  'The','New','How','Top','Why','Best','Get','Can','Did','Does','Has',
]);

// 除外ワード（日本語）
const JA_STOP = new Set([
  '機能','利用','公開','発表','提供','対応','実現','開始','更新','追加',
  '方法','場合','内容','問題','情報','記事','サービス','システム','ツール',
  '使用','設定','確認','導入','適用','変更','改善','対策','影響','関連',
]);

function extractWords(text: string): string[] {
  const words: string[] = [];

  // 英語: 大文字始まり4文字以上 or 全大文字2文字以上 (GPT, LLM, RAG, OpenAI, Claude...)
  const en = text.match(/\b[A-Z]{2,}\b|\b[A-Z][a-zA-Z0-9]{3,}\b/g) || [];
  words.push(...en.filter(w => !EN_STOP.has(w)));

  // カタカナ: 3文字以上 (エージェント, モデル...)
  const kata = text.match(/[\u30A0-\u30FF]{3,}/g) || [];
  words.push(...kata);

  // 漢字+ひらがな混じりの重要な複合語 (人工知能, 生成AI...)
  const ja = text.match(/[\u4E00-\u9FFF]{2,4}(?:AI|人工|生成|学習|認識)?/g) || [];
  words.push(...ja.filter(w => !JA_STOP.has(w)));

  return words;
}

export function getTrendingKeywords(news: NewsItem[], topN = 12): Array<{ word: string; count: number }> {
  const counts = new Map<string, number>();

  for (const item of news) {
    const text = `${item.title} ${item.description || ''}`;
    const words = extractWords(text);

    // 重複除去してカウント（同一記事で同じ単語は1回だけカウント）
    const seen = new Set<string>();
    for (const word of words) {
      if (!seen.has(word)) {
        counts.set(word, (counts.get(word) || 0) + 1);
        seen.add(word);
      }
    }
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
}
