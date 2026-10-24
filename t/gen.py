"""Small WebP copies of the photos threevillagelocal.com shows (event photos, business logos, story images).
Some originals are 6 MB; the site shows them as cards. Copies live here and are served by GitHub Pages:
  https://threevillagelocal-cloud.github.io/3vl-share/t/<fnv1a(url)>-<width>.webp
The site computes the same name in JS (sm() in 3vl-assets events-cal/tvl-cal.js, weekender/weekender.js,
site/p3/nowhome.js, weekender/nowhome_build.py) and falls back to the original if a copy doesn't exist yet.
Runs every 30 minutes (.github/workflows/thumbs.yml). Copies unused for 21 days are deleted."""
import datetime, html, io, json, os, re, sys, urllib.request

from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = "https://www.threevillagelocal.com"
RAW = "https://raw.githubusercontent.com/threevillagelocal-cloud/3vl-assets/master/"
SIZES = (160, 360, 800)
UA = {"User-Agent": "Mozilla/5.0 (compatible; 3VL-thumbs/1.0; +https://www.threevillagelocal.com)"}
MAN = os.path.join(HERE, "manifest.json")
TODAY = datetime.date.today().isoformat()


def fnv(u):
    h = 0x811C9DC5
    for b in u.encode("utf-8"):
        h = ((h ^ b) * 0x01000193) & 0xFFFFFFFF
    return "%08x" % h


def norm(u):
    u = html.unescape((u or "").strip())
    if u.startswith("/") and not u.startswith("//"):
        u = SITE + u
    return u


def skip(u):
    """Same rules as sm() in the site JS: leave alone what is already small or ours."""
    return (not u.startswith("http") or re.search(r"\.svg(\?|$)", u, re.I) or "wsrv.nl" in u or "google.com/s2/favicons" in u
            or "threevillagelocal-cloud.github.io" in u
            or re.match(r"https://cdn\.jsdelivr\.net/gh/threevillagelocal-cloud/.*\.webp$", u, re.I))


def get(u, binary=False, limit=40_000_000):
    r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40)
    b = r.read(limit + 1)
    if len(b) > limit:
        raise ValueError("too big")
    return b if binary else b.decode("utf-8", "replace")


def collect():
    """{url: set(sizes)} for every photo the site currently shows."""
    want = {}

    def add(u, sizes=(360, 800)):
        u = norm(u)
        if u and not skip(u):
            want.setdefault(u, set()).update(sizes)
    # /events and /events-calendar: the calendar's photo list
    for page in ("/events", "/events-calendar"):
        try:
            h = get(SITE + page)
            m = re.search(r'id="tvl-cal-data">(.*?)</script>', h, re.S)
            for v in (json.loads(m.group(1)) if m else {}).values():
                add(v.get("i"))
        except Exception as ex:
            print("WARN", page, ex)
    # homepage: every image in the page HTML
    try:
        h = get(SITE + "/")
        for u in re.findall(r'<img[^>]+src="([^"]+)"', h) + re.findall(r'data-img="([^"]+)"', h) + re.findall(r"url\('([^']+)'\)", h):
            add(u)
    except Exception as ex:
        print("WARN home", ex)
    # live events feed + Instagram specials (homepage, rendered by weekender.js)
    try:
        d = json.loads(get(RAW + "weekender/live/events.json"))
        for e in d.get("events", []):
            add(e.get("img"))
        for s in (d.get("specials", []) or []) + (d.get("specialsAll", []) or []):   # specialsAll: /eat-drink/ pages and /restaurant-specials
            add(s.get("img"))
            add(s.get("inset"))
    except Exception as ex:
        print("WARN events.json", ex)
    # homepage news feed logos
    try:
        for it in json.loads(get(RAW + "weekender/feed.json")).get("items", []):
            add(it.get("logo"), (360,))
    except Exception as ex:
        print("WARN feed.json", ex)
    # business logos (Featured Local Businesses row, search)
    try:
        for m in json.loads(get(RAW + "search/index.json")).get("members", []):
            add(m.get("l"), (360,))
    except Exception as ex:
        print("WARN index.json", ex)
    # blog story images (Latest Local Stories)
    try:
        for u in re.findall(r'class="search_result_image[^"]*"[^>]*src="([^"]+)"', get(SITE + "/blog")):
            add(u, (360,))
            add(u.replace("news-pictures-thumbnails", "news-pictures"), (360, 800))   # /blog cards (p3.js)
    except Exception as ex:
        print("WARN blog", ex)
    # /locallistings: house photos + agent headshots. The cards point at our copies and carry
    # data-o (original) + data-w (copy width), written by 3vl-assets site/ll_photos.py
    try:
        for tag in re.findall(r'<img[^>]+data-o="[^>]+>', get(SITE + "/locallistings")):
            o = re.search(r'data-o="([^"]+)"', tag)
            w = re.search(r'data-w="(\d+)"', tag)
            if o and w and int(w.group(1)) in SIZES:
                add(o.group(1), (int(w.group(1)),))
    except Exception as ex:
        print("WARN locallistings", ex)
    # /this-weekend (3vl-site-guard answer_pages.py): every card and the highlights carry data-o + data-w
    try:
        for tag in re.findall(r'<img[^>]+data-o="[^>]+>', get(SITE + "/this-weekend")):
            o = re.search(r'data-o="([^"]+)"', tag)
            w = re.search(r'data-w="(\d+)"', tag)
            if o and w and int(w.group(1)) in SIZES:
                add(html.unescape(o.group(1)), (int(w.group(1)),))   # same URL answer_pages hashes
    except Exception as ex:
        print("WARN this-weekend", ex)
    return want


