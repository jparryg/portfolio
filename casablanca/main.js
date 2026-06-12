(function () {
  "use strict";

  /* ── Helpers ───────────────────────────────────────────────── */
  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const escHTML = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  /* ── Nav scroll ────────────────────────────────────────────── */
  function initNav() {
    const nav = $("#nav");
    if (!nav) return;

    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Burger menu
    const burger = $(".nav-burger");
    const mobile = $(".nav-mobile");
    if (!burger || !mobile) return;

    burger.addEventListener("click", () => {
      const isOpen = mobile.classList.toggle("is-open");
      burger.classList.toggle("is-open", isOpen);
      burger.setAttribute("aria-expanded", String(isOpen));
      mobile.setAttribute("aria-hidden", String(!isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Cerrar al hacer click en un link del menú mobile
    $$("a", mobile).forEach(a => {
      a.addEventListener("click", () => {
        mobile.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        mobile.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      });
    });
  }

  /* ── Scroll suave para anclas ──────────────────────────────── */
  function initAnchorScroll() {
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  }

  /* ── Reveals con IntersectionObserver ──────────────────────── */
  function initReveals() {
    const els = $$(".reveal");
    if (!els.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.04, rootMargin: "0px 0px -40px 0px" });

    els.forEach((el, i) => {
      // Safety timeout 6s — si IO falla, mostrar igual
      setTimeout(() => el.classList.add("is-visible"), 6000 + i * 50);
      observer.observe(el);
    });
  }

  /* ── Tilt 3D en cards ──────────────────────────────────────── */
  function initTilt() {
    if (!fineHover) return; // no en touch
    const cards = $$("[data-tilt]");
    if (!cards.length) return;

    const MAX_TILT = 7;

    cards.forEach(card => {
      card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rotX = -y * MAX_TILT;
        const rotY = x * MAX_TILT;
        card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.025)`;
        card.style.transition = "transform 0.08s linear";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
        card.style.transition = "transform 0.45s cubic-bezier(0.16,1,0.3,1)";
      });
    });
  }

  /* ── Hero parallax suave (GSAP) ────────────────────────────── */
  function initHeroParallax() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (reduced) return;

    const heroBg = $(".hero-bg img");
    if (!heroBg) return;

    gsap.to(heroBg, {
      yPercent: 18,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }

  /* ── Contador de estrellas / rating animado ─────────────────── */
  function initCounters() {
    // Solo animamos si GSAP disponible
    if (!window.gsap) return;
    $$("[data-count-to]").forEach(el => {
      const target = parseFloat(el.dataset.countTo);
      gsap.from(el, {
        textContent: 0,
        duration: 1.5,
        delay: 0.5,
        ease: "power2.out",
        snap: { textContent: target < 10 ? 0.1 : 1 },
        scrollTrigger: { trigger: el, start: "top 90%" }
      });
    });
  }

  /* ── Stagger reveal para grupos de cards ────────────────────── */
  function initCardStagger() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (reduced) return;

    [".platos-grid .plato-card", ".habitaciones-grid .hab-card", ".testimonios-track .testimonio-card"].forEach(sel => {
      const cards = $$(sel);
      if (!cards.length) return;
      gsap.fromTo(cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cards[0].closest("section") || cards[0],
            start: "top 75%"
          }
        }
      );
      // Quitar la clase reveal para que GSAP tome control
      cards.forEach(c => c.classList.remove("reveal"));
    });
  }

  /* ── Boot ───────────────────────────────────────────────────── */
  function boot() {
    safe(initNav, "initNav");
    safe(initAnchorScroll, "initAnchorScroll");
    safe(initReveals, "initReveals");
    safe(initTilt, "initTilt");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initHeroParallax, "initHeroParallax");
      safe(initCounters, "initCounters");
      safe(initCardStagger, "initCardStagger");
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
