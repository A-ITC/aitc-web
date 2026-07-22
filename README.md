# AITC Web

AITC（Alumni of Information and Technology Club）の活動、イベント作品、個人作品、メンバーを紹介する静的Webサイトです。

## 主な機能

- AITCの概要と活動紹介
- イベント作品集・個人作品集
- 作品の年・作者・イベントによるフィルタと並び替え
- 作品詳細モーダルと関連作品表示
- メンバー一覧、加入期・所属部門によるフィルタ
- メンバープロフィールと制作作品一覧
- モバイル対応、キーボード操作、画像の遅延読込

## 利用技術

| 分類 | 技術 |
| --- | --- |
| フレームワーク | Next.js 16（App Router） |
| UI | React 19、TypeScript |
| スタイル | CSS、CSS Modules |
| データ管理 | JSONファイル |
| 出力形式 | Next.js Static Export |

## ディレクトリ構成

```text
.
├── app/                         # Next.jsのルーティングと共通スタイル
│   ├── event-works/             # イベント作品集
│   ├── personal-works/          # 個人作品集
│   ├── members/                 # メンバー一覧・プロフィール・フィルタルート
│   ├── globals.css              # 共通スタイル
│   └── layout.tsx               # HTMLメタデータとルートレイアウト
├── components/                  # UIコンポーネント
│   ├── pages/                   # ページ本体コンポーネント
│   ├── data.ts                  # データ読込・型・共通関数
│   ├── layout.tsx               # Header、Footer、Layout、ロゴ
│   ├── work-ui.tsx              # 作品カード・詳細モーダル
│   └── members.module.css       # メンバー一覧専用スタイル
├── data/                        # メンバー・作品データのJSON
│   ├── members.json
│   ├── eventWorks.json
│   └── personalWorks.json
├── docs/                        # 開発・データ管理ドキュメント
│   ├── architecture.md
│   └── data-management.md
├── public/images/               # サムネイル・メンバーアイコン
├── next.config.ts               # 静的エクスポート設定
└── package.json
```

## 必要環境

- Node.js 20以降
- npm 10以降

## 開発方法

依存関係をインストールします。

```bash
npm install
```

開発サーバーを起動し、表示された `http://localhost:3000` をブラウザで開きます。

```bash
npm run dev
```

## 静的ビルド

```bash
npm run build
```

ビルド結果は `out/` に生成されます。`out/` は直接ファイルとして開かず、GitHub Pages、Netlify、Cloudflare Pagesなどの静的ホスティング、またはHTTPサーバーで配信してください。

## トラブルシューティング

### フィルタが更新されない／HMRのWebSocketエラーが表示される

開発中は、表示URLとして `http://localhost:3000` を使用してください。`http://192.168.x.x:3000` のようなローカルネットワークIPで開くと、Next.jsの自動更新（HMR）用WebSocketが接続できず、次のようなエラーが繰り返し表示されることがあります。

```text
WebSocket connection to 'ws://192.168.x.x:3000/_next/webpack-hmr…' failed
```

この状態では、フィルタ・並び替え・モーダルなどのクライアント側操作が正しく反映されない場合があります。

1. `npm run dev` を実行します。
2. 古い開発タブを閉じます。
3. `http://localhost:3000` をブラウザで開きます。

別端末から確認する必要がある場合は、Windows Defender Firewall、VPN、プロキシがポート3000のWebSocket通信を妨げていないか確認してください。

## コンテンツの更新

作品とメンバーは `data/` 配下のJSONを編集して更新します。画像は `public/images/` に置き、JSONから `/images/ファイル名` として参照します。

JSONの項目、追加例、注意事項は [データ管理ガイド](./docs/data-management.md) を参照してください。コンポーネント構成と実装方針は [アーキテクチャドキュメント](./docs/architecture.md) に記載しています。

## ライセンス

© 2026 AITC All Rights Reserved.
