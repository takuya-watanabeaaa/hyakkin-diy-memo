from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


@dataclass
class ManifestEntry:
    slug: str
    title: str
    sourceUrl: str
    sourceKind: str
    createdAt: str
    description: str


def manifest_path(output_dir: Path) -> Path:
    return output_dir / "manifest.json"


def read_manifest(output_dir: Path) -> list[dict[str, Any]]:
    path = manifest_path(output_dir)
    if not path.is_file():
        return []
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list):
        return data
    return []


def write_manifest(output_dir: Path, entries: list[dict[str, Any]]) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = manifest_path(output_dir)
    with path.open("w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)


def upsert_entry(
    output_dir: Path,
    slug: str,
    title: str,
    source_url: str,
    source_kind: str,
    description: str,
) -> None:
    entries = read_manifest(output_dir)
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    new = ManifestEntry(
        slug=slug,
        title=title,
        sourceUrl=source_url,
        sourceKind=source_kind,
        createdAt=now,
        description=description[:200],
    )
    row = asdict(new)
    entries = [e for e in entries if e.get("slug") != slug]
    entries.insert(0, row)
    write_manifest(output_dir, entries)
