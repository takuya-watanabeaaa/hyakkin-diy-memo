from __future__ import annotations

import os
import subprocess
from pathlib import Path


class GitPublishError(RuntimeError):
    pass


def find_git_root(start: Path) -> Path:
    """start から親を辿り .git があるディレクトリを返す。"""
    cur = start.resolve()
    root = cur.anchor
    while True:
        if (cur / ".git").exists():
            return cur
        if cur == root:
            break
        cur = cur.parent
    raise GitPublishError(f"git リポジトリが見つかりません（起点: {start}）")


def commit_and_push_paths(
    repo_root: Path,
    paths_relative: list[str],
    message: str,
    *,
    remote: str | None = None,
    branch: str | None = None,
    dry_run: bool = False,
) -> None:
    """
    git add（指定パスのみ）→ 変更があれば commit → push。
    cron や生成直後の自動公開用。リモート未設定・認証なしでは失敗する。
    """
    remote = remote or os.environ.get("GIT_REMOTE", "origin")
    git = ["git", "-C", str(repo_root)]

    if dry_run:
        print(f"[dry-run] would: git add {' '.join(paths_relative)}")
        print(f"[dry-run] would: git commit -m {message!r}")
        print(f"[dry-run] would: git push {remote} {branch or 'HEAD'}")
        return

    subprocess.run([*git, "add", "--", *paths_relative], check=True)

    st = subprocess.run([*git, "diff", "--cached", "--quiet"])
    if st.returncode == 0:
        print("git: ステージ済みの変更なし（コミットをスキップ）")
        return

    subprocess.run([*git, "commit", "-m", message], check=True)

    push_cmd = [*git, "push", remote]
    if branch:
        push_cmd.append(branch)
    else:
        push_cmd.append("HEAD")

    subprocess.run(push_cmd, check=True)
    print(f"git: push 完了 ({remote})")


def publish_affiliate_output(output_dir: Path, message: str, *, dry_run: bool = False) -> None:
    """content/affiliate ディレクトリ一式をコミットしてプッシュ。"""
    output_dir = output_dir.resolve()
    repo_root = find_git_root(output_dir)
    try:
        rel = str(output_dir.relative_to(repo_root))
    except ValueError as e:
        raise GitPublishError(f"出力先がリポジトリ外です: {output_dir}") from e

    commit_and_push_paths(repo_root, [rel], message, dry_run=dry_run)