def make(u, sizes):
    im = Image.open(io.BytesIO(get(u, True)))
    im = ImageOps.exif_transpose(im)
    alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    im = im.convert("RGBA" if alpha else "RGB")
    out = {}
    for w in sizes:
        c = im.copy()
        if c.width > w:
            c = c.resize((w, max(1, round(c.height * w / c.width))), Image.LANCZOS)
        buf = io.BytesIO()
        c.save(buf, "WEBP", quality=78, method=6)
        out[w] = buf.getvalue()
    return out


def main():
    man = json.load(open(MAN)) if os.path.exists(MAN) else {}
    want = collect()
    made = failed = 0
    for u, sizes in want.items():
        k = fnv(u)
        rec = man.setdefault(k, {"u": u})
        if rec.get("u") != u:
            print("HASH CLASH", k, u, rec.get("u"))
            continue
        rec["seen"] = TODAY
        todo = [w for w in sorted(sizes) if not os.path.exists(os.path.join(HERE, "%s-%d.webp" % (k, w)))]
        if not todo or rec.get("fail") == TODAY:
            continue
        try:
            for w, b in make(u, todo).items():
                open(os.path.join(HERE, "%s-%d.webp" % (k, w)), "wb").write(b)
            rec.pop("fail", None)
            made += 1
        except Exception as ex:
            rec["fail"] = TODAY
            failed += 1
            print("FAIL", u[:120], ex)
    cutoff = (datetime.date.today() - datetime.timedelta(days=21)).isoformat()
    gone = [k for k, r in man.items() if r.get("seen", TODAY) < cutoff]
    for k in gone:
        for w in SIZES:
            p = os.path.join(HERE, "%s-%d.webp" % (k, w))
            if os.path.exists(p):
                os.remove(p)
        del man[k]
    json.dump(man, open(MAN, "w"), indent=0, sort_keys=True)
    print("photos in use %d | new %d | failed %d | removed %d" % (len(want), made, failed, len(gone)))


# ---------- VIP profile photos for the homepage Local Business Spotlight (10/24/2026) ----------
# Source of truth = live/p3/vip/<uid>.json in THIS repo (the members' current v3 profiles): hero.img (12:5 owner banner when
# hero.banner is true), headshot, logo. Copies are keyed by a hash of the source file, so a changed photo gets new file names
# the next run. Index: t/vip.json  {uid: {src, banner, pos, big: {640,960,1280}, thumb (240x180 crop), logo, head}}.
VIPDIR = os.path.join(os.path.dirname(HERE), "live", "p3", "vip")


def _sha(path):
    import hashlib
    return hashlib.sha1(open(path, "rb").read()).hexdigest()[:10]


