"""
YouTube Data API v3 でチャンネルのアップロード一覧を取得する。
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import requests

API_ROOT = "https://www.googleapis.com/youtube/v3"


@dataclass(frozen=True)
class UploadedVideo:
    video_id: str
    title: str
    published_at: str

    @property
    def watch_url(self) -> str:
        return f"https://www.youtube.com/watch?v={self.video_id}"


def fetch_uploads_playlist_id(api_key: str, channel_id: str) -> str:
    """channel_id は UC で始まるチャンネル ID。"""
    r = requests.get(
        f"{API_ROOT}/channels",
        params={"part": "contentDetails", "id": channel_id.strip(), "key": api_key},
        timeout=45,
    )
    r.raise_for_status()
    data: dict[str, Any] = r.json()
    items = data.get("items") or []
    if not items:
        raise ValueError(
            f"チャンネルが見つかりません: id={channel_id!r} （UC…形式か確認してください）"
        )
    uploads = (
        (items[0].get("contentDetails") or {}).get("relatedPlaylists") or {}
    ).get("uploads")
    if not uploads:
        raise ValueError("uploads プレイリスト ID を取得できませんでした。")
    return str(uploads)


def list_recent_uploads(
    api_key: str,
    uploads_playlist_id: str,
    *,
    max_results: int = 15,
) -> list[UploadedVideo]:
    """新しい順（playlist の既定順）。API の上限により 1 リクエストあたり最大 50 件。"""
    n = max(1, min(max_results, 50))
    r = requests.get(
        f"{API_ROOT}/playlistItems",
        params={
            "part": "snippet",
            "playlistId": uploads_playlist_id,
            "maxResults": n,
            "key": api_key,
        },
        timeout=45,
    )
    r.raise_for_status()
    data: dict[str, Any] = r.json()
    out: list[UploadedVideo] = []
    for it in data.get("items") or []:
        sn = it.get("snippet") or {}
        rid = (sn.get("resourceId") or {}).get("videoId")
        if not rid:
            continue
        out.append(
            UploadedVideo(
                video_id=str(rid),
                title=str(sn.get("title") or ""),
                published_at=str(sn.get("publishedAt") or ""),
            )
        )
    return out
