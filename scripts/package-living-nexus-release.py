#!/usr/bin/env python3
"""Build a public-only preview bundle; capture/retain deployed comparison routes.

This is not a production publisher. Capturing uses the documented read-only Wix
archive endpoint and strips provider metadata before any artifact is written.
"""
from __future__ import annotations
import argparse
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import re
import sys
from urllib.request import urlopen
import zipfile

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / "hud" / "prototype"
PREVIEW_ID = "d64fb948-916d-492d-828e-22555f6456a3"
PREVIEW_URL = "https://headless-mfewrcffiie-archonsoulings-140e.wix-site-host.com/"
ARCHIVE_URL = f"https://www.wix.com/_api/wixstro-deployments/v1/instant-sites/{PREVIEW_ID}/download.zip"
HISTORICAL = (
    "experiments/cinematic-living-nexus-v06.html",
    "experiments/kinetic-field-04.js",
    "experiments/living-constellation-04.css",
    "experiments/living-constellation-04.html",
    "experiments/living-field-02.html",
    "experiments/living-nexus-cinematic-v07.html",
    "experiments/living-nexus-cinematic-v08.html",
    "experiments/living-nexus-procedural-v10.html",
    "experiments/living-nexus-procedural-v11.html",
)
MAX_FILE = 3 * 1024 * 1024
MAX_TOTAL = 20 * 1024 * 1024
DENIED = re.compile(r"(?i)\b(?:silver|efa|ilyr)\b|-----BEGIN [A-Z ]*PRIVATE KEY-----|sk-proj-[A-Za-z0-9_-]{10,}")
REFERENCE = re.compile(r'''(?:src|href)\s*=\s*["']([^"']+)["']|(?:import\s+(?:[^;]*?\s+from\s+)?|import\s*\(|fetch\s*\()\s*["']([^"']+)["']|url\(\s*["']?([^\s"')]+)''')


def manifest(root: Path = RUNTIME) -> dict:
    data = json.loads((root / "PREVIEW_BUNDLE_MANIFEST.json").read_text())
    required = data["required"]
    if not isinstance(required, list) or len(set(required)) != len(required):
        raise ValueError("Manifest required paths must be a unique list")
    for name in required:
        safe_name(name)
    return data


def safe_name(name: str) -> str:
    if not isinstance(name, str) or not name or "\\" in name:
        raise ValueError("Invalid path")
    parts = PurePosixPath(name).parts
    if name.startswith("/") or str(PurePosixPath(name)) != name or any(p in (".", "..") or p.startswith(".") for p in parts):
        raise ValueError(f"Unsafe path: {name}")
    if not re.fullmatch(r"[A-Za-z0-9_./-]+", name):
        raise ValueError(f"Nonportable path: {name}")
    return name


def validate(files: dict[str, bytes], required: list[str]) -> None:
    if not set(required).issubset(files) or "index.html" not in files:
        raise ValueError("Missing required runtime files")
    if sum(map(len, files.values())) > MAX_TOTAL:
        raise ValueError("Bundle too large")
    for name, raw in files.items():
        safe_name(name)
        if len(raw) > MAX_FILE:
            raise ValueError(f"File too large: {name}")
        text = raw.decode("utf-8")
        if DENIED.search(text):
            raise ValueError(f"Public boundary check failed: {name}")
        if name.endswith(".html") and not re.search(r"<(?:!doctype|html)\b", text, re.I):
            raise ValueError(f"Not HTML: {name}")
        if not name.endswith((".html", ".js", ".css")):
            continue
        # Only explicit file references; dynamic route maps are covered by the browser suite.
        for match in REFERENCE.finditer(text):
            ref = next((x for x in match.groups() if x), "").split("#")[0].split("?")[0]
            if not ref or re.match(r"(?:[a-zA-Z][\w+.-]*:|//)", ref):
                continue
            if any(x in ref for x in ("${", "<", ">")):
                continue
            if not re.search(r"\.(?:html|js|css|json|svg|png|jpe?g|webp)$", ref):
                continue
            parts: list[str] = [] if ref.startswith("/") else list(PurePosixPath(name).parent.parts)
            for part in PurePosixPath(ref.lstrip("/")).parts:
                if part == "..":
                    if not parts:
                        raise ValueError(f"Escaping dependency: {name}")
                    parts.pop()
                elif part != ".":
                    parts.append(part)
            target = "/".join(parts)
            if target not in files:
                raise ValueError(f"Missing dependency: {name} -> {target}")


