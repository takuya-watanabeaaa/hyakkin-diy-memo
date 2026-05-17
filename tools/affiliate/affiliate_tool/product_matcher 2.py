"""
フェーズ3: 解析済みの商品リストから、百均版・高性能版・比較解説を LLM で組み立てる。
出力スキーマは markdown_builder.build_markdown_llm と互換の payload。
"""

from __future__ import annotations

import json
from typing import Any

from affiliate_tool.analyzer import AnalysisResult
from affiliate_tool.config import Settings


def build_article_payload(analysis: AnalysisResult, settings: Settings) -> dict[str, Any]:
    """
    AnalysisResult を記事用 JSON（article_title, lead, products[], closing）に変換する。
    """
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY が設定されていません（product_matcher）。")

    from openai import OpenAI

    client = OpenAI(api_key=settings.openai_api_key)

    candidates = [
        {
            "name": p["name"],
            "genre": p["genre"],
            "main_use": p["main_use"],
        }
        for p in analysis.products
    ]

    product_schema = {
        "name_in_video": "元テキストでの商品名・カテゴリ",
        "context_quote": "根拠の一文（要約から引用風でも可）",
        "hyakkin": {
            "similar_name": "ダイソー/セリア等で入手しやすい類似の呼び方",
            "store_hint": "ダイソー / セリア / キャンドゥ など",
            "price_band": "例: 100〜300円",
            "merits": ["メリット"],
            "demerits": ["デメリット"],
        },
        "premium": {
            "pick_name": "有名メーカー製など高性能版のイメージ（例: 山崎実業 tower）",
            "brand_hint": "ブランド名",
            "why_upgrade": ["耐久性・デザイン・精度などの違い"],
            "price_band": "例: 1,500〜4,000円",
        },
        "search_keywords": {
            "amazon": "上位互換を買うときの Amazon 検索語（ブランド名＋品目が望ましい。動画の俗称だけにしない）",
            "rakuten": "上位互換向けの楽天検索語（同上）",
            "a8": "A8 用キーワード（Amazon と異なる場合のみ）",
            "a8_template": "primary または alt（別 A8 案件 URL のときのみ alt）",
        },
    }

    hint = {
        "article_title": "記事タイトル案",
        "lead": "導入（要約を踏まえ 2〜4 文）",
        "products": [product_schema],
        "closing": "まとめ",
    }

    user = f"""以下はソースの要約と、抽出済みの商品候補です。

編集方針（重要）:
- メインは「Amazon・楽天で買える上位互換（有名メーカー・耐久・使い勝手）」の紹介。
- 百均（ダイソー・セリア等）はあくまで「試し・代替」の参考で短く。記事の主役にしない。
- search_keywords の amazon / rakuten は、上位互換を実際に検索してヒットしやすい語にする（ブランド名＋カテゴリ名など）。
  動画の俗称だけでは検索に不向きな場合は上位互換側に合わせて書き換える。

各候補について上位互換と百均代替を提案し、耐久性・デザイン・精度・素材などの観点で差を簡潔に書く。
推測で商品を増やさないこと。候補が空なら products は空配列でよいです。

要約:
{analysis.summary}

商品候補（JSON）:
{json.dumps(candidates, ensure_ascii=False, indent=2)}

参照URL: {analysis.source_url} （種別: {analysis.source_kind}）

出力 JSON のキー構成は次に必ず従ってください:
{json.dumps(hint, ensure_ascii=False, indent=2)}

products は最大 {settings.max_products} 件。"""

    resp = client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {
                "role": "system",
                "content": (
                    "あなたは日本のインテリア・収納メディアの編集者です。"
                    "Amazon・楽天向けの「上位互換」の紹介を最優先し、百均は補足として短く扱う。"
                    "出力は有効な JSON のみ。日本語。"
                ),
            },
            {"role": "user", "content": user},
        ],
        response_format={"type": "json_object"},
        temperature=0.35,
    )
    raw = resp.choices[0].message.content or "{}"
    payload: dict[str, Any] = json.loads(raw)
    _ensure_payload_shape(payload, settings.max_products)
    for p in payload.get("products") or []:
        if not isinstance(p, dict):
            continue
        p.setdefault("context_quote", "")
        hk = p.setdefault("hyakkin", {})
        pr = p.setdefault("premium", {})
        if isinstance(hk, dict):
            hk.setdefault("similar_name", "—")
            hk.setdefault("store_hint", "—")
            hk.setdefault("price_band", "—")
            hk.setdefault("merits", [])
            hk.setdefault("demerits", [])
        if isinstance(pr, dict):
            pr.setdefault("pick_name", "—")
            pr.setdefault("brand_hint", "—")
            pr.setdefault("why_upgrade", [])
            pr.setdefault("price_band", "—")
        sk = p.setdefault("search_keywords", {})
        if isinstance(sk, dict):
            nm = str(p.get("name_in_video") or "")
            sk.setdefault("amazon", nm)
            sk.setdefault("rakuten", sk.get("rakuten") or nm)
            sk.setdefault("a8", sk.get("a8") or "")
            at = str(sk.get("a8_template") or "primary").strip().lower() or "primary"
            sk["a8_template"] = at if at in ("primary", "alt") else "primary"
    return payload


def _ensure_payload_shape(data: dict[str, Any], max_products: int) -> None:
    if "products" not in data or not isinstance(data["products"], list):
        data["products"] = []
    data["products"] = data["products"][:max_products]
    data.setdefault("article_title", "上位互換のおすすめ（百均は参考）")
    data.setdefault("lead", "")
    data.setdefault("closing", "")
