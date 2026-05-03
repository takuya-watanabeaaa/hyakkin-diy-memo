from __future__ import annotations

import re
import urllib.parse

from affiliate_tool.config import Settings


def _clean_keyword(s: str) -> str:
    t = re.sub(r"\s+", " ", (s or "").strip())
    return t[:120] if len(t) > 120 else t


def build_rakuten_hgc_search_url(affiliate_id: str, keyword: str) -> str:
    """
    楽天市場の検索結果へ飛ぶアフィリエイトリンク（hb.afl… の HGC 形式）。
    RAKUTEN_SEARCH_LINK_TEMPLATE 未設定時に RAKUTEN_AFFILIATE_ID から自動生成する用途。
    参考: 検索先 pc URL とモバイル URL をそれぞれエンコードして渡す形式。
    """
    rid = (affiliate_id or "").strip()
    raw = _clean_keyword(keyword)
    if not rid or not raw:
        return ""
    pc_dest = (
        "http://search.rakuten.co.jp/search/mall?sitem="
        + urllib.parse.quote(raw, safe="")
    )
    m_dest = "http://m.rakuten.co.jp/"
    base = f"https://hb.afl.rakuten.co.jp/hgc/{rid}/"
    return (
        base
        + "?pc="
        + urllib.parse.quote(pc_dest, safe="")
        + "&m="
        + urllib.parse.quote(m_dest, safe="")
    )


class AffiliateLinkGenerator:
    """
    Amazon / 楽天 / A8 の検索・ジャンプ系アフィリエイト URL を組み立てる。
    楽天・A8 は案件ごとにクエリ名が違うため、テンプレ内のプレースホルダで調整する。

    - {keyword} … urllib.parse.quote 済み（URL にそのまま埋め込み）
    - {raw_keyword} …整形後の非エンコード文字列（パスや body 用）
    """

    def __init__(
        self,
        amazon_tag: str | None,
        rakuten_template: str | None,
        a8_template: str | None,
        a8_template_alt: str | None = None,
        *,
        rakuten_affiliate_id: str | None = None,
    ):
        tag = (amazon_tag or "").strip()
        self.amazon_tag = tag or None
        self.rakuten_template = (rakuten_template or "").strip() or None
        self.rakuten_affiliate_id = (rakuten_affiliate_id or "").strip() or None
        self.a8_template = (a8_template or "").strip() or None
        self.a8_template_alt = (a8_template_alt or "").strip() or None

    @classmethod
    def from_settings(cls, settings: Settings) -> AffiliateLinkGenerator:
        return cls(
            settings.amazon_associate_tag,
            settings.rakuten_search_template,
            settings.a8_link_template,
            settings.a8_link_template_alt,
            rakuten_affiliate_id=settings.rakuten_affiliate_id,
        )

    def generate_amazon_link(self, keyword: str) -> str | None:
        if not self.amazon_tag:
            return None
        raw = _clean_keyword(keyword)
        encoded_kw = urllib.parse.quote(raw)
        return f"https://www.amazon.co.jp/s?k={encoded_kw}&tag={self.amazon_tag}"

    def generate_rakuten_link(self, keyword: str) -> str | None:
        raw = _clean_keyword(keyword)
        if not raw:
            return None
        enc = urllib.parse.quote(raw)
        if self.rakuten_template:
            return _safe_format_template(self.rakuten_template, enc, raw)
        if self.rakuten_affiliate_id:
            url = build_rakuten_hgc_search_url(self.rakuten_affiliate_id, raw)
            return url or None
        return None

    def generate_a8_link(self, keyword: str, *, use_alt: bool = False) -> str | None:
        tpl = self._pick_a8_template(use_alt)
        if not tpl:
            return None
        raw = _clean_keyword(keyword)
        enc = urllib.parse.quote(raw)
        return _safe_format_template(tpl, enc, raw)

    def _pick_a8_template(self, use_alt: bool) -> str | None:
        primary = self.a8_template
        alt = self.a8_template_alt
        if use_alt and alt:
            return alt
        if primary:
            return primary
        if alt:
            return alt
        return None


def _safe_format_template(tpl: str, enc: str, raw: str) -> str:
    """
    楽天・A8 のテンプレを置換する。
    format() はプレースホルダが一種類だけのとき kwargs の過不足で TypeError になりやすいので、
    Gemini サンプルどおり `{keyword}`（quote 済み）と `{raw_keyword}`（生文字列）を replace で統一する。
    """
    return tpl.replace("{keyword}", enc).replace("{raw_keyword}", raw)


# --- 既存コード向けの関数ラッパ（markdown_builder 等） ---


def _generator(settings: Settings) -> AffiliateLinkGenerator:
    return AffiliateLinkGenerator.from_settings(settings)


def amazon_search_url(keyword: str, settings: Settings) -> str | None:
    return _generator(settings).generate_amazon_link(keyword)


def rakuten_search_url(keyword: str, settings: Settings) -> str | None:
    return _generator(settings).generate_rakuten_link(keyword)


def a8_url(keyword: str, settings: Settings, *, use_alt: bool = False) -> str | None:
    return _generator(settings).generate_a8_link(keyword, use_alt=use_alt)


def format_link_row(
    title: str,
    settings: Settings,
    *,
    rakuten_keyword: str | None = None,
    a8_keyword: str | None = None,
    a8_use_alt: bool = False,
) -> str:
    """Markdown 用の一行リンクブロック（テンプレ）。"""
    gen = _generator(settings)
    lines: list[str] = []
    a = gen.generate_amazon_link(title)
    r_kw = (rakuten_keyword or "").strip() or title
    r = gen.generate_rakuten_link(r_kw)
    a8_k = (a8_keyword or "").strip() or title
    z = gen.generate_a8_link(a8_k, use_alt=a8_use_alt)
    if a:
        lines.append(f"- [Amazonで「{_clean_keyword(title)}」を見る]({a})")
    if r:
        lines.append(f"- [楽天で「{_clean_keyword(title)}」を見る]({r})")
    if z:
        lines.append(f"- [提携リンク（A8 等）で関連を見る]({z})")
    if not lines:
        lines.append(
            "- （リンク未設定）環境変数 `AMAZON_ASSOCIATE_TAG`、"
            "`RAKUTEN_AFFILIATE_ID`（または `RAKUTEN_SEARCH_LINK_TEMPLATE`）、"
            "`A8_LINK_TEMPLATE` を設定してください。"
        )
    return "\n".join(lines)
