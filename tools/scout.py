import sys, json, urllib.request, urllib.parse, re, time
sys.stdout.reconfigure(encoding="utf-8")

RENDERABLE = re.compile(r"\.(jpe?g|png|webp|gif|avif)(\?|$)", re.I)
SKIP_HOSTS = {"rawpixel.com","stocksnap.io","burst.shopify.com","picjumbo.com","librestock.com"}
LICENSE = "cc0,by,by-sa,pdm"

def host(url):
    m = re.search(r"https?://([^/]+)", url)
    return m.group(1) if m else ""

def scout(slot, queries, n=5):
    print(f"\n{'='*60}")
    print(f"SLOT: {slot}")
    print('='*60)
    count = 0
    for query in queries:
        for page in [1, 2]:
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
                print(f"  fetch error: {e}")
                continue

            results = [r for r in data.get("results", [])
                       if RENDERABLE.search(r.get("url","")) and
                       not any(s in host(r.get("url","")) for s in SKIP_HOSTS)]

            for r in results:
                sz = r.get("filesize") or 0
                if sz and sz > 5_000_000:
                    continue
                src = r.get("url","")
                print(f"  [{count}] query='{query}' page={page}")
                print(f"       title:   {r.get('title','')[:80]}")
                print(f"       creator: {r.get('creator','')}")
                print(f"       source:  {r.get('source','')} | host: {host(src)}")
                print(f"       url:     {src[:90]}")
                count += 1
                if count >= n:
                    return
            time.sleep(0.2)
        if count >= n:
            break

scout("hero_replacement",
    ["vegan mushroom dish dark elegant plate",
     "mushroom dish dark plate food",
     "elegant vegan dish dark background",
     "plant food dark plate photography",
     "dark food photography gourmet vegan"])

scout("plato2_bowl",
    ["vegan bowl food photography dark",
     "healthy bowl food photography",
     "grain bowl real photo dark",
     "salad bowl food photography",
     "buddha bowl food photo"])

scout("vegetales",
    ["fresh colorful vegetables food photography",
     "colorful vegetables market fresh",
     "fresh vegetables bright colorful",
     "organic vegetables colorful photo",
     "rainbow vegetables fresh"])
