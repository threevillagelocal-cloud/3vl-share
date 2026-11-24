#!/usr/bin/env python3
"""Publish files to the 3vl-files R2 bucket (served at https://files.threevillagelocal.com/).

Uploads only files whose content changed (MD5 compared with the bucket ETag).

  python publish.py --src DIR --prefix assets/            # mirror DIR under assets/
  python publish.py --src DIR --prefix assets/ --files a.js b/c.json   # only these paths (relative to DIR)
  python publish.py --src DIR --prefix assets/ --list paths.txt        # paths from a file
  python publish.py --pull --src DIR --prefix assets/weekender/live/ --ext json   # download (job state) into DIR

Credentials come from the environment (never from files in a repo):
  R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, CLOUDFLARE_ACCOUNT_ID
Locally they can be loaded from ~/.secrets/cloudflare_r2_s3 with --secrets.
"""
import argparse
import concurrent.futures as cf
import fnmatch
import hashlib
import mimetypes
import os
import sys
from pathlib import Path

import boto3
from boto3.s3.transfer import TransferConfig
from botocore.config import Config

# Single-part uploads up to 200 MB so the bucket ETag stays a plain MD5 (used for change detection).
TRANSFER = TransferConfig(multipart_threshold=200 * 1024 * 1024)

BUCKET = '3vl-files'
PUBLIC = 'https://files.threevillagelocal.com/'

# Never published, even when mirroring a whole folder.
DEFAULT_EXCLUDES = [
    '.git/*', '*/.git/*', '.github/*', 'node_modules/*', '*/node_modules/*', '__pycache__/*', '*/__pycache__/*',
    '*.pyc', '.DS_Store', '*/.DS_Store', 'Thumbs.db', '*.env', '.env*', '*.key', '*.pem', '*.psd', '*.ai',
    '*/ffmpeg/*', 'ffmpeg*', '*.exe', '*.dll', '.wrangler/*', '.vscode/*', '.claude/*', '*/.claude/*',
    'CLAUDE.md', '*/CLAUDE.md',
]

EXTRA_TYPES = {
    '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
    '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.csv': 'text/csv; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp',
    '.avif': 'image/avif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.vcf': 'text/vcard; charset=utf-8',
    '.ics': 'text/calendar; charset=utf-8', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4',
}


def content_type(path):
    ext = os.path.splitext(path)[1].lower()
    return EXTRA_TYPES.get(ext) or mimetypes.guess_type(path)[0] or 'application/octet-stream'


def load_secrets():
    p = Path.home() / '.secrets' / 'cloudflare_r2_s3'
    for line in p.read_text().splitlines():
        if '=' in line:
            k, v = line.split('=', 1)
            os.environ.setdefault(k.strip(), v.strip())


def client():
    acct = os.environ['CLOUDFLARE_ACCOUNT_ID']
    return boto3.client(
        's3', endpoint_url=f'https://{acct}.r2.cloudflarestorage.com', region_name='auto',
        aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
        config=Config(retries={'max_attempts': 6, 'mode': 'adaptive'}, max_pool_connections=32),
    )


def existing_etags(s3, prefix):
    out = {}
    for page in s3.get_paginator('list_objects_v2').paginate(Bucket=BUCKET, Prefix=prefix):
        for o in page.get('Contents', []):
            out[o['Key']] = o['ETag'].strip('"')
    return out


def md5(path):
    h = hashlib.md5()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def excluded(rel, patterns):
    return any(fnmatch.fnmatch(rel, p) for p in patterns)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True)
    ap.add_argument('--prefix', required=True, help='bucket folder, e.g. assets/ or share/')
    ap.add_argument('--files', nargs='*', help='paths relative to --src (default: whole folder)')
    ap.add_argument('--list', help='file with one relative path per line')
    ap.add_argument('--exclude', nargs='*', default=[])
    ap.add_argument('--max-mb', type=float, default=100, help='skip files larger than this')
    ap.add_argument('--cache-control', help='override Cache-Control for every uploaded file')
    ap.add_argument('--secrets', action='store_true', help='load credentials from ~/.secrets')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--pull', action='store_true', help='download objects under --prefix into --src instead')
    ap.add_argument('--ext', nargs='*', help='with --pull: only these extensions, e.g. json csv')
    a = ap.parse_args()
    if a.secrets:
        load_secrets()

    src = Path(a.src).resolve()
    prefix = a.prefix.strip('/') + '/' if a.prefix.strip('/') else ''
    if a.pull:
        return pull(src, prefix, a)
    patterns = DEFAULT_EXCLUDES + a.exclude

    if a.files or a.list:
        rels = list(a.files or [])
        if a.list:
            rels += [l.strip() for l in Path(a.list).read_text(encoding='utf-8').splitlines() if l.strip()]
        rels = [r.replace('\\', '/').lstrip('/') for r in rels]
    else:
        rels = [p.relative_to(src).as_posix() for p in src.rglob('*') if p.is_file()]

    todo, skipped = [], []
    for rel in sorted(set(rels)):
        p = src / rel
        if not p.is_file():
            skipped.append((rel, 'missing'))
        elif excluded(rel, patterns):
            skipped.append((rel, 'excluded'))
        elif p.stat().st_size > a.max_mb * 1024 * 1024:
            skipped.append((rel, f'larger than {a.max_mb} MB'))
        else:
            todo.append(rel)

    s3 = client()
    remote = existing_etags(s3, prefix)
    changed = [r for r in todo if remote.get(prefix + r) != md5(src / r)]

    print(f'{len(todo)} files checked, {len(changed)} changed, {len(skipped)} skipped')
    for rel, why in skipped:
        if why != 'excluded':
            print(f'  skip {rel}: {why}', file=sys.stderr)
    if a.dry_run or not changed:
        return 0

    def put(rel):
        extra = {'ContentType': content_type(rel)}
        if a.cache_control:
            extra['CacheControl'] = a.cache_control
        s3.upload_file(str(src / rel), BUCKET, prefix + rel, ExtraArgs=extra, Config=TRANSFER)
        return rel

    failed = 0
    with cf.ThreadPoolExecutor(16) as ex:
        futs = {ex.submit(put, r): r for r in changed}
        for i, f in enumerate(cf.as_completed(futs), 1):
            try:
                f.result()
            except Exception as e:  # keep going, report at the end
                failed += 1
                print(f'  FAILED {futs[f]}: {e}', file=sys.stderr)
            if i % 500 == 0:
                print(f'  {i}/{len(changed)} uploaded')
    print(f'uploaded {len(changed) - failed}, failed {failed} -> {PUBLIC}{prefix}')
    return 1 if failed else 0


def pull(dest, prefix, a):
    """Download every object under prefix (optionally only some extensions) into dest, keeping sub-paths.
    Used by jobs to load the state they published last time. Files already identical are skipped."""
    s3 = client()
    exts = tuple('.' + e.lstrip('.').lower() for e in (a.ext or []))
    got = same = 0
    for key, etag in existing_etags(s3, prefix).items():
        rel = key[len(prefix):]
        if not rel or (exts and not rel.lower().endswith(exts)):
            continue
        out = dest / rel
        if out.is_file() and md5(out) == etag:
            same += 1
            continue
        if not a.dry_run:
            out.parent.mkdir(parents=True, exist_ok=True)
            s3.download_file(BUCKET, key, str(out))
        got += 1
    print(f'pulled {got} files from {prefix} ({same} already current)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
