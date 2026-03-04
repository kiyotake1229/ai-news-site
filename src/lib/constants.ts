export const ITEMS_PER_FEED = 10;
export const ITEMS_PER_PAGE = 10;
export const PICKUP_COUNT = 6;
export const CACHE_DURATION_MS = 60 * 60 * 1000; // 1時間
export const FETCH_TIMEOUT_MS = 15000;
export const MAX_DESCRIPTION_LENGTH = 300;
export const MAX_FAVORITES = 1000;
export const AUTO_REFRESH_INTERVAL = 30 * 60 * 1000; // 30分

// CORSプロキシ（フォールバック順）
export const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest=',
];
