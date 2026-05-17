#!/usr/bin/env python3
"""
チャンネルの新着動画を YouTube Data API で検知し、tools/affiliate/main.py を順に実行する。

初回（状態ファイルなし）は既定で「いま一番新しい動画 ID だけ状態に保存し、記事は生成しない」。
--first-run generate-latest で最新 1 本だけ生成する。
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

TOOL_DIR = Path(__file__).resolve().parent
if str(TOOL_DIR) not in sys.path:
    sys.path.insert(0, str(TOOL_DIR))

STATE_VERSION = 1


def _default_state_path() -> Path:
    cache = TOOL_DIR / ".cache"
    cache.mkdir(parents=True, exist_ok=True)
    return cache / "youtube_channel_state.json"


def load_state(path: Path) -> dict:
    if not path.is_file():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def save_state(path: Path, *, last_seen_video_id: str, channel_id: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "version": STATE_VERSION,
        "channel_id": channel_id,
        "last_seen_video_id": last_seen_video_id,
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def pick_new_videos(
    videos: list,
    last_seen: str | None,
) -> tuple[list, bool]:
    """
    videos は新しい順。last_seen に達するまでを新着とみなす。
    戻り値: (新着リスト, last_seen を一覧で見つけたか)。
    last_seen が一覧に無い場合は空リスト（誤って全件生成しない）。
    """
    if not videos:
        return [], True
    if not last_seen:
        return [], True
    new: list = []
    found = False
    for v in videos:
        if v.video_id == last_seen:
            found = True
            break
        new.append(v)
    if not found:
        return [], False
    return new, True


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="YouTube チャンネルの新着を検知して affiliate パイプラインを実行"
    )
    parser.add_argument(
        "--channel-id",
        default=None,
        help="チャンネル ID（UC…）。未指定時は環境変数 YOUTUBE_CHANNEL_ID",
    )
    parser.add_argument(
        "--api-key",
        default=None,
        help="YouTube Data API キー。未指定時は YOUTUBE_API_KEY",
    )
    parser.add_argument(
        "--state",
        type=Path,
        default=None,
        help=f"状態 JSON（既定: {_default_state_path()}）",
    )
    parser.add_argument(
        "--max-results",
        type=int,
        default=15,
        help="プレイリストから取得する最大件数（API 都合で最大 50 前後）",
    )
    parser.add_argument(
        "--max-generate-per-run",
        type=int,
        default=5,
        help="1 回の実行で main.py を叩く新着の上限（API 負荷対策）",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="main.py に --dry-run を渡す",
    )
    parser.add_argument(
        "--first-run",
        choices=("skip", "generate-latest"),
        default="skip",
        help="状態ファイルが無いとき: skip=最新 ID だけ記録 / generate-latest=最新 1 本を生成",
    )
    args = parser.parse_args(argv)

    from affiliate_tool.dotenv_loader import load_application_dotenv, repo_root

    load_application_dotenv()
    repo = repo_root()

    api_key = (args.api_key or os.environ.get("YOUTUBE_API_KEY") or "").strip()
    channel_id = (args.channel_id or os.environ.get("YOUTUBE_CHANNEL_ID") or "").strip()

    if not api_key or not channel_id:
        print(
            "ERROR: YOUTUBE_API_KEY と YOUTUBE_CHANNEL_ID（または --api-key / --channel-id）が必要です。",
            file=sys.stderr,
        )
        return 1

    state_path = args.state or _default_state_path()
    state = load_state(state_path)
    last_seen = (state.get("last_seen_video_id") or "").strip() or None

    from affiliate_tool.youtube_channel import fetch_uploads_playlist_id, list_recent_uploads

    uploads_pid = fetch_uploads_playlist_id(api_key, channel_id)
    videos = list_recent_uploads(api_key, uploads_pid, max_results=args.max_results)
    if not videos:
        print("新しい動画が見つかりませんでした。")
        return 0

    newest_id = videos[0].video_id

    if last_seen is None:
        if args.first_run == "generate-latest":
            to_run = [videos[0]]
            print(f"初回: 最新 1 本のみ生成します: {to_run[0].watch_url}")
        else:
            save_state(
                state_path, last_seen_video_id=newest_id, channel_id=channel_id
            )
            print(
                f"初回: 状態を初期化しました（last_seen={newest_id}）。"
                " 次回からこの ID より新しい動画だけ処理します。"
                " 初回から記事にしたい場合は --first-run generate-latest を付けてください。"
            )
            return 0
    else:
        fresh, marker_ok = pick_new_videos(videos, last_seen)
        if not marker_ok:
            print(
                f"警告: 状態の last_seen が直近の一覧にありません（削除または取得範囲外）。"
                f" いったん baseline のみ更新します: {newest_id}",
                file=sys.stderr,
            )
            save_state(state_path, last_seen_video_id=newest_id, channel_id=channel_id)
            return 0
        if not fresh:
            print(f"新着なし（last_seen={last_seen}）。")
            save_state(state_path, last_seen_video_id=newest_id, channel_id=channel_id)
            return 0
        to_run = fresh[: args.max_generate_per_run]
        print(f"新着 {len(fresh)} 本のうち {len(to_run)} 本を処理します。")

    main_py = TOOL_DIR / "main.py"
    # 古い順に生成（同一実行内の並び）
    for v in reversed(to_run):
        cmd = [sys.executable, str(main_py), "--url", v.watch_url]
        if args.dry_run:
            cmd.append("--dry-run")
        if os.environ.get("AFFILIATE_PIPELINE_PUBLISH_SITE", "").strip().lower() in (
            "1",
            "true",
            "yes",
        ):
            cmd.append("--site")
        print(f"RUN {' '.join(cmd)}")
        proc = subprocess.run(cmd, cwd=str(repo))
        if proc.returncode != 0:
            print(f"ERROR: main.py が失敗しました ({proc.returncode}): {v.watch_url}", file=sys.stderr)
            return proc.returncode

    save_state(state_path, last_seen_video_id=newest_id, channel_id=channel_id)
    print(f"OK state 更新: last_seen_video_id={newest_id}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
