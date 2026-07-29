# SESSION-LOG.md

Registro de sesiones de auditoría/mantenimiento sistémico del portfolio (no de features de un proyecto individual — eso va en el log del skill, `reference/00-project-log.md`). Antes de auditar o "corregir" algo acá, revisá este archivo primero — puede que ya se haya evaluado y descartado a propósito, o que ya esté corregido de una forma no obvia.

---

## 2026-07-28/29 — Auditoría sistémica: color-scheme, patrones repetidos, contraste WCAG, imágenes

**Disparador:** Gran-Ola se veía invertido en modo oscuro forzado de Android/Chrome por falta de `<meta name="color-scheme">`. Lo que empezó como un fix de una línea escaló a una auditoría completa del portfolio y de la plantilla base del skill `creador-webs-john-parry`, porque el bug no era de Gran-Ola — era de la plantilla que generó los 21 proyectos.

### Qué se corrigió (commits en orden, repo `portfolio`)

| Commit | Qué |
|---|---|
| `4b2c7c4` | `<meta name="color-scheme" content="light">` agregado en 14/21 archivos que lo tenían ausente (Gran-Ola + 13 más). La Rosarina ya lo tenía. |
| `697fc76` | `.htaccess` faltante en 5 proyectos (alvaro-andujar, gorrion-cocina-libre, koonsult, mr-market, tentazione) + cache-buster `?v=` faltante en `lib/*.js` de 3 proyectos (casa-miramar, casablanca, filtro). |
| `5d99bc8` | Padding del hero roto en Gran-Ola (`.hero-inner` pisaba el `width` de `.container`) — único caso real de ese bug en los 14 proyectos con carpeta propia, no un patrón. Fallback de `IntersectionObserver` corregido a 6s + chequeo de viewport en co98-gym y koonsult (koonsult y co98-gym forzaban `is-visible` en todo `.reveal` casi de inmediato, matando el reveal). Conversión jpg/png → webp en alvaro-andujar, casablanca, koonsult (30 imágenes en total, archivos originales eliminados). |
| `48ba6f6` | Contraste WCAG en botones: Opción B (texto oscuro `#093219` sobre el verde de marca sin tocarlo) en los 3 casos de WhatsApp — kiluhome, mr-market, tentazione. Opción A (oscurecer `--accent`/`--accent-2`) en los 4 genéricos — alvaro-andujar, casa-miramar, casablanca, koonsult. |
| `11b4161` | `alvaro-andujar/playa-punta-hermosa.webp` (3070×5464px, 2.5MB) redimensionada a 1400×2492px/261KB. `casablanca/vista-aerea-frente-playa.webp` (2560px, apenas sobre el límite) a 2400×1350px/292KB — bonus, no pedido, para no dejar el check nuevo fallando de entrada. |
| `5f9aaef` | 3 referencias rotas en `portfolio/index.html` (landing) que quedaron apuntando a `.jpg`/`.png` borrados en la conversión de `5d99bc8`: `.thumb-koonsult`, `.thumb-andujar`, `.thumb-casablanca`. `.thumb-co98` cambiada de `team.webp` (portrait, crop mostraba puro techo) a `hero-poster.webp` (aspect casi idéntico al card, sin recorte agresivo). |

### Decisiones tomadas — no revertir sin releer esto