def write_zip(path: Path, files: dict[str, bytes]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    try:
        with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            for name, content in sorted(files.items()):
                info = zipfile.ZipInfo(name, (2026, 10, 11, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = 0o100644 << 16
                archive.writestr(info, content)
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)


def public_archive(raw: bytes, allowed: set[str]) -> dict[str, bytes]:
    files = {}
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        if sum(i.file_size for i in archive.infolist()) > MAX_TOTAL:
            raise ValueError("Archive expansion exceeds limit")
        for info in archive.infolist():
            if info.is_dir():
                continue
            name = safe_name(info.filename)
            if name == "wix.config.json" or name.startswith("_wix/"):
                continue
            if name in files or name not in allowed:
                raise ValueError(f"Unexpected or duplicate deployed path: {name}")
            if (info.external_attr >> 16) & 0o170000 == 0o120000:
                raise ValueError("Archive contains a symlink")
            files[name] = archive.read(info)
    return files


def build(root: Path, snapshot: Path | None, source_sha: str) -> dict[str, bytes]:
    if not re.fullmatch(r"[a-f0-9]{40}", source_sha):
        raise ValueError("An exact source commit SHA is required")
    required = manifest(root)["required"]
    allowed = set(required) | set(HISTORICAL) | {"robots.txt", "release.json"}
    files = public_archive(snapshot.read_bytes(), allowed) if snapshot else {}
    if snapshot and not set(HISTORICAL).issubset(files):
        raise ValueError("Snapshot is missing an existing comparison route")
    for name in required:
        path = root / name
        if path.is_symlink() or root.resolve() not in path.resolve().parents:
            raise ValueError(f"Unsafe source file: {name}")
        files[name] = path.read_bytes()
    files.setdefault("robots.txt", b"User-agent: *\nDisallow: /\n")
    files.pop("release.json", None)
    validate(files, required)
    receipt = {
        "schema": "archon.preview.runtime.v1",
        "sourceCommit": source_sha,
        "previewOnly": True,
        "productionPublished": False,
        "preservedDeployedComparisons": bool(snapshot),
        "inquiryOnly": True,
        "files": {name: hashlib.sha256(data).hexdigest() for name, data in sorted(files.items())},
    }
    files["release.json"] = (json.dumps(receipt, indent=2) + "\n").encode()
    return files


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--source-sha")
    parser.add_argument("--preserve-snapshot", type=Path)
    parser.add_argument("--capture-preview", action="store_true")
    args = parser.parse_args()
    if args.capture_preview:
        required = manifest()["required"]
        with urlopen(ARCHIVE_URL, timeout=45) as response:
            raw = response.read(MAX_TOTAL + 1)
        if len(raw) > MAX_TOTAL:
            raise ValueError("Preview archive too large")
        files = public_archive(raw, set(required) | set(HISTORICAL) | {"robots.txt", "release.json"})
        if "index.html" not in files or not set(HISTORICAL).issubset(files):
            raise ValueError("Existing preview snapshot is incomplete")
        # Capture even previously broken dependency sets for faithful rollback.
        for name, data in files.items():
            if DENIED.search(data.decode("utf-8")):
                raise ValueError(f"Snapshot boundary failure: {name}")
        write_zip(args.output, files)
    else:
        files = build(RUNTIME, args.preserve_snapshot, args.source_sha or "")
        write_zip(args.output, files)
    print(json.dumps({"file": str(args.output), "files": len(files), "sha256": hashlib.sha256(args.output.read_bytes()).hexdigest(), "deployed": False}))
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except (ValueError, OSError, KeyError, zipfile.BadZipFile) as error:
        print(f"Packaging blocked: {error}", file=sys.stderr)
        sys.exit(1)
