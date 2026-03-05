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
- RSSパースは `DOMParser` でクライアントサイド手動パース（`rss-parser` は削除済み）

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
│   ├── layout.tsx      # ルートレイアウト（ToastProvider / LastUpdatedProvider）
│   └── globals.css     # グローバルスタイル
├── components/
│   ├── NewsCard.tsx        # ニュース1件のカード（ハイライト/既読/共有ボタン）
│   ├── NewsList.tsx        # ニュース一覧（検索・フィルター・ソート・ページネーション）
│   ├── PickupSection.tsx   # ピックアップ表示
│   ├── FilterBar.tsx       # ソースフィルター
│   ├── SearchBar.tsx       # 検索バー（外部キーワード連携対応）
│   ├── SortSelector.tsx    # ソート選択
│   ├── Pagination.tsx      # ページネーション
│   ├── Header.tsx          # ヘッダー（更新時刻表示）
│   ├── LanguageSwitch.tsx  # 言語切替
│   ├── DateRangeFilter.tsx # 日付範囲フィルター（全期間/今日/今週/今月）
│   ├── SourceSettings.tsx  # ソース別表示設定（カテゴリ別トグル）
│   ├── TrendingKeywords.tsx # トレンドキーワード表示
│   ├── Toast.tsx           # グローバルトースト通知
│   ├── ThemeProvider.tsx   # ダーク/ライトモード管理
│   └── ThemeToggle.tsx     # テーマ切替ボタン
├── lib/
│   ├── feeds.ts            # RSSフィード一覧定義
│   ├── constants.ts        # 定数集約（ITEMS_PER_PAGE, CORS_PROXIES 等）
│   ├── cache.ts            # RSSキャッシュ（localStorage, 1時間）
│   ├── readHistory.ts      # 既読管理（localStorage, 最大500件）
│   ├── sourceSettings.ts   # ソース表示設定（localStorage）
│   ├── trending.ts         # トレンドキーワード抽出ロジック
│   ├── lastUpdatedContext.tsx # 最終更新時刻Context
│   ├── pickup.ts           # ピックアップロジック
│   ├── priority.ts         # フィード優先度管理
│   ├── favorites.ts        # お気に入り機能（localStorage）
│   └── translate.ts        # 翻訳ユーティリティ（並列化済み）
├── types/
│   └── news.ts             # NewsItem / RSSFeed 型定義
scripts/
└── auto-push.sh            # src/ 監視 → 自動commit & push スクリプト
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
npm run dev        # 開発サーバー起動 (http://localhost:3000)
npm run build      # 静的ビルド → out/ に出力
npm run lint       # ESLint
npm run watch:push # src/ を監視して変更を自動commit & push
```

### 自動push (`watch:push`)

`scripts/auto-push.sh` を実行するnpmスクリプト。

- `src/` 内のファイル変更を3秒ごとにポーリングで検出
- 最後の変更から **10秒間** 変更がなければ自動的に `git add -A` → `git commit` → `git push origin main`
- コミットメッセージは `auto: YYYY-MM-DD HH:MM:SS` の形式
- push後、GitHub Actions が自動でデプロイを実行
- 停止: `Ctrl+C`

## 注意事項

- RSSフェッチは全てクライアントサイドで行う（静的サイトのためサーバーサイドAPIルートなし）
- CORSプロキシ `allorigins.win` に依存しているため、プロキシが落ちると全フィードが取得不可になる
- 各フィードから最大10件取得し、全件を日付降順でソート
