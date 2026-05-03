---
title: "このページについて（サンプル）"
date: "2026-05-03"
source_url: "https://example.com"
source_kind: "article"
---

※本ページはプロモーションが含まれています（アフィリエイト広告を利用しています）。

# このページについて（サンプル）

> **表示**: この記事には第三者配信の広告・アフィリエイトリンクが含まれる場合があります。

動画や記事 URL から「紹介されている便利グッズ」を読み取り、**百均で試せる類似品**と **Amazon / 楽天で買える耐久寄りの上位版** を並べた比較記事を、Python ツールが自動で `content/affiliate/` に書き出します。

## 使い方（ローカル）

```bash
bash tools/affiliate/run_generate.sh --url "https://www.youtube.com/watch?v=..." --dry-run
```

`OPENAI_API_KEY` と各種アフィリエイト用環境変数を設定したうえで `--dry-run` を外すと、本番の比較本文が生成されます。

## cron の例

```cron
0 9 * * * cd /path/to/百均紹介 && bash tools/affiliate/run_generate.sh --url "https://..."
```

---

### 関連を検索（サンプル）

- （リンク未設定）環境変数 `AMAZON_ASSOCIATE_TAG` / `RAKUTEN_SEARCH_LINK_TEMPLATE` / `A8_LINK_TEMPLATE` を設定してください。

## まとめ

このファイルはプレースホルダーです。ツール実行後は `manifest.json` にエントリが追加され、本サイトの一覧から開けます。
