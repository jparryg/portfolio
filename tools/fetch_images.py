import sys, json, urllib.request, urllib.parse, re, os, time
sys.stdout.reconfigure(encoding="utf-8")

RENDERABLE = re.compile(r"\.(jpe?g|png|webp|gif|avif)(\?|$)", re.I)
LICENSE = "cc0,by,by-sa,pdm"
OUT = r"C:\Users\jparr\Desktop\Web Proyects\seitan\assets\photos\source"
CREDITS_OUT = r"C:\Users\jparr\Desktop\Web Proyects\seitan\assets\credits.json"

# Multiple fallback queries per slot
queries = [
    ("hero", [
        "restaurant interior candle dark",
        "dark restaurant table food",
        "vegan food plated dark",
        "food photography dark background",
        "dim restaurant dining",
    ]),
    ("plato1", [
        "veggie burger food",
        "plant burger close up",
        "vegetarian sandwich food",
        "burger food photography",
        "sandwich close up food",
    ]),
    ("plato2", [
        "healthy bowl food",
        "grain bowl salad",
        "colorful salad bowl",
        "vegan food bowl",
        "salad vegetables bowl",
    ]),
    ("interior", [
        "restaurant interior elegant",
        "dining room interior",
        "cafe interior cozy",
        "restaurant table chairs",
        "bistro interior design",
    ]),
    ("vegetales", [
        "fresh vegetables market",
        "vegetables dark background",
        "green vegetables food",
        "organic vegetables fresh",
        "herbs vegetables kitchen",
    ]),
]

def fetch_one(img_id, query):
    params = urllib.parse.urlencode({
        "q": query,
        "license": LICENSE,
        "page_size": 20,
        "size": "large"
    })
    url = f"https://api.openverse.org/v1/images/?{params}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "seitan-demo/1.0"})
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read())
    except Exception as e:
        print(f"    fetch error: {e}")
        return None

    results = [r for r in data.get("results", []) if RENDERABLE.search(r.get("url",""))]
    if not results:
        return None

    for r in results:
        sz = r.get("filesize") or 0
        if sz and sz > 5_000_000:
            continue
        src_url = r["url"]
        ext = re.search(r"\.(jpe?g|png|webp|gif|avif)", src_url, re.I)
        ext = ext.group(0).lower().replace("jpeg","jpg") if ext else ".jpg"
        dest = os.path.join(OUT, f"{img_id}{ext}")
        try:
            urllib.request.urlretrieve(src_url, dest)
            print(f"    OK -> {os.path.basename(dest)}")
            return (r, dest)
        except Exception as e:
            print(f"    download error: {e}")
            continue
    return None

credits = {}
if os.path.exists(CREDITS_OUT):
    with open(CREDITS_OUT, encoding="utf-8") as f:
        credits = json.load(f)

for img_id, fallbacks in queries:
    # Skip if already downloaded
    existing = [f for f in os.listdir(OUT) if f.startswith(img_id + ".")]
    if existing:
        print(f"\n--- {img_id}: already downloaded ({existing[0]}) ---")
        continue

    print(f"\n--- {img_id} ---")
    result = None
    for q in fallbacks:
        print(f"  trying: {q}")
        result = fetch_one(img_id, q)
        if result:
            break
        time.sleep(0.3)

    if not result:
        print(f"  FAILED all fallbacks for {img_id}")
        continue

    picked, dest_path = result
    credits[img_id] = {
        "src": f"assets/img/{img_id}.webp",
        "title": picked.get("title",""),
        "creator": picked.get("creator",""),
        "creator_url": picked.get("creator_url",""),
        "license": picked.get("license",""),
        "license_version": picked.get("license_version",""),
        "license_url": picked.get("license_url",""),
        "foreign_landing_url": picked.get("foreign_landing_url",""),
        "source": picked.get("source","")
    }
    time.sleep(0.4)

with open(CREDITS_OUT, "w", encoding="utf-8") as f:
    json.dump(credits, f, ensure_ascii=False, indent=2)
print(f"\ncredits.json guardado con {len(credits)} entradas")
