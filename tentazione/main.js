/* ═══════════════════════════════════════════════════════
   TENTAZIONE — MAIN.JS
   Pattern: IIFE + defer, no ES modules, no lib dependencies
   v2026-06-02b
══════════════════════════════════════════════════════ */
(function () {
  "use strict";

  function safe(fn, name) {
    try { fn(); }
    catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ── SPLASH ───────────────────────────────────────── */
  function initSplash() {
    var splash = document.getElementById("splash");
    if (!splash) return;
    /* El splash ya es visible por CSS desde el primer paint.
       Solo necesitamos ocultarlo después de 1.8s. */
    setTimeout(function () {
      splash.classList.add("is-hiding");
      setTimeout(function () {
        splash.style.display = "none";
      }, 700);
    }, 1800);
  }

  /* ── NAV ──────────────────────────────────────────── */
  function initNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Smooth anchor scrolling
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  }

  /* ── MOBILE MENU ──────────────────────────────────── */
  function initMobileMenu() {
    var burger = document.querySelector(".nav-burger");
    var menu   = document.getElementById("mobile-menu");
    var close  = document.querySelector(".mobile-close");
    if (!burger || !menu) return;

    function openMenu() {
      menu.classList.add("open");
      burger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    function closeMenu() {
      menu.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    burger.addEventListener("click", openMenu);
    if (close) close.addEventListener("click", closeMenu);
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ── REVEAL INTERSECTION OBSERVER ───────────────────── */
  function initReveals() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    // Si IntersectionObserver no está disponible, mostrar todo
    if (!window.IntersectionObserver) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });

    els.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4 * 80) + "ms";
      io.observe(el);
      // 6s safety net
      setTimeout(function () { el.classList.add("is-visible"); }, 6000);
    });
  }

  /* ── CARD TILT ─────────────────────────────────────── */
  function initCardTilt() {
    if (window.matchMedia("(hover: none)").matches) return;
    var cards = document.querySelectorAll(".card");
    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r  = card.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
        var dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
        card.style.transform = "translateY(-6px) rotateX(" + (dy * -5) + "deg) rotateY(" + (dx * 5) + "deg)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ── GSAP (si carga desde CDN) ───────────────────── */
  function initGSAP() {
    if (typeof gsap === "undefined") return;
    if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

    var galItems = document.querySelectorAll(".galeria-item");
    if (galItems.length && typeof ScrollTrigger !== "undefined") {
      gsap.from(galItems, {
        scrollTrigger: { trigger: ".galeria-strip", start: "top 85%" },
        x: 50, opacity: 0, stagger: .1, duration: .7, ease: "power2.out"
      });
    }
  }

  /* ── CARTA TABS ─────────────────────────────────── */
  function initCartaTabs() {
    var tabs   = document.querySelectorAll(".carta-tab");
    var panels = document.querySelectorAll(".carta-panel");
    if (!tabs.length) return;

    /* Estado inicial: forzar display via style */
    panels.forEach(function(p) {
      p.style.display = p.classList.contains("active") ? "block" : "none";
    });

    tabs.forEach(function(tab) {
      tab.addEventListener("click", function() {
        var target = tab.getAttribute("data-tab");
        if (!target) return;

        tabs.forEach(function(t) {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        panels.forEach(function(p) {
          p.classList.remove("active");
          p.style.display = "none";
        });

        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        var panel = document.getElementById("tab-" + target);
        if (panel) {
          panel.classList.add("active");
          panel.style.display = "block";
          panel.style.removeProperty("display");  /* dejar que CSS tome control */
          panel.style.display = "block";           /* forzar igualmente */
        }
      });
    });
  }

  /* ── BOOT ─────────────────────────────────────────── */
  function boot() {
    safe(initSplash,     "splash");
    safe(initNav,        "nav");
    safe(initMobileMenu, "menu");
    safe(initReveals,    "reveals");
    safe(initCardTilt,   "tilt");
    safe(initGSAP,       "gsap");
    safe(initCartaTabs,    "tabs");
    safe(initDeliveryModal, "delivery-modal");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();

/* ═══════════════════════════════════════════════════════
   CARRITO WHATSAPP — Tentazione
   Mismo patrón que M&R Market
══════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var WA_NUMBER = "51928372003";

  /* Catálogo — sincronizado con la carta del HTML */
  var CATALOGO = [
    /* Brunch */
    { id:"desayuno-della-casa",  nombre:"Desayuno Della Casa",           precio:38, cat:"🍳 Brunch" },
    { id:"campesino",            nombre:"Campesino",                     precio:37, cat:"🍳 Brunch" },
    { id:"croissant-tentazione", nombre:"Croissant Tentazione",          precio:35, cat:"🍳 Brunch" },
    { id:"desayuno-clasico",     nombre:"Desayuno Clásico",              precio:36, cat:"🍳 Brunch" },
    { id:"waffle-clasico-combo", nombre:"Waffle Clásico (combo brunch)", precio:34, cat:"🍳 Brunch" },
    { id:"croissant-revuelto",   nombre:"Croissant Revuelto",            precio:30, cat:"🍳 Brunch" },
    { id:"bowl-granola",         nombre:"Bowl de Granola",               precio:24, cat:"🍳 Brunch" },
    { id:"macedonia",            nombre:"Macedonia",                     precio:26, cat:"🍳 Brunch" },
    /* Salado */
    { id:"brisket",              nombre:"Brisket Ahumado a Fuego Lento", precio:37, cat:"🥐 Salado" },
    { id:"milano",               nombre:"Milano Speciale",               precio:35, cat:"🥐 Salado" },
    { id:"blt",                  nombre:"BLT - Lattuga e Pomodoro",      precio:33, cat:"🥐 Salado" },
    { id:"bondiola",             nombre:"Bondiola Artigianale",          precio:30, cat:"🥐 Salado" },
    { id:"caprese",              nombre:"Caprese Fior di Latte",         precio:24, cat:"🥐 Salado" },
    { id:"ahumado",              nombre:"Ahumado",                       precio:26, cat:"🥐 Salado" },
    { id:"mixta",                nombre:"Mixta",                        precio:23, cat:"🥐 Salado" },
    { id:"croissant-pollo",      nombre:"Croissant de Pollo y Palta",    precio:20, cat:"🥐 Salado" },
    { id:"pan-pollo",            nombre:"Pan con Pollo",                 precio:18, cat:"🥐 Salado" },
    { id:"quiche-espinacas",     nombre:"Quiche Espinacas y Champiñones",precio:18, cat:"🥐 Salado" },
    { id:"quiche-lorraine",      nombre:"Quiche Lorraine",               precio:18, cat:"🥐 Salado" },
    { id:"empanada-carne",       nombre:"Empanada de Carne",             precio:12, cat:"🥐 Salado" },
    { id:"empanada-pollo",       nombre:"Empanada de Pollo",             precio:12, cat:"🥐 Salado" },
    { id:"huerta",               nombre:"Huerta",                       precio:24, cat:"🥐 Salado" },
    { id:"apaltado",             nombre:"Apaltado",                     precio:23, cat:"🥐 Salado" },
    /* Dolci */
    { id:"tentazione-cake",      nombre:"Tentazione",                   precio:22, cat:"🍰 Dolci" },
    { id:"torta-vasca",          nombre:"Torta Vasca",                  precio:20, cat:"🍰 Dolci" },
    { id:"torta-chocolate",      nombre:"Torta de Chocolate",           precio:17, cat:"🍰 Dolci" },
    { id:"carrot-cake",          nombre:"Carrot Cake",                  precio:16, cat:"🍰 Dolci" },
    { id:"crema-volteada",       nombre:"Crema Volteada",               precio:17, cat:"🍰 Dolci" },
    { id:"pie-limon",            nombre:"Pie de Limón",                 precio:17, cat:"🍰 Dolci" },
    { id:"queque-limon",         nombre:"Queque de Limón y Arándanos",  precio:11, cat:"🍰 Dolci" },
    { id:"minis-3",              nombre:"Postres Minis x3",             precio:12, cat:"🍰 Dolci" },
    { id:"minis-4",              nombre:"Postres Minis x4",             precio:15, cat:"🍰 Dolci" },
    { id:"waffle-clasico",       nombre:"Waffle Clásico",               precio:22, cat:"🍰 Dolci" },
    { id:"waffle-bacon",         nombre:"Waffle Bacon",                 precio:23, cat:"🍰 Dolci" },
    { id:"waffle-avena",         nombre:"Waffle de Avena",              precio:25, cat:"🍰 Dolci" },
    { id:"choco-fit",            nombre:"Torta de Chocolate Fit",       precio:22, cat:"🍰 Dolci" },
    { id:"carrot-fit",           nombre:"Carrot Cake Fit",              precio:22, cat:"🍰 Dolci" },
    { id:"choco-pecanas",        nombre:"Chocobarra de Pecanas",        precio:14, cat:"🍰 Dolci" },
    { id:"choco-avellanas",      nombre:"Chocobarra de Avellanas",      precio:14, cat:"🍰 Dolci" },
    { id:"alfajor-choco",        nombre:"Alfajor de Chocoframbuesa",    precio:17, cat:"🍰 Dolci" },
    /* Bebidas */
    { id:"lungo",                nombre:"Lungo",                        precio: 6, cat:"☕ Bebidas" },
    { id:"espresso",             nombre:"Espresso Doble",               precio: 8, cat:"☕ Bebidas" },
    { id:"americano",            nombre:"Americano",                    precio: 9, cat:"☕ Bebidas" },
    { id:"cappuccino",           nombre:"Cappuccino",                   precio:10, cat:"☕ Bebidas" },
    { id:"latte",                nombre:"Latte",                        precio:11, cat:"☕ Bebidas" },
    { id:"flatwhite",            nombre:"Flatwhite",                    precio:11, cat:"☕ Bebidas" },
    { id:"caramel-latte",        nombre:"Caramel Latte",                precio:14, cat:"☕ Bebidas" },
    { id:"chocolate-caliente",   nombre:"Chocolate Caliente",           precio:13, cat:"☕ Bebidas" },
    { id:"matcha-latte",         nombre:"Iced Matcha Latte",            precio:15, cat:"☕ Bebidas" },
    { id:"vanilla-matcha",       nombre:"Vanilla Iced Matcha Latte",    precio:17, cat:"☕ Bebidas" },
    { id:"strawberry-matcha",    nombre:"Strawberry Iced Matcha Latte", precio:17, cat:"☕ Bebidas" },
    { id:"maracumango-matcha",   nombre:"Maracumango Iced Matcha Latte",precio:19, cat:"☕ Bebidas" },
    { id:"cold-brew",            nombre:"Cold Brew",                    precio:13, cat:"☕ Bebidas" },
    { id:"tonic-cold-brew",      nombre:"Tonic Cold Brew",              precio:14, cat:"☕ Bebidas" },
    { id:"orange-cold-brew",     nombre:"Orange Cold Brew",             precio:16, cat:"☕ Bebidas" },
    { id:"passion-cold-brew",    nombre:"Passion Fruit Cold Brew",      precio:15, cat:"☕ Bebidas" },
    { id:"honey-cold-brew",      nombre:"Honey Lemonade Cold Brew",     precio:17, cat:"☕ Bebidas" },
    { id:"frappe",               nombre:"Frappé",                       precio:18, cat:"☕ Bebidas" },
    { id:"milkshake",            nombre:"Milkshake",                    precio:18, cat:"☕ Bebidas" },
    { id:"jugo-frutas",          nombre:"Jugo de Frutas",               precio:13, cat:"☕ Bebidas" },
    { id:"limonada-coco",        nombre:"Limonada de Coco",             precio:17, cat:"☕ Bebidas" },
    { id:"limonada-maracuya",    nombre:"Limonada de Maracuyá",         precio:14, cat:"☕ Bebidas" },
    { id:"frutti-rossi",         nombre:"Frutti Rossi",                 precio:14, cat:"☕ Bebidas" },
    { id:"dolce-tropicale",      nombre:"Dolce Tropicale",              precio:17, cat:"☕ Bebidas" },
    { id:"cherry-breeze",        nombre:"Cherry Breeze",                precio:14, cat:"☕ Bebidas" },
    { id:"naranja-chill",        nombre:"Naranja Chill",                precio:14, cat:"☕ Bebidas" },
    { id:"citrus-energy",        nombre:"Citrus Energy",                precio:14, cat:"☕ Bebidas" },
    { id:"verde-vitale",         nombre:"Verde Vitale",                 precio:16, cat:"☕ Bebidas" },
    { id:"agua",                 nombre:"Agua con o sin gas",           precio: 7, cat:"☕ Bebidas" },
  ];

  /* Estado del carrito */
  var carrito = {};  /* { id: cantidad } */

  /* ── DOM helpers ─────────────────────────────── */
  function $(sel) { return document.querySelector(sel); }
  function totalItems() {
    return Object.values(carrito).reduce(function(s, n) { return s + n; }, 0);
  }

  /* ── Construir HTML del carrito ──────────────── */
  function renderCarrito() {
    var items = $("#carrito-items");
    var count = $("#carrito-count");
    var fab   = $("#carrito-fab");
    var total = totalItems();

    count.textContent = total;
    fab.style.display = total > 0 ? "flex" : "none";

    var ids = Object.keys(carrito).filter(function(id) { return carrito[id] > 0; });

    if (!ids.length) {
      items.innerHTML = '<p class="carrito-empty">Tu pedido está vacío.<br>Agrega productos de la carta.</p>';
      $("#carrito-wsp-btn").setAttribute("href", "#");
      $("#carrito-wsp-btn").style.opacity = ".4";
      $("#carrito-wsp-btn").style.pointerEvents = "none";
      return;
    }

    var html = "";
    ids.forEach(function(id) {
      var item = CATALOGO.find(function(p) { return p.id === id; });
      if (!item) return;
      html += '<div class="ci-row">' +
        '<div class="ci-row-info">' +
          '<span class="ci-row-name">' + item.nombre + '</span>' +
          '<span class="ci-row-cat">' + item.cat + '</span>' +
        '</div>' +
        '<div class="ci-row-ctrl">' +
          '<button class="ci-btn ci-minus" data-id="' + id + '" aria-label="Quitar uno">−</button>' +
          '<span class="ci-qty">' + carrito[id] + '</span>' +
          '<button class="ci-btn ci-plus" data-id="' + id + '" aria-label="Agregar uno">+</button>' +
        '</div>' +
      '</div>';
    });
    items.innerHTML = html;

    /* Actualizar botón WA */
    /* Total */
    var totalS = 0;
    Object.keys(carrito).forEach(function(id) {
      var item = CATALOGO.find(function(p) { return p.id === id; });
      if (item) totalS += item.precio * carrito[id];
    });
    var totalEl = $("#carrito-total");
    if (totalEl) totalEl.textContent = "S/ " + totalS.toFixed(2);

    var btnRecojo   = $("#carrito-recojo-btn");
    var btnDelivery = $("#carrito-delivery-btn");
    if (btnRecojo) {
      btnRecojo.setAttribute("href", buildWALink("recojo"));
      btnRecojo.style.opacity = "1";
      btnRecojo.style.pointerEvents = "auto";
    }
    if (btnDelivery) {
      btnDelivery.setAttribute("href", buildWALink("delivery"));
      btnDelivery.style.opacity = "1";
      btnDelivery.style.pointerEvents = "auto";
    }

    /* Bind botones +/- del panel */
    items.querySelectorAll(".ci-minus").forEach(function(b) {
      b.addEventListener("click", function() { cambiarCantidad(b.dataset.id, -1); });
    });
    items.querySelectorAll(".ci-plus").forEach(function(b) {
      b.addEventListener("click", function() { cambiarCantidad(b.dataset.id, +1); });
    });
  }

  /* ── Construir mensaje WA ────────────────────── */
  function buildWALink(entrega, direccion) {
    /* entrega: "recojo" | "delivery"
       direccion: string opcional (solo para delivery) */
    var lineas = ["Hola! Quisiera hacer el siguiente pedido en Tentazione:"];
    lineas.push("");
    var catActual = "";
    var totalMsg = 0;
    CATALOGO.forEach(function(item) {
      if (!carrito[item.id]) return;
      var catLabel = item.cat.replace(/^[^ ]+ /, "");
      if (catLabel !== catActual) {
        lineas.push("--- " + catLabel + " ---");
        catActual = catLabel;
      }
      var subtotal = item.precio * carrito[item.id];
      totalMsg += subtotal;
      lineas.push("  " + carrito[item.id] + "x " + item.nombre + " (S/ " + subtotal.toFixed(2) + ")");
    });
    lineas.push("");
    lineas.push("TOTAL: S/ " + totalMsg.toFixed(2));
    lineas.push("");
    if (entrega === "delivery") {
      lineas.push("Modalidad: Delivery");
      var dir = direccion ? direccion.trim() : "";
      if (dir) {
        lineas.push("Direccion de entrega: " + dir);
      } else {
        lineas.push("Direccion de entrega: (por confirmar)");
      }
      lineas.push("(Por favor indicarme el costo de delivery a esa zona)");
    } else {
      lineas.push("Modalidad: Recojo en tienda");
    }
    lineas.push("");
    lineas.push("Gracias!");
    var msg = encodeURIComponent(lineas.join("\n"));
    return "https://wa.me/" + WA_NUMBER + "?text=" + msg;
  }

  /* ── Cambiar cantidad ────────────────────────── */
  function cambiarCantidad(id, delta) {
    carrito[id] = (carrito[id] || 0) + delta;
    if (carrito[id] <= 0) delete carrito[id];
    /* Actualizar botón agregar en la carta */
    var btn = document.querySelector('[data-carrito-id="' + id + '"]');
    if (btn) actualizarBtnCarta(btn, id);
    renderCarrito();
  }

  /* ── Actualizar visual del botón en carta ──── */
  function actualizarBtnCarta(btn, id) {
    var qty = carrito[id] || 0;
    if (qty > 0) {
      btn.classList.add("en-carrito");
      btn.textContent = qty + " ✓";
    } else {
      btn.classList.remove("en-carrito");
      btn.textContent = "+ Agregar";
    }
  }

  /* ── Inyectar botones en cada ítem de carta ── */
  function initCartaBtns() {
    var items = document.querySelectorAll(".carta-item[data-product-id]");
    items.forEach(function(row) {
      var pid = row.getAttribute("data-product-id");
      var producto = CATALOGO.find(function(p) { return p.id === pid; });
      if (!producto) return;

      var btn = document.createElement("button");
      btn.className = "btn-agregar";
      btn.dataset.carritoId = pid;
      btn.textContent = "+ Agregar";
      btn.setAttribute("aria-label", "Agregar " + producto.nombre + " al pedido");
      btn.addEventListener("click", function() {
        cambiarCantidad(pid, +1);
      });
      /* Insertar ANTES del precio (ci-price) */
      var priceEl = row.querySelector(".ci-price");
      if (priceEl) {
        row.insertBefore(btn, priceEl);
      } else {
        row.appendChild(btn);
      }
    });
  }

  /* ── Panel carrito open/close ────────────────── */
  function initPanelCarrito() {
    var fab     = $("#carrito-fab");
    var panel   = $("#carrito-panel");
    var close   = $("#carrito-close");
    var overlay = $("#carrito-overlay");

    function openPanel() {
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function closePanel() {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    if (fab)     fab.addEventListener("click", openPanel);
    if (close)   close.addEventListener("click", closePanel);
    if (overlay) overlay.addEventListener("click", closePanel);
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") {
        closePanel();
        closeDeliveryModal();
      }
    });
  }

  /* ── Modal dirección delivery ─────────────────── */
  function initDeliveryModal() {
    var modal   = $("#delivery-modal");
    var overlay = $("#delivery-overlay-modal");
    var input   = $("#delivery-direccion");
    var btnEnv  = $("#delivery-enviar");
    var btnCan  = $("#delivery-cancelar");
    var btnDel  = $("#carrito-delivery-btn");
    if (!modal || !btnDel) return;

    function openDeliveryModal() {
      modal.classList.add("open");
      overlay.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (input) setTimeout(function() { input.focus(); }, 100);
      updateDeliveryLink();
    }

    function updateDeliveryLink() {
      var dir = input ? input.value.trim() : "";
      btnEnv.setAttribute("href", buildWALink("delivery", dir));
    }

    if (input) input.addEventListener("input", updateDeliveryLink);

    /* Enter en el input → enviar */
    if (input) {
      input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
          updateDeliveryLink();
          btnEnv.click();
          closeDeliveryModal();
        }
      });
    }

    btnDel.addEventListener("click", function(e) {
      e.preventDefault();
      /* Cerrar panel carrito primero */
      var panel = $("#carrito-panel");
      if (panel) {
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
      }
      openDeliveryModal();
    });

    if (btnCan)  btnCan.addEventListener("click",  closeDeliveryModal);
    if (overlay) overlay.addEventListener("click", closeDeliveryModal);

    /* Al enviar, cerrar modal */
    if (btnEnv) {
      btnEnv.addEventListener("click", function() {
        setTimeout(closeDeliveryModal, 200);
      });
    }
  }

  function closeDeliveryModal() {
    var modal   = $("#delivery-modal");
    var overlay = $("#delivery-overlay-modal");
    if (modal)   { modal.classList.remove("open");   modal.setAttribute("aria-hidden","true"); }
    if (overlay) overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* ── Boot carrito ─────────────────────────── */
  function bootCarrito() {
    initCartaBtns();
    initPanelCarrito();
    renderCarrito();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootCarrito);
  } else {
    bootCarrito();
  }

})();


