#!/usr/bin/env python3
"""
フェーズ4: 解析 → マッチング → アフィリエイト付き Markdown を output/ に保存する統合 CLI。

どこから実行しても import できるよう、パッケージディレクトリを sys.path に追加する。
"""

from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime
from pathlib import Path

TOOL_DIR = Path(__file__).resolve().parent
if str(TOOL_DIR) not in sys.path:
    sys.path.insert(0, str(TOOL_DIR))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="アフィリエイト記事フルパイプライン（analyzer → product_matcher → Markdown → output/）"
    )
    parser.add_argument("--url", required=True, help="YouTube または記事 URL")
    parser.add_argument(
        "--output-dir",
        default=None,
        help="出力ディレクトリ（既定: リポジトリ直下の output/）",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="取得のみ・プレースホルダー MD（LLM 不使用・matcher 不使用）",
    )
    parser.add_argument(
        "--site",
        action="store_true",
        help="Next.js 用に content/affiliate へ保存し manifest.json を更新（/affiliate に表示）",
    )
    args = parser.parse_args(argv)

    from affiliate_tool.analyzer import analyze_content, fetch_raw_document
    from affiliate_tool.config import Settings
    from affiliate_tool.dotenv_loader import load_application_dotenv, repo_root
    from affiliate_tool.llm_extract import slug_from_parts
    from affiliate_tool.markdown_builder import build_markdown_llm, build_markdown_stub
    from affiliate_tool.product_matcher import build_article_payload
    from affiliate_tool.url_detect import detect_source_kind

    load_application_dotenv()
    root = repo_root()
    publish_to_site = args.site or os.environ.get(
        "AFFILIATE_PIPELINE_PUBLISH_SITE", ""
    ).strip().lower() in ("1", "true", "yes")
    if args.output_dir:
        out_dir = Path(args.output_dir).resolve()
    elif publish_to_site:
        out_dir = (root / "content" / "affiliate").resolve()
    else:
        out_dir = (root / "output").resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    settings = Settings.from_env(output_dir=out_dir)

    url = args.url.strip()
    kind = detect_source_kind(url)
    doc = fetch_raw_document(url)
    date_prefix = datetime.now().strftime("%Y%m%d")
    slug = slug_from_parts(date_prefix, url + "|" + kind)
    md_path = out_dir / f"{slug}.md"

    if args.dry_run:
        md = build_markdown_stub(url, kind, doc.text[:4000])
        md_path.write_text(md, encoding="utf-8")
        print(f"OK [dry-run] wrote {md_path}")
        return 0

    if not settings.openai_api_key:
        print("ERROR: OPENAI_API_KEY が未設定です。.env を確認するか --dry-run を使ってください。", file=sys.stderr)
        return 1

    analysis = analyze_content(doc.text, url, kind, settings)
    payload = build_article_payload(analysis, settings)
    md = build_markdown_llm(payload, url, kind, settings)

    md_path.write_text(md, encoding="utf-8")
    title = payload.get("article_title") or "記事"
    desc = str(payload.get("lead") or "").replace("\n", " ").strip()
    if publish_to_site:
        from affiliate_tool.manifest import upsert_entry

        upsert_entry(out_dir, slug, str(title), url, kind, desc)
        print(f"    manifest updated ({out_dir / 'manifest.json'})")
    print(f"OK title={title!r}")
    print(f"    file={md_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
