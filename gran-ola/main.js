(function () {
  "use strict";

  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.from((scope || document).querySelectorAll(sel)); };
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;
    var toggle = function () {
      nav.classList.toggle("is-solid", window.scrollY > 24);
    };
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
  }

  function initMobileNav() {
    var burger = $("[data-burger]");
    var menu = $("[data-mobile-nav]");
    if (!burger || !menu) return;
    menu.hidden = true;

    function close() {
      menu.hidden = true;
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
    function open() {
      menu.hidden = false;
      burger.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
    }
    burger.addEventListener("click", function () {
      if (menu.hidden) open(); else close();
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navOffset = 84;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  function initReveals() {
    var els = $$("[data-reveal]");
    if (!els.length) return;
    if (typeof IntersectionObserver === "undefined") {
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
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      $$("[data-reveal]:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  function initCatPills() {
    var pills = $$("[data-cat-pill]");
    var sections = $$("[data-cat-section]");
    if (!pills.length || !sections.length) return;

    if (typeof IntersectionObserver === "undefined") return;

    var byId = {};
    pills.forEach(function (p) { byId[p.getAttribute("data-cat-pill")] = p; });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute("data-cat-section");
        pills.forEach(function (p) { p.classList.remove("is-active"); });
        if (byId[id]) byId[id].classList.add("is-active");
      });
    }, { threshold: 0, rootMargin: "-40% 0px -55% 0px" });

    sections.forEach(function (s) { io.observe(s); });
  }

  var escHTML = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ══════════════════════════════════════
     CARRITO — pedido multi-ítem a WhatsApp
     ══════════════════════════════════════ */
  var WSP_NUMBER = "51943600184";
  var carrito = {}; // { "key": { nombre, variante, precio, qty } }
  var pagoActual = "Yape";

  function carritoTotal() {
    return Object.keys(carrito).reduce(function (sum, k) {
      return sum + carrito[k].precio * carrito[k].qty;
    }, 0);
  }
  function carritoCount() {
    return Object.keys(carrito).reduce(function (sum, k) { return sum + carrito[k].qty; }, 0);
  }

  function priceTxt(v) { return "S/ " + Number(v).toFixed(2); }

  function mountCartControls() {
    $$("[data-cart-controls]").forEach(function (el) {
      if (el.dataset.mounted) return;
      el.dataset.mounted = "1";
      var card = el.closest(".product-card");
      if (!card) return;
      var variants = [];
      try { variants = JSON.parse(card.getAttribute("data-variants") || "[]"); } catch (e) { variants = []; }
      if (!variants.length) return;

      var dropdownHTML = "";
      if (variants.length > 1) {
        dropdownHTML = '<div class="pcc-dropdown" data-pcc-dropdown data-selected="0">' +
          '<button type="button" class="pcc-dropdown-btn" data-pcc-toggle aria-haspopup="listbox" aria-expanded="false">' +
            '<span data-pcc-selected-label>' + escHTML(variants[0].label) + '</span>' +
            '<span class="pcc-selected-price" data-pcc-selected-price>' + priceTxt(variants[0].price) + '</span>' +
            '<svg class="pcc-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>' +
          '</button>' +
          '<ul class="pcc-dropdown-list" data-pcc-list role="listbox" hidden>' +
            variants.map(function (v, i) {
              return '<li class="pcc-option' + (i === 0 ? ' is-selected' : '') + '" role="option" data-index="' + i + '">' +
                '<span>' + escHTML(v.label) + '</span>' +
                '<span class="pcc-option-price">' + priceTxt(v.price) + '</span>' +
              '</li>';
            }).join("") +
          '</ul>' +
        '</div>';
      }

      el.innerHTML = dropdownHTML +
        '<div class="pcc-row">' +
          '<div class="pcc-qty">' +
            '<button type="button" data-pcc-minus aria-label="Quitar uno">−</button>' +
            '<span data-pcc-qty>1</span>' +
            '<button type="button" data-pcc-plus aria-label="Agregar uno">+</button>' +
          "</div>" +
          '<button type="button" class="btn-agregar" data-pcc-add>+ Agregar</button>' +
        "</div>";
    });
  }

  function closeAllDropdowns(except) {
    $$(".pcc-dropdown.is-open").forEach(function (d) {
      if (d === except) return;
      d.classList.remove("is-open");
      var list = $("[data-pcc-list]", d);
      var btn = $("[data-pcc-toggle]", d);
      if (list) list.hidden = true;
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  function initDropdowns() {
    document.addEventListener("click", function (e) {
      var toggle = e.target.closest("[data-pcc-toggle]");
      var option = e.target.closest(".pcc-option");

      if (toggle) {
        var dropdown = toggle.closest("[data-pcc-dropdown]");
        var list = $("[data-pcc-list]", dropdown);
        var isOpen = dropdown.classList.contains("is-open");
        closeAllDropdowns(isOpen ? null : dropdown);
        dropdown.classList.toggle("is-open", !isOpen);
        list.hidden = isOpen;
        toggle.setAttribute("aria-expanded", String(!isOpen));
        return;
      }

      if (option) {
        var dd = option.closest("[data-pcc-dropdown]");
        var idx = option.getAttribute("data-index");
        dd.setAttribute("data-selected", idx);
        $$(".pcc-option", dd).forEach(function (o) { o.classList.remove("is-selected"); });
        option.classList.add("is-selected");
        $("[data-pcc-selected-label]", dd).textContent = option.querySelector("span").textContent;
        $("[data-pcc-selected-price]", dd).textContent = option.querySelector(".pcc-option-price").textContent;
        dd.classList.remove("is-open");
        $("[data-pcc-list]", dd).hidden = true;
        $("[data-pcc-toggle]", dd).setAttribute("aria-expanded", "false");
        return;
      }

      if (!e.target.closest("[data-pcc-dropdown]")) closeAllDropdowns();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAllDropdowns();
    });
  }

  function renderCarrito() {
    var itemsEl = $("#carrito-items");
    var countEl = $("#carrito-count");
    var totalEl = $("#carrito-total");
    var fab = $("#carrito-fab");
    var wspBtn = $("#carrito-wsp-btn");
    if (!itemsEl) return;

    var keys = Object.keys(carrito);
    var count = carritoCount();

    if (fab) fab.style.display = count > 0 ? "flex" : "none";
    if (countEl) countEl.textContent = count;
    if (totalEl) totalEl.textContent = "S/ " + carritoTotal().toFixed(2);

    if (!keys.length) {
      itemsEl.innerHTML = '<p class="carrito-empty">Tu pedido está vacío.<br/>Agrega productos del catálogo.</p>';
    } else {
      itemsEl.innerHTML = keys.map(function (key) {
        var it = carrito[key];
        return '<div class="carrito-item" data-key="' + escHTML(key) + '">' +
          '<div class="ci-info">' +
            '<div class="ci-name">' + escHTML(it.nombre) + "</div>" +
            (it.variante ? '<div class="ci-variant">' + escHTML(it.variante) + "</div>" : "") +
            '<div class="ci-price">S/ ' + it.precio.toFixed(2) + " c/u</div>" +
          "</div>" +
          '<div class="ci-controls">' +
            '<button class="ci-btn" data-ci-minus aria-label="Quitar uno">−</button>' +
            '<span class="ci-qty">' + it.qty + "</span>" +
            '<button class="ci-btn" data-ci-plus aria-label="Agregar uno">+</button>' +
          "</div>" +
        "</div>";
      }).join("");

      $$("[data-ci-minus]", itemsEl).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var key = btn.closest(".carrito-item").dataset.key;
          if (carrito[key]) {
            carrito[key].qty--;
            if (carrito[key].qty <= 0) delete carrito[key];
          }
          renderCarrito();
        });
      });
      $$("[data-ci-plus]", itemsEl).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var key = btn.closest(".carrito-item").dataset.key;
          if (carrito[key]) carrito[key].qty++;
          renderCarrito();
        });
      });
    }

    if (wspBtn) {
      if (!keys.length) {
        wspBtn.removeAttribute("href");
        wspBtn.style.opacity = "0.5";
        wspBtn.style.pointerEvents = "none";
      } else {
        var modoBtn = $(".dtoggle-btn.active");
        var modo = modoBtn ? modoBtn.getAttribute("data-mode") : "recojo";
        var dirEl = $("#delivery-address");
        var dir = dirEl ? dirEl.value.trim() : "";
        var entrega = modo === "delivery"
          ? "DELIVERY" + (dir ? " a: " + dir : " (paso la dirección por el chat)")
          : "RECOJO EN TIENDA";

        var lineas = keys.map(function (key) {
          var it = carrito[key];
          var nombreLinea = it.nombre + (it.variante ? " (" + it.variante + ")" : "");
          return "• " + nombreLinea + " x" + it.qty + " = S/ " + (it.precio * it.qty).toFixed(2);
        });

        var msg = "Hola! Vi el catálogo web de Gran-Ola y quiero hacer este pedido:\n\n" +
          lineas.join("\n") + "\n\n" +
          "TOTAL: S/ " + carritoTotal().toFixed(2) + "\n" +
          "ENTREGA: " + entrega + "\n" +
          "PAGO: " + pagoActual + "\n\n" +
          "¿Está disponible?";

        wspBtn.href = "https://wa.me/" + WSP_NUMBER + "?text=" + encodeURIComponent(msg);
        wspBtn.style.opacity = "1";
        wspBtn.style.pointerEvents = "auto";
      }
    }
  }

  function initCarrito() {
    mountCartControls();

    var fab = $("#carrito-fab");
    var panel = $("#carrito-panel");
    var overlay = $("#carrito-overlay");
    var closeBtn = $("#carrito-close");
    var vaciar = $("#carrito-vaciar");

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

    if (fab) fab.addEventListener("click", function () { renderCarrito(); openPanel(); });
    if (closeBtn) closeBtn.addEventListener("click", closePanel);
    if (overlay) overlay.addEventListener("click", closePanel);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePanel();
    });

    if (vaciar) {
      vaciar.addEventListener("click", function () {
        carrito = {};
        renderCarrito();
      });
    }

    // Stepper + Agregar dentro de cada card
    document.addEventListener("click", function (e) {
      var minus = e.target.closest("[data-pcc-minus]");
      var plus = e.target.closest("[data-pcc-plus]");
      var add = e.target.closest("[data-pcc-add]");
      if (!minus && !plus && !add) return;

      var controls = e.target.closest("[data-cart-controls]");
      if (!controls) return;
      var qtyEl = $("[data-pcc-qty]", controls);
      var qty = parseInt(qtyEl.textContent, 10) || 1;

      if (minus) {
        qty = Math.max(1, qty - 1);
        qtyEl.textContent = qty;
        return;
      }
      if (plus) {
        qty = qty + 1;
        qtyEl.textContent = qty;
        return;
      }
      if (add) {
        var card = controls.closest(".product-card");
        if (!card) return;
        var variants = [];
        try { variants = JSON.parse(card.getAttribute("data-variants") || "[]"); } catch (err) { variants = []; }
        var dropdownEl = $("[data-pcc-dropdown]", controls);
        var idx = dropdownEl ? parseInt(dropdownEl.getAttribute("data-selected"), 10) : 0;
        var variant = variants[idx] || variants[0];
        if (!variant) return;

        var nombre = card.getAttribute("data-nombre") || "Producto";
        var key = nombre + "|" + variant.label;

        if (carrito[key]) {
          carrito[key].qty += qty;
        } else {
          carrito[key] = { nombre: nombre, variante: variant.label, precio: Number(variant.price), qty: qty };
        }

        renderCarrito();
        qtyEl.textContent = 1;

        add.classList.add("is-added");
        add.textContent = "✓ Agregado";
        setTimeout(function () {
          add.classList.remove("is-added");
          add.textContent = "+ Agregar";
        }, 1200);

        if (fab) {
          fab.classList.remove("is-bounce");
          void fab.offsetWidth;
          fab.classList.add("is-bounce");
        }
      }
    });

    // Delivery toggle
    $$(".dtoggle-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$(".dtoggle-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var wrap = $("#delivery-address-wrap");
        if (wrap) wrap.style.display = btn.getAttribute("data-mode") === "delivery" ? "block" : "none";
        renderCarrito();
      });
    });
    var addrInput = $("#delivery-address");
    if (addrInput) addrInput.addEventListener("input", renderCarrito);

    // Método de pago
    $$(".pago-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$(".pago-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        pagoActual = btn.getAttribute("data-pago");
        renderCarrito();
      });
    });

    renderCarrito();
  }

  function boot() {
    safe(initNav, "initNav");
    safe(initMobileNav, "initMobileNav");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initReveals, "initReveals");
    safe(initCatPills, "initCatPills");
    safe(initCarrito, "initCarrito");
    safe(initDropdowns, "initDropdowns");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
