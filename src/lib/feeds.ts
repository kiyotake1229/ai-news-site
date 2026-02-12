import { RSSFeed } from '@/types/news';

export const RSS_FEEDS: RSSFeed[] = [
  // === 日本語ニュース ===
  {
    name: 'ITmedia AI+',
    url: 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml',
    category: '日本語',
  },
  {
    name: 'GIGAZINE AI',
    url: 'https://gigazine.net/news/rss_2.0/',
    category: '日本語',
  },
  {
    name: 'Impress Watch AI',
    url: 'https://www.watch.impress.co.jp/data/rss/1.0/ipw/feed.rdf',
    category: '日本語',
  },
  {
    name: 'はてブ AI',
    url: 'https://b.hatena.ne.jp/search/tag?q=AI&mode=rss',
    category: '日本語',
  },
  {
    name: 'Zenn AI',
    url: 'https://zenn.dev/topics/ai/feed',
    category: '日本語',
  },
  {
    name: 'Qiita AI',
    url: 'https://qiita.com/tags/ai/feed',
    category: '日本語',
  },
  // === 公式ブログ ===
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    category: '公式',
  },
  {
    name: 'Google AI Blog',
    url: 'https://blog.google/technology/ai/rss/',
    category: '公式',
  },
  {
    name: 'Anthropic',
    url: 'https://www.anthropic.com/rss.xml',
    category: '公式',
  },
  // === MCP（Model Context Protocol）===
  {
    name: 'MCP - Hacker News',
    url: 'https://hnrss.org/newest?q=MCP+%22Model+Context+Protocol%22',
    category: 'MCP',
  },
  {
    name: 'MCP GitHub Releases',
    url: 'https://github.com/modelcontextprotocol/servers/releases.atom',
    category: 'MCP',
  },
  {
    name: 'MCP Spec Updates',
    url: 'https://github.com/modelcontextprotocol/specification/releases.atom',
    category: 'MCP',
  },
  {
    name: 'MCP - Reddit',
    url: 'https://www.reddit.com/search.rss?q=MCP%20%22Model%20Context%20Protocol%22&sort=new',
    category: 'MCP',
  },
  // === 海外ニュース ===
  {
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/feed/',
    category: '海外ニュース',
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    category: '海外ニュース',
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
    category: '海外ニュース',
  },
  // === コミュニティ ===
  {
    name: 'Hacker News AI',
    url: 'https://hnrss.org/newest?q=AI+OR+GPT+OR+LLM+OR+Claude+OR+Gemini',
    category: 'コミュニティ',
  },
  // === YouTube ===
  {
    name: 'YouTube: Two Minute Papers',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCbfYPyITQ-7l4upoX8nvctg',
    category: 'YouTube',
  },
  {
    name: 'YouTube: Yannic Kilcher',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCZHmQk67mN31gbHey6xYQFg',
    category: 'YouTube',
  },
  {
    name: 'YouTube: AI Explained',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCNF0zNITJfSZKi6X_Wv-Krw',
    category: 'YouTube',
  },
  {
    name: 'YouTube: Matt Wolfe',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCJIfeSCssxSC_Dhc5s7woww',
    category: 'YouTube',
  },
  {
    name: 'YouTube: Fireship',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCsBjURrPoezykLs9EqgamOA',
    category: 'YouTube',
  },
  {
    name: 'YouTube: TheAIGRID',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCp2gm-6Ey4QYg9rdEyUfN3g',
    category: 'YouTube',
  },
];
