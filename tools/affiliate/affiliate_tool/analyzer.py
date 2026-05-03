"""
フェーズ2: YouTube / Web からテキストを取得し、要約・商品候補（名前・ジャンル・用途）を抽出する。
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from affiliate_tool.config import Settings
from affiliate_tool.fetch_source import SourceDocument, fetch_by_url
from affiliate_tool.url_detect import detect_source_kind


@dataclass
class AnalysisResult:
    source_url: str
    source_kind: str
    raw_text: str
    summary: str
    products: list[dict[str, str]]  # name, genre, main_use


def fetch_raw_document(url: str) -> SourceDocument:
    """字幕または記事本文を取得（LLM なし）。"""
    return fetch_by_url(url.strip())


def analyze_content(text: str, source_url: str, source_kind: str, settings: Settings) -> AnalysisResult:
    """
    テキストを要約し、紹介されている商品名・ジャンル・主な用途をリストアップする（LLM）。
    OPENAI_API_KEY が無い場合は要約のみ短文・商品は空。
    """
    body = _truncate(text, settings.max_source_chars)

    if not settings.openai_api_key:
        short = body[:800] + ("…" if len(body) > 800 else "")
        return AnalysisResult(
            source_url=source_url,
            source_kind=source_kind,
            raw_text=text,
            summary=f"（OPENAI_API_KEY 未設定のため LLM 要約なし）\n\n{short}",
            products=[],
        )

    from openai import OpenAI

    schema = {
        "summary": "動画・記事全体の要約（日本語 4〜8 文）",
        "products": [
            {
                "name": "紹介されている具体的な商品名または製品カテゴリ",
                "genre": "例: キッチン収納 / 文房具 / 掃除グッズ",
                "main_use": "主な用途を一文で",
            }
        ],
    }

    client = OpenAI(api_key=settings.openai_api_key)
    user = f"""以下は YouTube 字幕または Web 記事のテキストです。
実際に言及されている商品・ツールのみを抽出してください。推測で増やさないでください。
最大 {settings.max_products} 件まで。

出力は次の JSON 構造のみ（説明文不要）:
{json.dumps(schema, ensure_ascii=False, indent=2)}

---
テキスト:
{body}
"""

    resp = client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {
                "role": "system",
                "content": "あなたは日本語のライフスタイル編集者です。出力は必ず有効な JSON のみです。",
            },
            {"role": "user", "content": user},
        ],
        response_format={"type": "json_object"},
        temperature=0.3,
    )
    raw = resp.choices[0].message.content or "{}"
    data: dict[str, Any] = json.loads(raw)
    summary = str(data.get("summary") or "").strip()
    plist = data.get("products") or []
    products: list[dict[str, str]] = []
    if isinstance(plist, list):
        for p in plist[: settings.max_products]:
            if not isinstance(p, dict):
                continue
            products.append(
                {
                    "name": str(p.get("name") or "").strip(),
                    "genre": str(p.get("genre") or "").strip(),
                    "main_use": str(p.get("main_use") or "").strip(),
                }
            )
        products = [p for p in products if p["name"]]

    return AnalysisResult(
        source_url=source_url,
        source_kind=source_kind,
        raw_text=text,
        summary=summary or body[:500],
        products=products,
    )


def analyze_url(url: str, settings: Settings) -> AnalysisResult:
    """URL を種別判定 → 取得 → 解析まで一括。"""
    kind = detect_source_kind(url)
    doc = fetch_raw_document(url)
    return analyze_content(doc.text, url, kind, settings)


def _truncate(text: str, max_chars: int) -> str:
    t = text.strip()
    if len(t) <= max_chars:
        return t
    return t[: max_chars - 20] + "\n…（途中省略）…"
