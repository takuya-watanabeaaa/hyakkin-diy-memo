from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

from affiliate_tool.config import Settings
from affiliate_tool.fetch_source import SourceDocument, fetch_by_url
from affiliate_tool.llm_extract import extract_and_enrich, slug_from_parts
from affiliate_tool.manifest import upsert_entry
from affiliate_tool.markdown_builder import build_markdown_llm, build_markdown_stub
from affiliate_tool.url_detect import detect_source_kind


@dataclass
class PipelineResult:
    slug: str
    markdown_path: Path
    title: str


def run_pipeline(url: str, settings: Settings, *, dry_run: bool) -> PipelineResult:
    kind = detect_source_kind(url)
    doc: SourceDocument = fetch_by_url(url)

    date_prefix = datetime.now().strftime("%Y%m%d")
    slug = slug_from_parts(date_prefix, url + "|" + (doc.title or ""))

    settings.output_dir.mkdir(parents=True, exist_ok=True)
    md_path = settings.output_dir / f"{slug}.md"

    if dry_run or not settings.openai_api_key:
        md = build_markdown_stub(url, kind, doc.text[:4000])
        title = "（下書き）アフィリエイト記事プレビュー"
        description = doc.text[:120].replace("\n", " ")
    else:
        payload: dict[str, Any] = extract_and_enrich(doc.text, settings)
        title = str(payload.get("article_title") or "比較記事")
        md = build_markdown_llm(payload, url, kind, settings)
        description = str(payload.get("lead") or doc.text[:120]).replace("\n", " ")

    md_path.write_text(md, encoding="utf-8")
    upsert_entry(settings.output_dir, slug, title, url, kind, description)

    return PipelineResult(slug=slug, markdown_path=md_path, title=title)
