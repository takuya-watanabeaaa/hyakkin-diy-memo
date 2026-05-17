from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from affiliate_tool.dotenv_loader import repo_root


@dataclass(frozen=True)
class Settings:
    """環境変数から読み込む設定。ID・トークンはコードに埋め込まないこと。"""

    openai_api_key: str | None
    openai_model: str
    amazon_associate_tag: str | None
    rakuten_affiliate_id: str | None
    rakuten_search_template: str | None
    a8_link_template: str | None
    a8_link_template_alt: str | None
    # A8_ALT_KEYWORD_REGEX: キーワードにマッチしたら A8 は ALT テンプレを使用
    a8_alt_keyword_regex: str | None
    output_dir: Path
    max_source_chars: int
    max_products: int

    @classmethod
    def from_env(cls, output_dir: Path | None = None) -> Settings:
        raw_dir = (os.environ.get("AFFILIATE_CONTENT_DIR") or "").strip()
        env_root = Path(raw_dir).resolve() if raw_dir else None
        if output_dir is not None:
            out = Path(output_dir).resolve()
        elif env_root is not None and env_root.exists():
            out = env_root
        else:
            out = (repo_root() / "content" / "affiliate").resolve()

        return cls(
            openai_api_key=os.environ.get("OPENAI_API_KEY"),
            openai_model=os.environ.get("OPENAI_MODEL") or "gpt-4o-mini",
            amazon_associate_tag=os.environ.get("AMAZON_ASSOCIATE_TAG"),
            rakuten_affiliate_id=os.environ.get("RAKUTEN_AFFILIATE_ID"),
            rakuten_search_template=os.environ.get("RAKUTEN_SEARCH_LINK_TEMPLATE"),
            a8_link_template=os.environ.get("A8_LINK_TEMPLATE"),
            a8_link_template_alt=os.environ.get("A8_LINK_TEMPLATE_ALT"),
            a8_alt_keyword_regex=(
                (os.environ.get("A8_ALT_KEYWORD_REGEX") or "").strip() or None
            ),
            output_dir=out,
            max_source_chars=int(os.environ.get("AFFILIATE_MAX_SOURCE_CHARS", "14000")),
            max_products=int(os.environ.get("AFFILIATE_MAX_PRODUCTS", "8")),
        )
