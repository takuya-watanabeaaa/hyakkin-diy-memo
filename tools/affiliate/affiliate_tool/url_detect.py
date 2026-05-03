from __future__ import annotations

import re
from urllib.parse import urlparse


YOUTUBE_HOSTS = frozenset(
    {"youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"}
)


def detect_source_kind(url: str) -> str:
    u = url.strip()
    if not u:
        raise ValueError("URL が空です")
    parsed = urlparse(u)
    host = (parsed.netloc or "").lower()
    if host in YOUTUBE_HOSTS or host.endswith(".youtube.com"):
        return "youtube"
    if host == "youtu.be":
        return "youtube"
    if parsed.scheme in ("http", "https") and host:
        return "article"
    raise ValueError(f"サポートしていない URL です: {url}")


def extract_youtube_video_id(url: str) -> str:
    """YouTube URL から video id を取り出す。"""
    u = url.strip()
    parsed = urlparse(u)
    host = (parsed.netloc or "").lower()

    if host == "youtu.be":
        vid = (parsed.path or "/").strip("/").split("/")[0]
        if _is_vid(vid):
            return vid

    if "youtube.com" in host:
        qs = parsed.query or ""
        m = re.search(r"(?:^|&)v=([^&]+)", qs)
        if m:
            vid = m.group(1)
            if _is_vid(vid):
                return vid
        path = (parsed.path or "").rstrip("/")
        m2 = re.match(r"(?:/live|/embed|/shorts)/([^/?]+)", path)
        if m2 and _is_vid(m2.group(1)):
            return m2.group(1)

    raise ValueError(f"YouTube の動画 ID を解釈できませんでした: {url}")


def _is_vid(s: str) -> bool:
    return bool(s) and re.fullmatch(r"[\w-]{6,32}", s) is not None
