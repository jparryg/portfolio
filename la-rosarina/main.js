(function () {
  "use strict";

  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const escHTML = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  function initSplash() {
    const splash = $("[data-splash]");
    if (!splash) return;
    const hide = () => splash.classList.add("out");
    window.addEventListener("load", () => setTimeout(hide, 1200));
    setTimeout(hide, 4500);
  }

  function initReveals() {
    const items = $$(".reveal");
    if (!items.length) return;

    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -5% 0px" }
    );

    items.forEach((el) => io.observe(el));

    setTimeout(() => {
      items.forEach((el) => el.classList.add("is-visible"));
    }, 6000);
  }

  function initTiendaModal() {
    const modal = $("[data-tienda-modal]");
    const buttons = $$("[data-tienda-open]");
    if (!modal || !buttons.length) return;

    const data = (window.__BRAND__ && window.__BRAND__.tiendaVariantes) || {};
    const titleEl = $("[data-tienda-modal-title]", modal);
    const gridEl = $("[data-tienda-modal-grid]", modal);
    const waBase = "https://wa.me/51947710311?text=";

    function openModal(key) {
      const cat = data[key];
      if (!cat || !titleEl || !gridEl) return;
      titleEl.textContent = cat.titulo;
      gridEl.innerHTML = cat.items.map((item) => {
        const msg = encodeURIComponent("Hola Natali, quiero consultar por: " + item.nombre);
        return `
          <article class="tienda-modal-item">
            <img src="${escHTML(item.foto)}" alt="${escHTML(item.nombre)}" loading="lazy" decoding="async">
            <h4>${escHTML(item.nombre)}</h4>
            <p>${escHTML(item.precio)}</p>
            <a href="${waBase}${msg}" target="_blank" rel="noopener" class="tienda-modal-cta">Consultar por WhatsApp →</a>
          </article>
        `;
      }).join("");
      modal.hidden = false;
      document.body.classList.add("tienda-modal-open");
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove("tienda-modal-open");
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => openModal(btn.getAttribute("data-tienda-open")));
    });

    $$("[data-tienda-close]", modal).forEach((el) => {
      el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });
  }

  function boot() {
    safe(initSplash, "initSplash");
    safe(initReveals, "initReveals");
    safe(initTiendaModal, "initTiendaModal");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
