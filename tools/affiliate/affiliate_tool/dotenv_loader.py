"""リポジトリルートの .env を読み込む（秘密はコードに書かない）。"""

from __future__ import annotations

from pathlib import Path


def repo_root() -> Path:
    """affiliate_tool パッケージから見たリポジトリルート（…/百均紹介）。"""
    here = Path(__file__).resolve().parent
    return here.parent.parent.parent


def load_application_dotenv(*, override: bool = False) -> Path:
    """
    `<repo>/.env` と任意の `.env.local` を読み込む。
    `python-dotenv` が無い場合は何もしない（環境変数はシェルや CI で注入）。
    """
    root = repo_root()
    try:
        from dotenv import load_dotenv
    except ImportError:
        return root

    load_dotenv(root / ".env", override=override)
    load_dotenv(root / ".env.local", override=False)
    return root
