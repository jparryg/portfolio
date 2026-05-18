import sys, urllib.request, os
sys.stdout.reconfigure(encoding="utf-8")

OUT = r"C:\Users\jparr\Desktop\Web Proyects\seitan\assets\img"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

candidates = [
    # Hero: mushroom dish
    ("cand-hero-mushroom",
     "https://upload.wikimedia.org/wikipedia/commons/6/6a/Liat_Portal_for_Foodie_Disorder_-_Ravioli_with_mushrooms_and_spinach_in_cream_sauce.jpg",
     "Ravioli con hongos y espinaca en salsa crema — plato elegante, fondo oscuro"),

    # plato2 options
    ("cand-bowl-tofu-thai",
     "https://upload.wikimedia.org/wikipedia/commons/b/b9/Spicy_Thai_Stir_Fry_with_Tofu-Watercourse_Foods.jpg",
     "Salteado thai con tofu — colorido, vegano"),
    ("cand-bowl-quinoa",
     "https://upload.wikimedia.org/wikipedia/commons/6/64/Healthy_quinoa_salad_with_dried_fruit.jpg",
     "Ensalada de quinua con frutos secos — bowl real"),
    ("cand-bowl-stir-spinach",
     "https://upload.wikimedia.org/wikipedia/commons/2/29/Stir-fry_spinach_with_tofu_-_Golden_white_jade_and_Green_Parrot_%28%E8%8F%A0%E8%8F%9C%E7%82%92%E8%B1%86%E8%85%90_%E9%87%91%E9%91%B2%E7%99%BD%E7%8E%89%E6%9D%BF%EF%BC%8C%E7%B4%85%E5%98%B4%E7%B6%A0%E9%B8%9A%E5%93%A5%29%281%29.jpg",
     "Salteado de espinaca con tofu — vegano"),
    ("cand-bowl-tofu0",
     "https://upload.wikimedia.org/wikipedia/commons/1/1f/Tofu_stir-fry.jpeg",
     "Tofu stir-fry — plato vegano simple"),

    # vegetales (ya descargados — no los volvemos a bajar)
]

for name, url, desc in candidates:
    ext = ".jpg"
    dest = os.path.join(OUT, f"{name}{ext}")
    if os.path.exists(dest):
        print(f"SKIP {name} (ya existe)")
        continue
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        "Referer": "https://commons.wikimedia.org/"
    })
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            with open(dest, "wb") as f:
                f.write(r.read())
        print(f"OK   {name} — {desc}")
    except Exception as e:
        print(f"FAIL {name}: {e}")
