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
      q: text.substring(0, 500),
      langpair: `${sourceLang}|${targetLang}`,
    });

    const response = await fetch(`${MYMEMORY_API}?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

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

const BATCH_SIZE = 5;

export async function translateBatch(
  texts: string[],
  targetLang: 'ja' | 'en'
): Promise<string[]> {
  const results: string[] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const chunk = texts.slice(i, i + BATCH_SIZE);
    const translated = await Promise.all(chunk.map((t) => translateText(t, targetLang)));
    results.push(...translated);
  }

  return results;
}
