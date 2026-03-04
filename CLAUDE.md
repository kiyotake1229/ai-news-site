# CLAUDE.md

## プロジェクト概要

AI関連ニュースを自動収集して表示するNext.js製静的サイト。
RSSフィードをCORSプロキシ経由でクライアントサイドから取得して表示する。

- **リポジトリ**: https://github.com/kiyotake1229/ai-news-site
- **公開URL**: https://kiyotake1229.github.io/ai-news-site/

## 技術スタック

- **Next.js 16** (App Router, Static Export)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS v4**
- **rss-parser** (使用は限定的、クライアントではDOMParserでXMLを手動パース)

## アーキテクチャ

- **静的サイト生成**: `next.config.ts` で `output: "export"` → `out/` に出力
- **basePath**: 本番環境では `/ai-news-site`（GitHub Pagesのリポジトリ名に合わせる）
- **RSSフェッチ**: `page.tsx` がクライアントコンポーネント (`'use client'`)。CORSプロキシ `https://api.allorigins.win/raw?url=` を経由してフェッチ
- **フィード定義**: `src/lib/feeds.ts` の `RSS_FEEDS` 配列で管理

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx        # メインページ（クライアントコンポーネント、RSSフェッチ）
│   ├── layout.tsx      # ルートレイアウト
│   └── globals.css     # グローバルスタイル
├── components/
│   ├── NewsCard.tsx     # ニュース1件のカード
│   ├── NewsList.tsx     # ニュース一覧（検索・フィルター・ソート・ページネーション）
│   ├── PickupSection.tsx # ピックアップ表示
│   ├── FilterBar.tsx    # カテゴリフィルター
│   ├── SearchBar.tsx    # 検索バー
│   ├── SortSelector.tsx # ソート選択
│   ├── Pagination.tsx   # ページネーション
│   ├── Header.tsx       # ヘッダー
│   ├── LanguageSwitch.tsx # 言語切替
│   ├── ThemeProvider.tsx  # ダーク/ライトモード管理
│   └── ThemeToggle.tsx    # テーマ切替ボタン
├── lib/
│   ├── feeds.ts         # RSSフィード一覧定義（カテゴリ: 日本語/公式/MCP/海外ニュース/コミュニティ/YouTube）
│   ├── rss.ts           # RSS関連ユーティリティ
│   ├── pickup.ts        # ピックアップロジック
│   ├── priority.ts      # フィード優先度管理
│   ├── favorites.ts     # お気に入り機能（localStorage）
│   └── translate.ts     # 翻訳ユーティリティ
└── types/
    └── news.ts          # NewsItem / RSSFeed 型定義
```

## RSSフィードカテゴリ

`src/lib/feeds.ts` で管理。カテゴリ一覧:
- `日本語`: ITmedia, GIGAZINE, Impress Watch, はてブ, Zenn, Qiita
- `公式`: OpenAI Blog, Google AI Blog, Anthropic
- `MCP`: Hacker News MCP, GitHub Releases (modelcontextprotocol)
- `海外ニュース`: MIT Technology Review, The Verge AI, Ars Technica
- `コミュニティ`: Hacker News AI
- `YouTube`: Two Minute Papers, Yannic Kilcher, AI Explained, Matt Wolfe, Fireship, TheAIGRID

## デプロイ

- `main` ブランチへのpushで GitHub Actions (`deploy.yml`) が自動実行
- `npm ci` → `npm run build` → `out/` を GitHub Pages へ公開
- 手動実行: `workflow_dispatch` でも起動可能

## ローカル開発

```bash
npm run dev     # 開発サーバー起動 (http://localhost:3000)
npm run build   # 静的ビルド → out/ に出力
npm run lint    # ESLint
```

## 注意事項

- RSSフェッチは全てクライアントサイドで行う（静的サイトのためサーバーサイドAPIルートなし）
- CORSプロキシ `allorigins.win` に依存しているため、プロキシが落ちると全フィードが取得不可になる
- 各フィードから最大10件取得し、全件を日付降順でソート
