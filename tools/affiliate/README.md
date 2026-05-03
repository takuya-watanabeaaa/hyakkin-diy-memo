# アフィリエイト比較記事ジェネレーター（Python）

YouTube 字幕または記事 URL から便利グッズを抽出します。**フェーズ別パイプライン**はリポジトリ直下の `output/` に Markdown を書き出します（`tools/affiliate/main.py`）。従来のワンショット生成は `content/affiliate/` と `manifest.json`（`npm run affiliate:generate`）です。Next.js の `/affiliate` は主に `content/affiliate` を参照します。

### フェーズ対応（Role / Task / Rule の分割）

| フェーズ | モジュール・ファイル | 役割 |
|---------|---------------------|------|
| 1 | `.env` / `.env.example`、`affiliate_tool/config.py`、`dotenv_loader.py` | ID・テンプレを環境変数に隔離 |
| 2 | `affiliate_tool/analyzer.py` | 字幕・記事テキストから要約・商品リスト・ジャンル |
| 3 | `affiliate_tool/product_matcher.py` | 百均 vs 高性能の LLM 推論・比較文 |
| 4 | `tools/affiliate/main.py` | 統合 CLI → `output/*.md` |

## セットアップ

```bash
cd tools/affiliate
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

環境変数はリポジトリ直下の `.env` に書くか、実行前に `export` してください（`.env.example` 参照）。

## 実行

リポジトリルートから:

```bash
npm run affiliate:generate -- --url "https://www.youtube.com/watch?v=..." --dry-run
npm run affiliate:generate -- --url "https://example.com/article"
```

フェーズ4の統合パイプライン（`output/` へ保存）:

```bash
npm run affiliate:pipeline -- --url "https://www.youtube.com/watch?v=..." --dry-run
npm run affiliate:pipeline -- --url "https://example.com/article"
```

サイトの `/affiliate` に載せる（`content/affiliate` + `manifest.json` 更新）:

```bash
npm run affiliate:pipeline:site -- --url "https://www.youtube.com/watch?v=..."
```

`RAKUTEN_AFFILIATE_ID` のみ設定されている場合、楽天リンクは `hb.afl.rakuten.co.jp` 経由の市場検索 URL を自動生成します（`RAKUTEN_SEARCH_LINK_TEMPLATE` で上書き可）。

- `--dry-run`: 本文取得のみ・プレースホルダー MD（OpenAI 不使用）
- 本番: `OPENAI_API_KEY` と `AMAZON_ASSOCIATE_TAG` 等を設定し `--dry-run` を外す

## cron 例

```cron
0 9 * * * cd /path/to/repo && /usr/bin/bash tools/affiliate/run_generate.sh --url "https://..." >> /var/log/affiliate.log 2>&1
```

生成後、`content/affiliate` をコミットしてデプロイすると本番に反映されます（静的ビルドのため）。

## 生成 → git push まで自動（サーバー / cron）

リポジトリで `git remote` と認証（HTTPS の credential helper または SSH）が済んでいる環境なら、生成直後にコミットしてプッシュできます。

```bash
npm run affiliate:generate -- \
  --url "https://www.youtube.com/watch?v=..." \
  --git-commit-push \
  -m "chore(affiliate): add article from cron"
```

- `--dry-run` を付けたときは **記事も git も実際にはプッシュしません**（安全のため）。
- プッシュだけ試したい場合は `--git-push-dry-run`。
- リモート名を変える場合は環境変数 `GIT_REMOTE`（既定 `origin`）。

## GitHub Actions（このリポジトリ）

| Workflow | 役割 |
|----------|------|
| `.github/workflows/ci.yml`（リポジトリルート） | `main` への push / PR で `npm ci` と `npm run build` を実行 |
| `.github/workflows/deploy-vercel.yml` | **任意**。`VERCEL_*` Secrets とリポジトリ変数で Actions から Vercel 本番デプロイ |
| `.github/workflows/affiliate-generate.yml` | **任意**。手動実行で `tools/affiliate/main.py` を走らせ、`output/` を Artifact にアップロード |
| `.github/workflows/affiliate-channel-watch.yml` | **任意**。定期または手動で YouTube チャンネル新着を検知し `main.py` を連続実行（状態は Actions cache） |

### YouTube チャンネル新着（`channel_watch.py`）

1. Google Cloud で **YouTube Data API v3** を有効にし API キーを発行する。
2. `.env` に `YOUTUBE_API_KEY` と `YOUTUBE_CHANNEL_ID`（`UC…`）を設定する。
3. 実行例:

```bash
npm run affiliate:channel-watch -- --dry-run
npm run affiliate:channel-watch -- --first-run generate-latest
```

初回は既定 `--first-run skip` で **最新動画 ID だけ状態に保存**し、過去分を一括生成しません。記事にしたい場合は `--first-run generate-latest` を付けます。

**A8 の第2テンプレ**（`A8_LINK_TEMPLATE_ALT`）は、商品ごとの `search_keywords.a8_template` が `alt` のとき、または `A8_ALT_KEYWORD_REGEX` が Amazon 系キーワードにマッチするときに使われます（どちらも未設定なら従来どおりプライマリのみ）。

### おすすめ: Vercel の GitHub 連携のみ

Vercel ダッシュボードで GitHub リポジトリを接続しておけば、**push だけで Vercel が自動ビルド・公開**します。この場合 `deploy-vercel.yml` は **無効のまま**で問題ありません（二重デプロイ防止）。

### Actions から Vercel へデプロイしたい場合

1. Vercel で **Token / Org ID / Project ID** を取得する。
2. GitHub リポジトリの **Settings → Secrets and variables → Actions** に  
   `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` を登録。
3. **Settings → Secrets and variables → Actions → Variables** に  
   `ENABLE_VERCEL_GITHUB_ACTION` = `true` を追加（`main` への push で Workflow が動く）。
4. Vercel 側の「Git 連携による自動デプロイ」をオフにするか、どちらか一方に統一する。

手動だけ実行したい場合は Variables を設定せず、Actions タブから **Deploy Production (Vercel)** を `workflow_dispatch` 実行する（Secrets は必須）。

## Python API（Gemini 風）

独自スクリプトからも、`content`（導入文）と `products`（LLM と同じ辞書のリスト）で Markdown を組み立てられます。

```python
from affiliate_tool.config import Settings
from affiliate_tool.markdown_builder import generate_markdown

settings = Settings.from_env()
md = generate_markdown(
    "ここに導入や本文テキスト…",
    products=[],  # LLM の products 配列と同じ形
    settings=settings,
    title="動画で紹介された便利グッズまとめ",
    date_iso="2026-05-03",
    source_url="https://...",
    source_kind="youtube",
)
```

出力先頭は YAML フロントマター + 「※本ページはプロモーションが含まれています…」です（サイト表示時はフロントマターを除去してレンダリングします）。

## 注意

- 各 ASP の規約・表示義務（ステマ規制等）を遵守してください。
- 楽天・A8 のリンクはプログラムごとに形式が異なるため、`RAKUTEN_SEARCH_LINK_TEMPLATE` / `A8_LINK_TEMPLATE` は自分の発行リンクに合わせて設定してください。
