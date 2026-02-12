const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

// 翻訳キャッシュ（同じテキストを何度も翻訳しないように）
const translationCache = new Map<string, string>();

export async function translateText(
  text: string,
  targetLang: 'ja' | 'en'
): Promise<string> {
  if (!text || text.trim() === '') return text;

  const cacheKey = `${text}_${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  const sourceLang = targetLang === 'ja' ? 'en' : 'ja';

  try {
    const params = new URLSearchParams({
      q: text.substring(0, 500), // API制限対策
      langpair: `${sourceLang}|${targetLang}`,
    });

    const response = await fetch(`${MYMEMORY_API}?${params}`);
    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      translationCache.set(cacheKey, translated);
      return translated;
    }

    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

export async function translateBatch(
  texts: string[],
  targetLang: 'ja' | 'en'
): Promise<string[]> {
  // 並列で翻訳（ただしレート制限を考慮して少し間隔を空ける）
  const results: string[] = [];

  for (const text of texts) {
    const translated = await translateText(text, targetLang);
    results.push(translated);
    // レート制限対策で少し待機
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}
