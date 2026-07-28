#!/usr/bin/env python3
"""Zip the entire QRcraft project, excluding regenerable / heavy / cache dirs."""
import os
import zipfile
from pathlib import Path

PROJECT_ROOT = Path('/home/z/my-project')
OUT_ZIP = Path('/home/z/my-project/download/qrcraft-project.zip')

EXCLUDE_DIRS = {
    'node_modules',
    '.next',
    '.git',
    '.zscripts',
    'db',
    'upload',
    'tool-results',
    'skills',
    'examples',
    'mini-services',
    'tests',
}

EXCLUDE_FILES = {
    'bun.lock',
    'dev.log',
    'server.log',
    'package-lock.json',
    'yarn.lock',
    '.DS_Store',
    'tsconfig.tsbuildinfo',
}

EXCLUDE_EXTENSIONS = {
    '.log', '.db', '.db-journal', '.sqlite', '.sqlite-journal',
}

def should_skip(path: Path) -> bool:
    parts = path.relative_to(PROJECT_ROOT).parts
    for part in parts:
        if part in EXCLUDE_DIRS:
            return True
    if path.name in EXCLUDE_FILES:
        return True
    if path.suffix in EXCLUDE_EXTENSIONS:
        return True
    rel = path.relative_to(PROJECT_ROOT).as_posix()
    if rel.startswith('public/uploads/'):
        return True
    return False

def main():
    OUT_ZIP.parent.mkdir(parents=True, exist_ok=True)
    if OUT_ZIP.exists():
        OUT_ZIP.unlink()

    file_count = 0
    total_bytes = 0
    with zipfile.ZipFile(OUT_ZIP, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        # Add the README at the top level of the zip
        readme_path = PROJECT_ROOT / 'QRcraft-README.md'
        if readme_path.exists():
            zf.write(readme_path, arcname='README.md')
            file_count += 1
            total_bytes += readme_path.stat().st_size

        for root, dirs, files in os.walk(PROJECT_ROOT):
            root_path = Path(root)
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for fname in files:
                fp = root_path / fname
                if should_skip(fp):
                    continue
                rel = fp.relative_to(PROJECT_ROOT).as_posix()
                if rel == 'download/qrcraft-project.zip':
                    continue
                if rel == 'QRcraft-README.md':
                    continue  # already added at top level
                try:
                    zf.write(fp, arcname=f'qrcraft/{rel}')
                    file_count += 1
                    total_bytes += fp.stat().st_size
                except (OSError, PermissionError) as e:
                    print(f'  skip (err): {rel} - {e}')

    out_size = OUT_ZIP.stat().st_size
    print(f'\nCreated: {OUT_ZIP}')
    print(f'Files included: {file_count}')
    print(f'Uncompressed size: {total_bytes / 1024:.1f} KB')
    print(f'Compressed size: {out_size / 1024:.1f} KB')
    if total_bytes:
        print(f'Compression ratio: {(1 - out_size / total_bytes) * 100:.1f}%')

if __name__ == '__main__':
    main()
