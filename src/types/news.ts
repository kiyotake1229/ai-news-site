export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceUrl: string;
  description?: string;
  categories?: string[];
}

export interface RSSFeed {
  name: string;
  url: string;
  category: string;
}
