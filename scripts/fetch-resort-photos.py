#!/usr/bin/env python3
"""Download luxury resort / room / pool photos from Pexels into assets/resorts/.

Run from repo root when you have network access:
  python3 scripts/fetch-resort-photos.py
"""
from __future__ import annotations

import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PEX = "?auto=compress&cs=tinysrgb&w=960&h=600&fit=crop"


def pex_url(photo_id: int) -> str:
    return f"https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg{PEX}"


DOWNLOADS: dict[str, dict[str, int]] = {
    "amatara": {"01-resort.jpg": 338504, "02-room.jpg": 271624, "03-pool.jpg": 3460597},
    "trisara": {"01-resort.jpg": 258154, "02-room.jpg": 164595, "03-pool.jpg": 14024023},
    "sri-panwa": {"01-resort.jpg": 189295, "02-room.jpg": 1571460, "03-pool.jpg": 5746250},
    "nai-harn": {"01-resort.jpg": 261105, "02-room.jpg": 14746032, "03-pool.jpg": 261102},
    "layan": {"01-resort.jpg": 271618, "02-room.jpg": 1457842, "03-pool.jpg": 20200273},
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "image/*",
}


def main() -> None:
    for slug, files in DOWNLOADS.items():
        out_dir = ROOT / "assets" / "resorts" / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        for filename, photo_id in files.items():
            dest = out_dir / filename
            url = pex_url(photo_id)
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=90) as resp:
                data = resp.read()
            if len(data) < 8000:
                raise RuntimeError(f"{dest}: response too small ({len(data)} bytes)")
            dest.write_bytes(data)
            print(f"OK {dest} ({len(data) // 1024} KB)")


if __name__ == "__main__":
    main()
