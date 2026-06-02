(function () {
  "use strict";
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }
  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.from((r || document).querySelectorAll(s)); }

  /* ══════════════════════════════════════
     CARRITO — pedido multi-ítem a WhatsApp
     ══════════════════════════════════════ */
  var carrito = {};   // { "Producto nombre": { nombre, precio, qty, emoji } }
  var WSP_NUMBER = "51961748282";

  function carritoTotal() {
    return Object.values(carrito).reduce(function (sum, item) {
      return sum + item.precio * item.qty;
    }, 0);
  }

  function carritoCount() {
    return Object.values(carrito).reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
  }

  function renderCarrito() {
    var itemsEl   = qs("#carrito-items");
    var countEl   = qs("#carrito-count");
    var totalEl   = qs("#carrito-total");
    var fab       = qs("#carrito-fab");
    var wspBtn    = qs("#carrito-wsp-btn");
    if (!itemsEl) return;

    var keys = Object.keys(carrito);
    var count = carritoCount();

    // FAB
    if (fab) fab.style.display = count > 0 ? "flex" : "none";
    if (countEl) countEl.textContent = count;
    if (totalEl) totalEl.textContent = "S/ " + carritoTotal().toFixed(2);

    // Items list
    if (keys.length === 0) {
      itemsEl.innerHTML = '<p class="carrito-empty">Tu pedido está vacío.<br/>Agrega productos del catálogo.</p>';
    } else {
      itemsEl.innerHTML = keys.map(function (key) {
        var it = carrito[key];
        return '<div class="carrito-item" data-key="' + escAttr(key) + '">' +
          '<span class="ci-emoji">' + it.emoji + '</span>' +
          '<div class="ci-info">' +
            '<div class="ci-name">' + escHTML(it.nombre) + '</div>' +
            '<div class="ci-price">S/ ' + it.precio.toFixed(2) + ' c/u</div>' +
          '</div>' +
          '<div class="ci-controls">' +
            '<button class="ci-btn ci-minus" aria-label="Quitar uno">−</button>' +
            '<span class="ci-qty">' + it.qty + '</span>' +
            '<button class="ci-btn ci-plus" aria-label="Agregar uno">+</button>' +
          '</div>' +
        '</div>';
      }).join("");

      // Bind controls
      qsa(".ci-minus", itemsEl).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var key = btn.closest(".carrito-item").dataset.key;
          if (carrito[key]) {
            carrito[key].qty--;
            if (carrito[key].qty <= 0) delete carrito[key];
          }
          renderCarrito();
          syncAgregarBtns();
        });
      });
      qsa(".ci-plus", itemsEl).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var key = btn.closest(".carrito-item").dataset.key;
          if (carrito[key]) carrito[key].qty++;
          renderCarrito();
        });
      });
    }

    // WhatsApp link builder
    if (wspBtn) {
      if (keys.length === 0) {
        wspBtn.removeAttribute("href");
        wspBtn.style.opacity = "0.5";
        wspBtn.style.cursor  = "not-allowed";
        wspBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Agrega productos primero';
      } else {
        var modoEl = qs(".dtoggle-btn.active");
        var modo   = modoEl ? modoEl.dataset.mode : "recojo";
        var dirEl  = qs("#delivery-address");
        var dir    = dirEl ? dirEl.value.trim() : "";

        var lineas = keys.map(function (key) {
          var it = carrito[key];
          return "• " + it.nombre + " x" + it.qty + " = S/ " + (it.precio * it.qty).toFixed(2);
        });

        var entrega = modo === "delivery"
          ? "DELIVERY" + (dir ? " a: " + dir : " (te paso mi direccion ahora)")
          : "RECOJO EN TIENDA";

        var msg = "Hola Margarita!\n\n"
          + "Vi tu catalogo web de M&R Market y quiero hacer este pedido:\n\n"
          + lineas.join("\n") + "\n\n"
          + "TOTAL: S/ " + carritoTotal().toFixed(2) + "\n"
          + "ENTREGA: " + entrega + "\n\n"
          + "Esta disponible?";

        wspBtn.href   = "https://wa.me/" + WSP_NUMBER + "?text=" + encodeURIComponent(msg);
        wspBtn.target = "_blank";
        wspBtn.style.opacity = "1";
        wspBtn.style.cursor  = "pointer";
        wspBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Enviar pedido por WhatsApp';
      }
    }
  }

  function escHTML(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function escAttr(s) { return String(s).replace(/"/g,"&quot;"); }

  function syncAgregarBtns() {
    qsa(".btn-agregar").forEach(function (btn) {
      var card = btn.closest(".producto-card");
      if (!card) return;
      var key = card.dataset.nombre;
      var inCart = carrito[key] && carrito[key].qty > 0;
      btn.classList.toggle("is-added", !!inCart);
      btn.textContent = inCart ? "✓ En pedido" : "+ Agregar";
    });
  }

  function initCarrito() {
    var fab      = qs("#carrito-fab");
    var panel    = qs("#carrito-panel");
    var overlay  = qs("#carrito-overlay");
    var closeBtn = qs("#carrito-close");
    var vaciar   = qs("#carrito-vaciar");

    function openPanel() {
      if (!panel) return;
      panel.classList.add("is-open");
      if (overlay) overlay.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
    }
    function closePanel() {
      if (!panel) return;
      panel.classList.remove("is-open");
      if (overlay) overlay.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
    }

    if (fab)     fab.addEventListener("click", openPanel);
    if (closeBtn) closeBtn.addEventListener("click", closePanel);
    if (overlay)  overlay.addEventListener("click", closePanel);

    // Botón CTA catálogo y CTA final → ambos abren el panel
    ["#cta-abrir-carrito", "#cta-abrir-carrito-2"].forEach(function (sel) {
      var btn = qs(sel);
      if (btn) btn.addEventListener("click", function () {
        renderCarrito();
        openPanel();
      });
    });

    // Botón hero "Pedir ahora →" → abre el panel también
    var heroBtn = qs("#hero-abrir-carrito");
    if (heroBtn) heroBtn.addEventListener("click", function () {
      renderCarrito();
      openPanel();
    });
    if (vaciar) {
      vaciar.addEventListener("click", function () {
        carrito = {};
        renderCarrito();
        syncAgregarBtns();
      });
    }

    // Botones "Agregar" en cards
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".btn-agregar");
      if (!btn) return;
      var card = btn.closest(".producto-card");
      if (!card) return;

      var nombre  = card.dataset.nombre || "Producto";
      var precio  = parseFloat(card.dataset.precio) || 0;
      var emoji   = (card.querySelector(".prod-emoji-img") || {}).textContent || "🛒";

      if (carrito[nombre]) {
        carrito[nombre].qty++;
      } else {
        carrito[nombre] = { nombre: nombre, precio: precio, qty: 1, emoji: emoji.trim() };
      }

      renderCarrito();
      syncAgregarBtns();

      // Bounce FAB
      var fab2 = qs("#carrito-fab");
      if (fab2) {
        fab2.classList.remove("is-bounce");
        void fab2.offsetWidth; // reflow
        fab2.classList.add("is-bounce");
      }

      // Brief feedback on button
      btn.textContent = "✓ Agregado!";
      setTimeout(function () { syncAgregarBtns(); }, 1000);
    });

    // Delivery toggle
    qsa(".dtoggle-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        qsa(".dtoggle-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var addrWrap = qs("#delivery-address-wrap");
        if (addrWrap) addrWrap.style.display = btn.dataset.mode === "delivery" ? "block" : "none";
        renderCarrito();
      });
    });
    var addrInput = qs("#delivery-address");
    if (addrInput) addrInput.addEventListener("input", renderCarrito);

    renderCarrito();
  }

  /* ══ NAV ══ */
  function initNav() {
    var nav = qs("#nav");
    var hamburger = qs("#nav-hamburger");
    var mobile = qs("#nav-mobile");
    window.addEventListener("scroll", function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 20);
    }, { passive: true });
    if (hamburger && mobile) {
      hamburger.addEventListener("click", function () {
        var o = mobile.classList.toggle("is-open");
        hamburger.classList.toggle("is-open", o);
      });
      qsa("a", mobile).forEach(function (a) {
        a.addEventListener("click", function () {
          mobile.classList.remove("is-open");
          hamburger.classList.remove("is-open");
        });
      });
    }
  }

  /* ══ REVEALS ══ */
  function initReveals() {
    var items = qsa(".reveal");
    if (!items.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.04 });
    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min((i % 6) * 0.06, 0.3) + "s";
      observer.observe(el);
      setTimeout(function () { el.classList.add("is-visible"); }, 6000);
    });
  }

  /* ══ CATALOG FILTER ══ */
  function initCatalog() {
    var grid = qs("#productos-grid");
    var input = qs("#search-input");
    var noResults = qs("#no-results");
    if (!grid) return;
    var currentCat = "all", currentQ = "";

    function normalize(s) {
      return s.toLowerCase()
        .replace(/[áàä]/g,"a").replace(/[éèë]/g,"e")
        .replace(/[íìï]/g,"i").replace(/[óòö]/g,"o")
        .replace(/[úùü]/g,"u").replace(/ñ/g,"n");
    }
    function filter() {
      var cards = qsa(".producto-card", grid);
      var visible = 0;
      cards.forEach(function (card) {
        var okCat = currentCat === "all" || card.dataset.cat === currentCat;
        var okQ   = !currentQ || normalize(card.textContent).indexOf(currentQ) > -1;
        var show  = okCat && okQ;
        card.classList.toggle("is-hidden", !show);
        if (show) { visible++; if (!card.classList.contains("is-visible")) card.classList.add("is-visible"); }
      });
      if (noResults) noResults.style.display = visible === 0 ? "flex" : "none";
    }
    qsa(".cat-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        qsa(".cat-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        currentCat = btn.dataset.cat;
        filter();
      });
    });
    if (input) {
      input.addEventListener("input", function () {
        currentQ = normalize(input.value.trim());
        filter();
      });
    }
  }

  /* ══ TILT ══ */
  function initTilt() {
    if (matchMedia("(hover: none)").matches) return;
    qsa(".producto-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "translateY(-5px) rotateX(" + (-y * 5) + "deg) rotateY(" + (x * 5) + "deg)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ══ COUNTERS ══ */
  function initCounters() {
    var els = qsa("[data-target]");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.dataset.target, 10);
        var t0 = null;
        (function tick(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / 1200, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
          if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { observer.observe(el); });
  }

  /* ══ ANCHORS ══ */
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    });
  }

  /* ══ BOOT ══ */
  function boot() {
    safe(initNav,      "initNav");
    safe(initCarrito,  "initCarrito");
    safe(initReveals,  "initReveals");
    safe(initCatalog,  "initCatalog");
    safe(initTilt,     "initTilt");
    safe(initCounters, "initCounters");
    safe(initAnchors,  "initAnchors");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
