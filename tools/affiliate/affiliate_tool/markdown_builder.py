from __future__ import annotations

import html
import json
import re
from datetime import datetime
from typing import Any

from affiliate_tool.affiliate_links import format_link_row
from affiliate_tool.config import Settings

# Gemini サンプルに合わせた固定的なプロモーション表示（冒頭・フロントマター直後）
AFFILIATE_PROMO_LINE = (
    "※本ページはプロモーションが含まれています（アフィリエイト広告を利用しています）。"
)


def format_yaml_frontmatter(
    title: str,
    date_iso: str,
    *,
    source_url: str | None = None,
    source_kind: str | None = None,
    extra: dict[str, str] | None = None,
) -> str:
    """title / date を JSON エスケープして YAML 互換のダブルクォート文字列にする。"""
    lines = [
        "---",
        f"title: {json.dumps(title, ensure_ascii=False)}",
        f"date: {json.dumps(date_iso, ensure_ascii=False)}",
    ]
    if source_url:
        lines.append(f"source_url: {json.dumps(source_url, ensure_ascii=False)}")
    if source_kind:
        lines.append(f"source_kind: {json.dumps(source_kind, ensure_ascii=False)}")
    if extra:
        for k, v in sorted(extra.items()):
            if v is None:
                continue
            lines.append(f"{k}: {json.dumps(str(v), ensure_ascii=False)}")
    lines.append("---")
    return "\n".join(lines)


def wrap_markdown_document(
    title: str,
    date_iso: str,
    source_url: str,
    source_kind: str,
    body_markdown: str,
    *,
    frontmatter_extra: dict[str, str] | None = None,
) -> str:
    """
    フロントマター + プロモーション一行 + 本文。
    本文先頭に重複した # 見出しが無い想定（タイトルは frontmatter のみ）。
    """
    fm = format_yaml_frontmatter(
        title,
        date_iso,
        source_url=source_url,
        source_kind=source_kind,
        extra=frontmatter_extra,
    )
    return f"{fm}\n\n{AFFILIATE_PROMO_LINE}\n\n{body_markdown.lstrip()}"


def generate_markdown(
    content: str,
    products: list[dict[str, Any]],
    *,
    settings: Settings,
    title: str | None = None,
    date_iso: str | None = None,
    source_url: str = "",
    source_kind: str = "article",
) -> str:
    """
    Gemini 由来に近いシグネチャ。
    - content: 導入・本文に使うテキスト（Markdown 可）
    - products: LLM の `products` と同じ形のリスト（空でも可）
    """
    date = date_iso or datetime.now().strftime("%Y-%m-%d")
    payload: dict[str, Any] = {
        "article_title": title or "動画で紹介された便利グッズまとめ",
        "lead": content,
        "closing": "",
        "products": products or [],
    }
    article_title = str(payload["article_title"])
    body = _build_article_body(payload, source_url, source_kind, settings)
    return wrap_markdown_document(article_title, date, source_url, source_kind, body)


def build_markdown_llm(
    payload: dict[str, Any],
    source_url: str,
    source_kind: str,
    settings: Settings,
    *,
    date_iso: str | None = None,
) -> str:
    """LLM JSON から比較記事 Markdown を組み立てる（フロントマター付き）。"""
    title = payload.get("article_title") or "上位互換のおすすめ（百均は参考）"
    date = date_iso or datetime.now().strftime("%Y-%m-%d")
    body = _build_article_body(payload, source_url, source_kind, settings)
    return wrap_markdown_document(str(title), date, source_url, source_kind, body)


def _esc_xml_text(s: object) -> str:
    return html.escape(str(s or "").strip(), quote=False)


def _premium_pick_card_html(pr: dict[str, Any]) -> str:
    """
    商品画像なしの「上位互換バナー」風カード（HTML）。
    Next.js 側で rehype-raw により描画。テキストはエスケープ済み。
    """
    pick = _esc_xml_text(pr.get("pick_name")) or "—"
    brand_raw = str(pr.get("brand_hint") or "").strip()
    brand_line = (
        f'<p class="affiliate-premium-card__meta">{_esc_xml_text(brand_raw)}</p>'
        if brand_raw and brand_raw != "—"
        else ""
    )
    price = _esc_xml_text(pr.get("price_band")) or "—"
    return (
        '<div class="affiliate-premium-card" role="note">\n'
        '<p class="affiliate-premium-card__eyebrow">おすすめ上位互換</p>\n'
        f'<p class="affiliate-premium-card__name">{pick}</p>\n'
        f"{brand_line}"
        f'<p class="affiliate-premium-card__price">価格の目安: {price}</p>\n'
        "</div>\n"
    )


def _premium_search_fallback(product: dict[str, Any]) -> tuple[str, str]:
    """リンク行用: 上位互換の候補名・ブランドから検索語のフォールバックを作る。"""
    pr = product.get("premium") or {}
    pieces: list[str] = []
    for key in ("pick_name", "brand_hint"):
        v = str(pr.get(key) or "").strip()
        if v and v != "—":
            pieces.append(v)
    base = " ".join(pieces).strip()
    sk = product.get("search_keywords") or {}
    if not isinstance(sk, dict):
        sk = {}
    am = (sk.get("amazon") or "").strip() or base or _keyword_for_links(product)
    rk = (sk.get("rakuten") or "").strip() or am
    return am, rk


