import sys, json, urllib.request, urllib.parse, re, time
sys.stdout.reconfigure(encoding="utf-8")

RENDERABLE = re.compile(r"\.(jpe?g|png|webp|gif|avif)(\?|$)", re.I)
SKIP_HOSTS = {"rawpixel.com","stocksnap.io","burst.shopify.com","picjumbo.com"}
LICENSE = "cc0,by,by-sa,pdm"

def host(url):
    m = re.search(r"https?://([^/]+)", url)
    return m.group(1) if m else ""

queries = [
    "lentil dal soup bowl",
    "chickpea curry bowl",
    "tofu stir fry",
    "quinoa salad bowl",
    "ramen noodle soup vegan",
    "vegetable curry bowl",
    "hummus bowl vegetables",
    "falafel plate",
    "avocado salad bowl",
    "caprese salad food",
    "tomato salad food photography",
    "roasted vegetables plate",
]

count = 0
for query in queries:
    params = urllib.parse.urlencode({
        "q": query, "license": LICENSE,
        "page_size": 20, "size": "large"
    })
    url = f"https://api.openverse.org/v1/images/?{params}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "seitan-scout/1.0"})
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read())
    except Exception as e:
        continue

    results = [r for r in data.get("results", [])
               if RENDERABLE.search(r.get("url","")) and
               not any(s in host(r.get("url","")) for s in SKIP_HOSTS)]

    for r in results:
        sz = r.get("filesize") or 0
        if sz and sz > 5_000_000: continue
        src = r.get("url","")
        title = (r.get("title") or "").strip()
        print(f"[{count}] q='{query}'")
        print(f"     title:   {title[:90]}")
        print(f"     creator: {r.get('creator','')}")
        print(f"     src: {src[:90]}")
        count += 1
        if count >= 12: break
    if count >= 12: break
    time.sleep(0.2)