def _pos(p):
    try:
        x, y = [float(v.strip().rstrip("%")) / 100 for v in (p or "50% 50%").split()[:2]]
        return min(max(x, 0), 1), min(max(y, 0), 1)
    except Exception:
        return .5, .5


def _crop(im, ratio, pos):
    """Crop to width/height = ratio around the focal point pos (like CSS object-position)."""
    x, y = _pos(pos)
    w, h = im.size
    if w / h > ratio:
        nw = round(h * ratio); left = round((w - nw) * x); return im.crop((left, 0, left + nw, h))
    nh = round(w / ratio); top = round((h - nh) * y); return im.crop((0, top, w, top + nh))


def _save(im, path, w=None, q=76):
    if w and im.width > w:
        im = im.resize((w, max(1, round(im.height * w / im.width))), Image.LANCZOS)
    im.save(path, "WEBP", quality=q, method=6)


def vip_copies():
    idx, keep = {}, set()
    for fn in sorted(os.listdir(VIPDIR)):
        m = re.fullmatch(r"(\d+)\.json", fn)
        if not m:
            continue
        uid = m.group(1)
        try:
            j = json.load(open(os.path.join(VIPDIR, fn), encoding="utf-8"))
        except Exception as ex:
            print("WARN vip", fn, ex); continue
        h = j.get("hero") or {}
        rec = {"src": h.get("img") or "", "banner": bool(h.get("banner")), "pos": h.get("pos") or "50% 50%"}
        src = os.path.join(VIPDIR, rec["src"]) if rec["src"] else ""
        if src and os.path.isfile(src) and not src.lower().endswith(".svg"):
            hs = j.get("headshot") if rec["banner"] else None   # banner (owner graphic with text): the small thumb uses the headshot
            hp = os.path.join(VIPDIR, hs) if hs else ""
            hp = hp if hp and os.path.isfile(hp) and not hp.lower().endswith(".svg") else ""
            key = "vip-%s-%s%s" % (uid, _sha(src), _sha(hp)[:4] if hp else "")
            names = {"big640": key + "-640.webp", "big960": key + "-960.webp", "big1280": key + "-1280.webp", "thumb": key + "-t240.webp"}
            if not all(os.path.exists(os.path.join(HERE, n)) for n in names.values()):
                try:
                    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
                    big = im if rec["banner"] else _crop(im, 12 / 5, rec["pos"])   # big card is always 12:5; banners are shown whole
                    for w in (640, 960, 1280):
                        _save(big, os.path.join(HERE, names["big%d" % w]), w)
                    tim, tpos = (ImageOps.exif_transpose(Image.open(hp)).convert("RGB"), "50% 25%") if hp else (im, rec["pos"])
                    _save(_crop(tim, 4 / 3, tpos).resize((240, 180), Image.LANCZOS), os.path.join(HERE, names["thumb"]))
                except Exception as ex:
                    print("FAIL vip", uid, ex); names = None
            if names:
                rec.update({k: "t/" + v for k, v in names.items()}); keep.update(names.values())
        for f in ("logo", "headshot"):
            v = j.get(f)
            p = os.path.join(VIPDIR, v) if v else ""
            if not p or not os.path.isfile(p):
                continue
            if p.lower().endswith(".svg"):
                rec[f] = "live/p3/vip/" + v; continue
            n = "vip-%s-%s-%s.webp" % (uid, f, _sha(p))
            if not os.path.exists(os.path.join(HERE, n)):
                try:
                    im = ImageOps.exif_transpose(Image.open(p))
                    im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
                    _save(im, os.path.join(HERE, n), 240, 82)
                except Exception as ex:
                    print("FAIL vip", uid, f, ex); continue
            rec[f] = "t/" + n; keep.add(n)
        idx[uid] = rec
    for f in os.listdir(HERE):   # copies of photos that were replaced
        if f.startswith("vip-") and f.endswith(".webp") and f not in keep:
            os.remove(os.path.join(HERE, f))
    json.dump(idx, open(os.path.join(HERE, "vip.json"), "w"), indent=0, sort_keys=True)
    print("vip copies:", len(idx), "members,", len(keep), "files")


if __name__ == "__main__":
    try:
        vip_copies()
    except Exception as ex:
        print("WARN vip_copies", ex)
    main()