def _format_link_row_for_premium_pick(product: dict[str, Any], settings: Settings) -> str:
    sk = product.get("search_keywords") or {}
    if not isinstance(sk, dict):
        sk = {}
    am, rk_fallback = _premium_search_fallback(product)
    r_kw = (sk.get("rakuten") or "").strip() or rk_fallback
    a8_kw = (sk.get("a8") or "").strip() or am
    use_alt = _a8_use_alt_for_product(product, am, settings)
    return format_link_row(
        am,
        settings,
        rakuten_keyword=r_kw,
        a8_keyword=a8_kw,
        a8_use_alt=use_alt,
    )


def _build_article_body(
    payload: dict[str, Any],
    source_url: str,
    source_kind: str,
    settings: Settings,
) -> str:
    """見出し # タイトルは付けない（frontmatter の title を使う）。"""
    lead = payload.get("lead") or ""
    closing = payload.get("closing") or ""
    products: list[dict[str, Any]] = payload.get("products") or []

    parts: list[str] = []

    parts.append(
        "> **表示**: この記事には第三者配信の広告・アフィリエイトリンクが含まれる場合があります。"
        " ご購入は各ストアの規約・返品条件をご確認ください。\n"
    )
    parts.append(f"- 参照元: [{source_url}]({source_url}) （種別: {source_kind}）\n")
    parts.append("\n")
    parts.append(f"{lead}\n")

    if products:
        parts.append("\n---\n")
        parts.append("### 上位互換を探す（冒頭）\n")
        parts.append(_format_link_row_for_premium_pick(products[0], settings))
        parts.append("\n")

    mid_idx = max(1, len(products) // 2)

    for i, p in enumerate(products, start=1):
        name = p.get("name_in_video") or f"商品{i}"
        ctx = p.get("context_quote") or ""
        hk = p.get("hyakkin") or {}
        pr = p.get("premium") or {}

        parts.append(f"\n## {i}. {name}\n")
        if ctx:
            parts.append(f"> {ctx}\n")

        parts.append("\n")
        parts.append(_premium_pick_card_html(pr))

        parts.append("\n### 上位互換のポイント\n")
        why = pr.get("why_upgrade") or []
        if why:
            for w in why:
                parts.append(f"- {w}\n")
        else:
            parts.append(
                "- （LLM 出力にポイントがありませんでした）耐久・精度・デザインなどで百均代替より長く使いやすいことが多いです。\n"
            )

        parts.append("\n**▼ 上位互換を Amazon・楽天で探す**\n")
        parts.append(_format_link_row_for_premium_pick(p, settings))
        parts.append("\n")

        parts.append("\n### 百均で試す場合（参考・サブ）\n")
        parts.append(
            f"- **似た用途の探し方**: {hk.get('similar_name', '—')}（{hk.get('store_hint', '—')}）\n"
        )
        parts.append(f"- **だいたいの価格帯**: {hk.get('price_band', '—')}\n")
        merits = hk.get("merits") or []
        demerits = hk.get("demerits") or []
        if merits:
            parts.append("\n**百均側のメリット**\n")
            for m in merits:
                parts.append(f"- {m}\n")
        if demerits:
            parts.append("\n**百均側の注意**\n")
            for d in demerits:
                parts.append(f"- {d}\n")

        if i == mid_idx and len(products) > 1:
            parts.append("\n---\n")
            parts.append("### 上位互換を探す（記事中盤）\n")
            parts.append(_format_link_row_for_premium_pick(p, settings))
            parts.append("\n")

    parts.append("\n---\n")
    parts.append("### まとめの前に（フッター近く）\n")
    if products:
        parts.append(_format_link_row_for_premium_pick(products[-1], settings))
    else:
        parts.append(format_link_row("収納 グッズ", settings))
    parts.append("\n")

    parts.append(f"\n{closing}\n")
    return "".join(parts)


def _keyword_for_links(product: dict[str, Any]) -> str:
    sk = product.get("search_keywords") or {}
    return (sk.get("amazon") or sk.get("rakuten") or product.get("name_in_video") or "収納").strip()


def _a8_use_alt_for_product(
    product: dict[str, Any], amazon_keyword: str, settings: Settings
) -> bool:
    sk = product.get("search_keywords") or {}
    if not isinstance(sk, dict):
        return False
    mode = str(sk.get("a8_template") or "").strip().lower()
    if mode in ("alt", "secondary", "2", "b", "alternate"):
        return True
    rx = settings.a8_alt_keyword_regex
    if rx:
        try:
            return bool(re.search(rx, amazon_keyword))
        except re.error:
            return False
    return False


def _format_link_row_for_product(product: dict[str, Any], settings: Settings) -> str:
    sk = product.get("search_keywords") or {}
    if not isinstance(sk, dict):
        sk = {}
    kw = _keyword_for_links(product)
    r_kw = (sk.get("rakuten") or "").strip() or kw
    a8_kw = (sk.get("a8") or "").strip() or kw
    use_alt = _a8_use_alt_for_product(product, kw, settings)
    return format_link_row(
        kw,
        settings,
        rakuten_keyword=r_kw,
        a8_keyword=a8_kw,
        a8_use_alt=use_alt,
    )


def build_markdown_stub(source_url: str, source_kind: str, preview_text: str) -> str:
    """API キー無し時のプレースホルダー記事。"""
    date = datetime.now().strftime("%Y-%m-%d")
    title = "（プレビュー）アフィリエイト記事のたたき台"
    body = "\n".join(
        [
            "> OPENAI_API_KEY を設定し `--dry-run` を外して実行すると、"
            "ここに本番の比較記事が生成されます。",
            "",
            f"- 参照: [{source_url}]({source_url}) ({source_kind})",
            "",
            "## 取得テキスト冒頭",
            "",
            "```text",
            preview_text[:2000],
            "```",
            "",
        ]
    )
    return wrap_markdown_document(title, date, source_url, source_kind, body)
