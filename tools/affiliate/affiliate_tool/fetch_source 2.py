from __future__ import annotations

from dataclasses import dataclass

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound

from affiliate_tool.url_detect import extract_youtube_video_id


@dataclass
class SourceDocument:
    kind: str  # "youtube" | "article"
    source_url: str
    title: str | None
    text: str


def fetch_youtube_transcript(url: str, languages: tuple[str, ...] = ("ja", "en")) -> SourceDocument:
    vid = extract_youtube_video_id(url)
    api = YouTubeTranscriptApi()
    try:
        transcript = api.fetch(vid, languages=list(languages))
    except NoTranscriptFound:
        transcript = api.fetch(vid)
    except TranscriptsDisabled as e:
        raise RuntimeError("この動画では字幕が無効になっています。") from e

    lines = [snippet.text.strip() for snippet in transcript if getattr(snippet, "text", None)]
    text = "\n".join(lines)
    if not text.strip():
        raise RuntimeError("字幕テキストが空でした。")
    return SourceDocument(
        kind="youtube",
        source_url=url,
        title=None,
        text=text,
    )


def fetch_article_text(url: str, timeout: int = 25) -> SourceDocument:
    import trafilatura

    downloaded = trafilatura.fetch_url(url, no_ssl=False)
    if not downloaded:
        raise RuntimeError(f"ページを取得できませんでした: {url}")

    text = trafilatura.extract(
        downloaded,
        include_comments=False,
        include_tables=False,
        favor_recall=True,
    )
    if not text or len(text.strip()) < 80:
        raise RuntimeError("記事本文の抽出に失敗したか、文字数が少なすぎます。")

    meta = trafilatura.extract_metadata(downloaded)
    title = meta.title if meta else None

    return SourceDocument(kind="article", source_url=url, title=title, text=text.strip())


def fetch_by_url(url: str) -> SourceDocument:
    from affiliate_tool.url_detect import detect_source_kind

    kind = detect_source_kind(url)
    if kind == "youtube":
        return fetch_youtube_transcript(url)
    return fetch_article_text(url)
