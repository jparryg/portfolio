import urllib.request
import os
from PIL import Image

img_dir = r"C:\Users\jparr\Desktop\Web Proyects\seitan\assets\img"

# Download interior photo (Shiki Bistro, CC BY 2.0, jimg944)
interior_url = "https://live.staticflickr.com/4014/4686845544_452ed22dc9_b.jpg"
interior_tmp = os.path.join(img_dir, "_tmp_interior.jpg")
print("Descargando interior (Shiki Bistro)...")
urllib.request.urlretrieve(interior_url, interior_tmp)
print(f"  OK -> {os.path.getsize(interior_tmp)//1024} KB")

# (source, dest)
conversions = [
    ("cand-hero-mushroom.jpg",  "hero.webp"),
    ("cand-bowl-tofu-thai.jpg", "plato2.webp"),
    ("cand-veg-broccoli.jpg",   "vegetales.webp"),
    ("_tmp_interior.jpg",        "interior.webp"),
]

for src_name, dst_name in conversions:
    src = os.path.join(img_dir, src_name)
    dst = os.path.join(img_dir, dst_name)
    print(f"\nConvirtiendo {src_name} -> {dst_name}...")
    img = Image.open(src).convert("RGB")
    w, h = img.size
    img.save(dst, "WEBP", quality=85, method=6)
    size_kb = os.path.getsize(dst) // 1024
    print(f"  OK -> {w}x{h}  {size_kb} KB")

os.remove(interior_tmp)
print("\nTodo listo.")