- **Casablanca — fallback de IntersectionObserver:** parecía roto en la auditoría inicial (`verify_project.py` check 9 lo marcaba como sin fallback de 6s), pero al revisar el código **ya tenía uno válido** (`setTimeout(..., 6000 + i*50)`, escalonado por elemento) — el checker viejo tenía un bug de regex que exigía que `6000` fuera el último token literal antes del `)`. **No se tocó casablanca.** El bug estaba en `verify_project.py`, ya corregido.
- **Koonsult — `.btn-primary`:** el checker lo marcaba como texto blanco sobre `--accent` (2.32:1), pero el CSS ya tenía un override manual posterior (`color: var(--ink)`, comentario "*Celeste #0cb7f2 con texto oscuro = mejor contraste*") que el checker no detecta porque solo lee la primera declaración del selector, no la cascada completa. Ese botón **nunca estuvo roto en el navegador real**. El oscurecimiento de `--accent` que sí se aplicó (para el par pills/`--accent-light`, que era un bug real) no le hizo daño, pero no había nada que arreglar en `.btn-primary` específicamente.
- **Hero padding — no es un patrón:** casa-miramar y mr-market comparten el mismo mecanismo que causó el bug en Gran-Ola (clase `.hero-inner`/`.hero-content` combinada con `.container`, con `width:100%` pisando el width de `.container`), pero ambos compensan con `padding-inline` propio en la misma regla — medido en navegador (computed styles reales, no solo lectura de CSS): 24px/24px de margen real. Koonsult tiene `width:100%` en su hero pero por una razón distinta (no usa `.container` compartido, es autocontenido con su propio `max-width`+`padding`) — igual se verificó, 20px reales. Solo Gran-Ola estaba roto. **No se agregó al checklist del skill** por no ser repetido — si aparece un 2do caso real (mismo mecanismo: `.container` + clase propia con `width` en conflicto), ahí sí amerita regla.
- **`credits.json` — sin resolver, no es un bug confirmado.** 6 proyectos con fotos reales no tienen `credits.json` (casa-miramar, fonseca, gorrion-cocina-libre, gran-ola, la-rosarina, tentazione). No se puede confirmar por nombre de archivo si son fotos de stock (requerirían atribución) o del cliente (no la requieren). **Pendiente de que John confirme la procedencia proyecto por proyecto** — no tratar como bug hasta entonces.
- **Opción A vs B de contraste — ya decidido, no reabrir sin razón nueva:** WhatsApp (kiluhome, mr-market, tentazione) = Opción B (texto oscuro, verde intacto). Genéricos (alvaro-andujar, casa-miramar, casablanca, koonsult) = Opción A (acento oscurecido). Para casa-miramar se calculó también la Opción B como comparación (`--ink` sobre el naranja original daba 4.75:1) pero se aplicó A por decisión explícita de John.

### Herramientas/skill actualizados (viven fuera de este repo — en la carpeta del skill `creador-webs-john-parry`, no están en git)

- `verify_project.py`: pasó de 12 a 14 checks. Nuevo check 13 (meta `color-scheme` presente, light o dark, nunca ausente). Nuevo check 14 (imágenes de fondo/hero ≤500KB y ≤2500px de lado mayor — parsers de header binario PNG/JPEG/WebP sin dependencias, validados contra Pillow). Corregidos 3 falsos positivos/negativos: check 1 (IIFE con comentario de encabezado antes), check 11 (`url(#fragmento)` dentro de un data-URI SVG marcado como referencia rota), check 9 (regex de `setTimeout(...,6000)` no aceptaba `6000 + i*50`).
- **Script nuevo:** `verify_portfolio_links.py` — a diferencia de `verify_project.py` (por proyecto), este corre a nivel de repo completo porque `portfolio/index.html` referencia archivos dentro de OTRAS carpetas de proyecto y su CSS es inline (`<style>`, no `styles.css` externo) — ningún check existente lo cubría, por eso el bug de `5f9aaef` pasó desapercibido. Decodifica `%20` antes de chequear existencia (si no, da falsos positivos con nombres de archivo que tienen espacios, como las carpetas de comparación `assets/img/casablanca/Screenshot ...png`).
- Gotchas nuevas en `reference/04-critical-gotchas.md`: A.17 (color-scheme ausente), A.18 (contraste en botones de acento/WhatsApp), A.19 (fallback de IO faltante o mal implementado), A.20 (imagen de hero sobredimensionada sin que nada lo detecte), A.21 (conversión de imágenes rompe el landing en silencio).
- Checklist pre-entrega nueva en `SKILL.md` (color-scheme, contraste WhatsApp/marca, fallback 6s de IO, cache-buster completo, `.htaccess`, peso de imágenes de hero) + excepción explícita para cuando el trabajo toca el repo completo (correr también `verify_portfolio_links.py`).
- `SKILL.md` §0 en `01-stack-and-conventions.md`: `<head>` canónico con `color-scheme` incluido, para que no vuelva a faltar en un proyecto nuevo.
- Bug de documentación corregido: `SKILL.md` Paso 6 invocaba `verify_project.py --project {nombre}`, pero el script usa argumento posicional — se corrigió antes de que rompiera una corrida futura.

### Pendiente / sin decidir todavía

- Procedencia de fotos en los 6 proyectos sin `credits.json` (ver arriba).
- No se auditó exhaustivamente el resto de páginas sueltas del repo raíz (`namaste.html`, `piacere.html`, `restaurante.html`, `seitan.html`, `wellness.html`, `yurawasi.html`, `servicios-profesionales.html`, `recontra.html`) más allá del chequeo de `color-scheme` de la primera ronda — si se vuelve a tocar el landing o esas páginas, correr `verify_portfolio_links.py --file <pagina>` para cada una antes de dar por seguro que no tienen referencias rotas propias.
