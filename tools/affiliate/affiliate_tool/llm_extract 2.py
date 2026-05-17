from __future__ import annotations

import json
import re
from typing import Any

from affiliate_tool.config import Settings


SYSTEM_PROMPT = """あなたは日本のインテリア・収納・暮らし系メディアの編集者です。
入力テキストは YouTube 字幕または Web 記事です。
紹介されている「具体的な便利グッズ・ツール・収納用品」（ブランド品や商品カテゴリ）を抽出し、
それぞれについて百均で買える類似の代替アイデアと、Amazon/楽天で買える耐久性の高い上位版を提案します。
出力は必ず有効な JSON のみ。日本語で書いてください。"""


def _truncate(text: str, max_chars: int) -> str:
    t = text.strip()
    if len(t) <= max_chars:
        return t
    return t[: max_chars - 20] + "\n…（途中省略）…"


def extract_and_enrich(raw_text: str, settings: Settings) -> dict[str, Any]:
    """OpenAI で商品抽出＋百均代替＋上位版を一度に JSON で取得。"""
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY が設定されていません。")

    from openai import OpenAI

    client = OpenAI(api_key=settings.openai_api_key)
    body = _truncate(raw_text, settings.max_source_chars)

    schema_hint = {
        "article_title": "記事の提案タイトル（SEO を意識しつつ自然な日本語）",
        "lead": "導入 2〜4 文",
        "products": [
            {
                "name_in_video": "動画・記事で言及されている商品・カテゴリ名",
                "context_quote": "根拠となる短い引用（なければ要約1文）",
                "hyakkin": {
                    "similar_name": "ダイソー/セリア等で入手しやすい類似の呼び方",
                    "store_hint": "ダイソー / セリア / キャンドゥ などの目安",
                    "price_band": "例: 100〜300円",
                    "merits": ["メリット1", "メリット2"],
                    "demerits": ["デメリット1", "デメリット2"],
                },
                "premium": {
                    "pick_name": "具体的な上位版の商品イメージ（実在しそうな製品名・シリーズ名）",
                    "brand_hint": "例: 山崎実業 tower / 無印 / イノマタ化学 など",
                    "why_upgrade": ["上位版を選ぶ理由1", "理由2"],
                    "price_band": "例: 1,500〜4,000円",
                },
                "search_keywords": {
                    "amazon": "Amazon 検索に使う最短キーワード（日本語）",
                    "rakuten": "楽天検索に使うキーワード（amazon と同じでも可）",
                    "a8": "A8 経由で探すときのキーワード（任意）",
                },
            }
        ],
        "closing": "まとめ 2〜3 文（断定しすぎず、読者の用途で選ぶ前提）",
    }

    user = f"""以下のテキストを読み、便利グッズを最大 {settings.max_products} 件まで抽出し、各項目を埋めてください。
実際にテキストに登場しない商品は推測で増やさないでください。件数が少なければその件数でよいです。

JSON のキー構成は次の例に必ず従ってください（値は書き換え）:
{json.dumps(schema_hint, ensure_ascii=False, indent=2)}

---
テキスト:
{body}
"""

    resp = client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user},
        ],
        response_format={"type": "json_object"},
        temperature=0.4,
    )
    content = resp.choices[0].message.content or "{}"
    data = json.loads(content)
    _validate_payload(data, settings.max_products)
    return data


def _validate_payload(data: dict[str, Any], max_products: int) -> None:
    if "products" not in data or not isinstance(data["products"], list):
        raise ValueError("LLM 応答に products 配列がありません")
    if len(data["products"]) > max_products:
        data["products"] = data["products"][:max_products]
    for i, p in enumerate(data["products"]):
        if not isinstance(p, dict):
            raise ValueError(f"products[{i}] がオブジェクトではありません")
        for key in ("name_in_video", "hyakkin", "premium"):
            if key not in p:
                raise ValueError(f"products[{i}] に {key} がありません")


def slug_from_parts(date_prefix: str, seed: str) -> str:
    import hashlib

    h = hashlib.sha256(seed.encode("utf-8")).hexdigest()[:10]
    safe = re.sub(r"[^a-z0-9]+", "-", date_prefix.lower()).strip("-")
    return f"{safe}-{h}"
