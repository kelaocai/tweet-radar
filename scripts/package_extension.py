#!/usr/bin/env python3
"""Build a small, reproducible, allowlisted Chrome extension release ZIP."""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
FILES = ("manifest.json", "background.js", "content.js", "options.html", "options.js", "styles.css", "THIRD_PARTY_NOTICES.md")
OUTPUT = ROOT / "dist"


def main():
    manifest = json.loads((ROOT / "extension/manifest.json").read_text())
    OUTPUT.mkdir(exist_ok=True)
    archive = OUTPUT / "tweet-radar-extension.zip"
    entries = [(ROOT / "extension" / name, name) for name in FILES]
    entries.append((ROOT / "LICENSE", "LICENSE"))
    with ZipFile(archive, "w", compression=ZIP_DEFLATED) as package:
        for source, name in entries:
            info = ZipInfo("tweet-radar-extension/" + name, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            package.writestr(info, source.read_bytes())
    checksum = hashlib.sha256(archive.read_bytes()).hexdigest()
    (OUTPUT / "SHA256SUMS.txt").write_text(f"{checksum}  {archive.name}\n")
    print(f"v{manifest['version']}: {archive} ({archive.stat().st_size:,} bytes)")
    print(f"SHA-256: {checksum}")


if __name__ == "__main__":
    main()
