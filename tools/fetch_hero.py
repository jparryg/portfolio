import sys, json, urllib.request, urllib.parse, re, os, time
sys.stdout.reconfigure(encoding="utf-8")

RENDERABLE = re.compile(r"\.(jpe?g|png|webp|gif|avif)(\?|$)", re.I)
SKIP_HOSTS = {"rawpixel.com","stocksnap.io","burst.shopify.com","picjumbo.com","librestock.com"}
LICENSE = "cc0,by,by-sa,pdm"
OUT = r"C:\Users\jparr\Desktop\Web Proyects\seitan\assets\photos\source"
CREDITS_OUT = r"C:\Users\jparr\Desktop\Web Proyects\seitan\assets\credits.json"

hero_queries = [
    "restaurant food",
    "food photography",
    "dinner restaurant",
    "vegan meal",
    "vegetables food",
    "salad food",
    "plant food",
    "healthy food",
    "green vegetables",
    "organic salad",
]

def host(url):
    m = re.search(r"https?://([^/]+)", url)
    return m.group(1) if m else ""

def try_download(src_url, dest):
    try:
        urllib.request.urlretrieve(src_url, dest)
        return True
    except:
        return False

with open(CREDITS_OUT, encoding="utf-8") as f:
    credits = json.load(f)

for query in hero_queries:
    for page in [1, 2]:
        print(f"query='{query}' page={page}")
        params = urllib.parse.urlencode({
            "q": query, "license": LICENSE,
            "page_size": 20, "size": "large", "page": page
        })
        url = f"https://api.openverse.org/v1/images/?{params}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "seitan-demo/1.0"})
            with urllib.request.urlopen(req, timeout=15) as r:
                data = json.loads(r.read())
        except Exception as e:
            print(f"  error: {e}")
            continue

        results = [r for r in data.get("results", [])
                   if RENDERABLE.search(r.get("url","")) and
                   not any(s in host(r.get("url","")) for s in SKIP_HOSTS)]
        print(f"  {len(results)} after filter")

        for r in results:
            sz = r.get("filesize") or 0
            if sz and sz > 5_000_000: continue
            src_url = r["url"]
            ext_m = re.search(r"\.(jpe?g|png|webp|gif|avif)", src_url, re.I)
            ext = ext_m.group(0).lower().replace("jpeg",".jpg") if ext_m else ".jpg"
            if not ext.startswith("."): ext = "." + ext
            dest = os.path.join(OUT, f"hero{ext}")
            if try_download(src_url, dest):
                print(f"  DOWNLOADED from {host(src_url)}: {r.get('title','')[:60]}")
                credits["hero"] = {
                    "src": "assets/img/hero.webp",
                    "title": r.get("title",""),
                    "creator": r.get("creator",""),
                    "creator_url": r.get("creator_url",""),
                    "license": r.get("license",""),
                    "license_version": r.get("license_version",""),
                    "license_url": r.get("license_url",""),
                    "foreign_landing_url": r.get("foreign_landing_url",""),
                    "source": r.get("source","")
                }
                with open(CREDITS_OUT, "w", encoding="utf-8") as f:
                    json.dump(credits, f, ensure_ascii=False, indent=2)
                print("credits.json updated")
                sys.exit(0)
        time.sleep(0.3)

print("FAILED - will use mesh gradient only for hero")
