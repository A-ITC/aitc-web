# データ管理ガイド

作品・メンバーの情報は、管理画面を使わずJSONファイルで更新します。JSONはカンマやダブルクォートの不足で読み込めなくなるため、編集後は必ず `npm run build` を実行してください。

## メンバー

対象ファイル：`data/members.json`

```json
{
  "id": "alice",
  "name": "Alice",
  "generation": 12,
  "department": ["CG", "MV"],
  "profile": "自己紹介文",
  "links": [{ "name": "Portfolio", "url": "https://example.com" }]
}
```

- `id` は英小文字・数字・ハイフンで一意にします。プロフィールURLと作品の作者指定に使われます。
- メンバーアイコンは `id` からCloudFrontの `user-icon/<id>_icon.png` を参照します。取得に失敗した場合は、サイト内の共通アイコン `public/images/memberIcons/member-alice.svg` を表示します。
- `generation` は数値です。画面では「12期生」のように表示されます。
- `department` は `CG`、`DTM`、`PROG`、`MV` の配列です。複数の部門に所属する場合は、すべて指定します。

## イベント作品

対象ファイル：`data/eventWorks.json`

```json
{
  "id": "event-work-id",
  "title": "作品タイトル",
  "thumbnail": "/images/work-example.svg",
  "type": "Illustration",
  "description": "作品の説明",
  "creatorIds": ["alice"],
  "event": "COMITIA 153",
  "year": 2026,
  "links": [{ "name": "頒布ページ", "url": "https://example.com" }]
}
```

## 個人作品

対象ファイル：`data/personalWorks.json`

```json
{
  "id": "personal-work-id",
  "title": "作品タイトル",
  "thumbnail": "/images/work-example.svg",
  "creatorIds": ["alice"],
  "type": "Illustration",
  "description": "作品の説明",
  "createdAt": "2026-07-20",
  "links": [{ "name": "作品を見る", "url": "https://example.com" }]
}
```

## 共通ルール

- `creatorIds` は必ず `members.json` に存在する `id` を指定します。
- 作品種別には `Illustration`、`Programming`、`Movie`、`Music`、`Tool`、`Other` を使います。
- 日付は `YYYY-MM-DD` 形式、年は4桁の数値を使います。
- 外部リンクを用意しない場合は、`links` を空配列 `[]` にできます。
- Bandcamp をモーダル内で再生する場合は、Bandcamp の「Share / Embed」から取得したプレーヤーURLを、Bandcampリンクの `embedUrl` に設定します。`embedUrl` がない通常のリンクは、外部リンクとしてのみ表示されます。
- 新しい画像は `public/images/` に追加します。画像の内容が分かるファイル名と `alt` 用の作品タイトルを用意してください。
