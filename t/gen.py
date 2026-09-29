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
SIZES = (360, 800)
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

    def add(u, sizes=SIZES):
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
        for s in d.get("specials", []) or []:
            add(s.get("img"))
            add(s.get("inset"))
    except Exception as ex:
        print("WARN events.json", ex)
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
    except Exception as ex:
        print("WARN blog", ex)
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


if __name__ == "__main__":
    main()
