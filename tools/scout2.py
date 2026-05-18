import sys, json, urllib.request, urllib.parse, re, time
sys.stdout.reconfigure(encoding="utf-8")

RENDERABLE = re.compile(r"\.(jpe?g|png|webp|gif|avif)(\?|$)", re.I)
SKIP_HOSTS = {"rawpixel.com","stocksnap.io","burst.shopify.com","picjumbo.com","librestock.com"}
LICENSE = "cc0,by,by-sa,pdm"

def host(url):
    m = re.search(r"https?://([^/]+)", url)
    return m.group(1) if m else ""

def scout(slot, queries, n=8):
    print(f"\n{'='*60}\nSLOT: {slot}\n{'='*60}")
    count = 0
    for query in queries:
        for page in [1, 2, 3]:
            params = urllib.parse.urlencode({
                "q": query, "license": LICENSE,
                "page_size": 20, "size": "large", "page": page
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
                print(f"  [{count}] q='{query}' p={page}")
                print(f"       title:   {(r.get('title') or '')[:80]}")
                print(f"       creator: {r.get('creator','')}")
                print(f"       source:  {r.get('source','')} | {host(src)}")
                print(f"       url:     {src[:90]}")
                count += 1
                if count >= n: return
            time.sleep(0.2)
        if count >= n: break

scout("hero_mushroom", [
    "mushroom pasta dark plate",
    "fungi dish plated elegant",
    "wild mushroom food photography",
    "forest mushroom dish",
    "portobello mushroom gourmet",
    "shiitake dish elegant",
    "vegan gourmet dish plated",
    "plant based gourmet plate",
])

scout("bowl_photo", [
    "rice bowl food",
    "noodle bowl food photography",
    "salad food photography",
    "vegetable bowl food",
    "tofu bowl food",
    "asian bowl food",
    "quinoa bowl",
    "lentil soup bowl",
])

scout("vegetables_bright", [
    "vegetables colorful bright",
    "fresh produce colorful",
    "vegetable market colorful",
    "tomato pepper vegetables",
    "vegetables ingredients kitchen",
    "fresh herbs vegetables",
    "green vegetables fresh bright",
])
