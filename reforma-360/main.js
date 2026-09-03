(function () {
  "use strict";

  const data = window.__BRAND__ || {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const escHTML = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ---------- Mounts (idempotent) ---------- */

  function mountServices() {
    const target = $("[data-services]");
    if (!target || target.children.length > 0 || !data.services) return;
    target.innerHTML = data.services.map(s => `
      <article class="service-card reveal" data-tilt>
        <div class="service-media"><img src="${escHTML(s.photo)}" alt="${escHTML(s.title)} — Reforma 360" loading="lazy" decoding="async"></div>
        <div class="service-card-body">
          <h3>${escHTML(s.title)}</h3>
          <ul class="service-list">
            ${s.items.map(i => `<li>${escHTML(i)}</li>`).join("")}
          </ul>
        </div>
      </article>
    `).join("");
  }

  function mountReasons() {
    const target = $("[data-reasons]");
    if (!target || target.children.length > 0 || !data.reasons) return;
    target.innerHTML = data.reasons.map((r, idx) => `
      <div class="why-reason">
        <span class="why-reason-num">0${idx + 1}</span>
        <div>
          <h4>${escHTML(r.title)}</h4>
          <p>${escHTML(r.desc)}</p>
        </div>
      </div>
    `).join("");
  }

  function mountShowcase() {
    const target = $("[data-showcase]");
    if (!target || target.children.length > 0 || !data.gallery) return;
    target.innerHTML = data.gallery.map((src, idx) => `
      <div class="showcase-card">
        <img src="${escHTML(src)}" alt="Proyecto de remodelación Reforma 360 — obra ${idx + 1}" loading="lazy" decoding="async">
        <span class="showcase-card-tag">Obra ${String(idx + 1).padStart(2, "0")}</span>
      </div>
    `).join("");
  }

  function mountWhatsappLinks() {
    const wa = data.whatsapp;
    if (!wa) return;
    $$("[data-whatsapp-link]").forEach(el => {
      const msg = el.getAttribute("data-whatsapp-msg") || "Hola, vi la web de Reforma 360 y quiero cotizar un proyecto.";
      el.href = `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
    });
    $$("[data-whatsapp-display]").forEach(el => { el.textContent = data.whatsappDisplay || wa; });
  }

  /* ---------- Splash ---------- */

  function initSplash() {
    const splash = $(".splash");
    if (!splash) return;
    const hide = () => splash.classList.add("is-hidden");
    window.addEventListener("load", () => setTimeout(hide, 550));
    setTimeout(hide, 4600); // red de seguridad JS, además de la animación CSS de 4.5s
  }

  /* ---------- Nav ---------- */

  function initNav() {
    const nav = $(".nav");
    const burger = $(".nav-burger");
    const mobile = $(".nav-mobile");
    if (!nav) return;

    const onScroll = () => {
      if (window.scrollY > 30) nav.classList.add("is-solid");
      else nav.classList.remove("is-solid");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (burger && mobile) {
      burger.addEventListener("click", () => {
        const open = burger.getAttribute("aria-expanded") === "true";
        burger.setAttribute("aria-expanded", String(!open));
        mobile.classList.toggle("is-open", !open);
        document.documentElement.style.overflow = !open ? "hidden" : "";
      });
      $$("a", mobile).forEach(a => a.addEventListener("click", () => {
        burger.setAttribute("aria-expanded", "false");
        mobile.classList.remove("is-open");
        document.documentElement.style.overflow = "";
      }));
    }
  }

  /* ---------- Anchor smooth scroll (sin Lenis — scroll nativo) ---------- */

  function initAnchors() {
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const navH = 76;
      const top = el.getBoundingClientRect().top + window.scrollY - (navH - 8);
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Reveals (IntersectionObserver) ---------- */

  function initReveals() {
    const targets = $$(".reveal");
    if (!targets.length) return;
    if (typeof IntersectionObserver === "undefined") {
      targets.forEach(el => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(el => io.observe(el));

    // Red de seguridad: si algo se queda oculto, forzar visibilidad a los 6s
    setTimeout(() => {
      $$(".reveal:not(.is-visible)").forEach(el => el.classList.add("is-visible"));
    }, 6000);
  }

  /* ---------- Tilt en cards ---------- */

  function initTilt() {
    if (!fineHover) return;
    const cards = $$("[data-tilt]");
    cards.forEach(card => {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = "1";

      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", px + "%");
        card.style.setProperty("--my", py + "%");
        const rx = ((py - 50) / 50) * -5;
        const ry = ((px - 50) / 50) * 5;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
      };
      const onLeave = () => { card.style.transform = ""; };

      card.addEventListener("mouseover", (e) => { if (!card.contains(e.relatedTarget)) card.addEventListener("mousemove", onMove); });
      card.addEventListener("mouseout", (e) => {
        if (!card.contains(e.relatedTarget)) { card.removeEventListener("mousemove", onMove); onLeave(); }
      });
    });
  }

  /* NOTA: eliminado a propósito un handler de "wheel" que secuestraba el scroll
     vertical dentro de la galería horizontal. Atrapaba al usuario en la sección
     y rompía el scroll de página (gotcha: nunca interceptar wheel vertical sobre
     un carrusel horizontal salvo con trackpad shift+scroll real). El scroll
     horizontal nativo (drag, trackpad, scrollbar) ya funciona sin JS. */

  /* ---------- Hero mesh parallax sutil ---------- */

  function initHeroParallax() {
    if (reduced) return;
    const bg = $(".hero-bg img");
    if (!bg || !window.gsap) return;
    gsap.to(bg, {
      yPercent: 12,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
  }

  /* ---------- Contador (count-up) ---------- */

  function initCountUp() {
    const targets = $$("[data-count-to]");
    if (!targets.length) return;

    const animate = (el) => {
      const target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
      if (reduced) { el.textContent = String(target); return; } // reduced-motion: instant, no lo desactivamos, solo lo aceleramos
      el.textContent = "0";
      if (window.gsap) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.3,
          ease: "power2.out",
          onUpdate: () => { el.textContent = String(Math.round(obj.val)); }
        });
      } else {
        const start = performance.now();
        const dur = 1100;
        const step = (t) => {
          const p = Math.min((t - start) / dur, 1);
          el.textContent = String(Math.round(target * p));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    };

    if (typeof IntersectionObserver === "undefined") {
      targets.forEach(el => { el.textContent = el.getAttribute("data-count-to"); });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    targets.forEach(el => io.observe(el));

    // Red de seguridad: si algo no disparó a los 6s, fijar el valor final
    setTimeout(() => {
      targets.forEach(el => {
        if (el.textContent === "0") el.textContent = el.getAttribute("data-count-to");
      });
    }, 6000);
  }

  /* ---------- Boot ---------- */

  function boot() {
    safe(mountServices, "mountServices");
    safe(mountReasons, "mountReasons");
    safe(mountShowcase, "mountShowcase");
    safe(mountWhatsappLinks, "mountWhatsappLinks");

    safe(initSplash, "initSplash");
    safe(initNav, "initNav");
    safe(initAnchors, "initAnchors");
    safe(initReveals, "initReveals");
    safe(initTilt, "initTilt");
    safe(initCountUp, "initCountUp");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initHeroParallax, "initHeroParallax");
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
