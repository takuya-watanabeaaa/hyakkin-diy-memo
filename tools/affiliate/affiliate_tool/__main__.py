from __future__ import annotations

import argparse
import subprocess
import sys


def main(argv: list[str] | None = None) -> int:
    from affiliate_tool.dotenv_loader import load_application_dotenv

    load_application_dotenv()

    parser = argparse.ArgumentParser(
        description="YouTube / 記事 URL から百均 vs 上位版の比較 Markdown を生成（アフィリエイトリンク）"
    )
    parser.add_argument("--url", required=True, help="YouTube または記事の URL")
    parser.add_argument(
        "--output-dir",
        default=None,
        help="出力先（既定: リポジトリの content/affiliate ）",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="取得のみ・プレースホルダー Markdown（OpenAI を呼ばない）",
    )
    parser.add_argument(
        "--git-commit-push",
        action="store_true",
        help="生成後に content/affiliate を git add / commit / push（認証済みリモート必須）",
    )
    parser.add_argument(
        "-m",
        "--git-message",
        default="chore(affiliate): auto-generate article",
        help="--git-commit-push 時のコミットメッセージ",
    )
    parser.add_argument(
        "--git-push-dry-run",
        action="store_true",
        help="push せず、実行する git 操作だけ表示（検証用）",
    )
    args = parser.parse_args(argv)

    from pathlib import Path

    from affiliate_tool.config import Settings
    from affiliate_tool.pipeline import run_pipeline

    out = Path(args.output_dir).resolve() if args.output_dir else None
    settings = Settings.from_env(output_dir=out)

    try:
        result = run_pipeline(args.url.strip(), settings, dry_run=args.dry_run)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1

    print(f"OK slug={result.slug}")
    print(f"    file={result.markdown_path}")
    print(f"    title={result.title}")

    if args.git_commit_push:
        from affiliate_tool.git_publish import GitPublishError, publish_affiliate_output

        try:
            publish_affiliate_output(
                settings.output_dir,
                args.git_message,
                dry_run=args.git_push_dry_run or args.dry_run,
            )
        except (GitPublishError, subprocess.CalledProcessError) as e:
            print(f"ERROR git: {e}", file=sys.stderr)
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
