/* ═══════════════════════════════════════════════════════
   FONSECA ABOGADOS LLC — main.js
   Archetype 09: Newspaper Editorial  |  v=20260603
   ═══════════════════════════════════════════════════════ */
(function () {
  "use strict";

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[Fonseca:" + name + "]", e); }
  }

  /* ══════════════════════════════════════
     Scroll Reveal — IntersectionObserver
     Threshold ≤ 0.05 + 6s safety net
     ══════════════════════════════════════ */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.04, rootMargin: "0px 0px -2% 0px" });

    els.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight + 100) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ══════════════════════════════════════
     Animated counters
     ══════════════════════════════════════ */
  function initCounters() {
    var counters = document.querySelectorAll(".counter[data-target]");
    if (!counters.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        runCounter(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.3 });

    counters.forEach(function (el) { io.observe(el); });
  }

  function runCounter(el) {
    var target   = parseInt(el.getAttribute("data-target"), 10);
    var duration = 1800;
    var start    = null;

    function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.floor(ease(p) * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  /* ══════════════════════════════════════
     Nav hide/show on scroll
     ══════════════════════════════════════ */
  function initNav() {
    var header = document.getElementById("masthead");
    if (!header) return;

    var lastY   = 0;
    var ticking = false;

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y > 100) {
          if (y > lastY) header.classList.add("is-hidden");
          else            header.classList.remove("is-hidden");
        } else {
          header.classList.remove("is-hidden");
        }
        lastY   = y;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ══════════════════════════════════════
     Smooth anchor scroll
     ══════════════════════════════════════ */
  function initSmoothScroll() {
    var header = document.getElementById("masthead");
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var tgt = document.querySelector(id);
      if (!tgt) return;
      e.preventDefault();
      var offset  = header ? header.offsetHeight + 8 : 80;
      var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        top:      tgt.getBoundingClientRect().top + window.scrollY - offset,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ══════════════════════════════════════
     3D tilt on cards (hover devices only)
     ══════════════════════════════════════ */
  function initTilt() {
    if (matchMedia("(hover: none)").matches) return;

    var cards = document.querySelectorAll(".svc-card, .pub-card");
    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x    = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
        var y    = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
        card.style.transform = "perspective(700px) rotateY(" + (x * 4) + "deg) rotateX(" + (-y * 4) + "deg) translateY(-3px)";
        card.style.zIndex    = "3";
        card.style.transition = "transform .1s ease";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform  = "";
        card.style.zIndex     = "";
        card.style.transition = "transform .4s ease";
      });
    });
  }

  /* ══════════════════════════════════════
     Contact form submit → success state
     ══════════════════════════════════════ */
  function initForm() {
    var form = document.getElementById("contactForm");
    var btn  = document.getElementById("submitBtn");
    if (!form || !btn) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      btn.classList.add("is-sent");
      btn.disabled = true;

      setTimeout(function () {
        btn.classList.remove("is-sent");
        btn.disabled = false;
        form.reset();
      }, 4000);
    });
  }

  /* ══════════════════════════════════════
     Copyright year
     ══════════════════════════════════════ */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ══════════════════════════════════════
     GSAP polish (non-critical)
     ══════════════════════════════════════ */
  function initGSAP() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    var heroTitle = document.querySelector(".hero-title");
    if (heroTitle) {
      gsap.from(heroTitle, {
        opacity: 0, y: 28,
        duration: .85, ease: "power3.out", delay: .15
      });
    }

    var jurisList = document.querySelector(".juris-list");
    if (jurisList) {
      gsap.from(jurisList, {
        scrollTrigger: { trigger: jurisList, start: "top 82%" },
        opacity: 0, x: -24, duration: .75, ease: "power2.out"
      });
    }
  }

  /* ══════════════════════════════════════
     Boot
     ══════════════════════════════════════ */
  function boot() {
    safe(initReveal,       "initReveal");
    safe(initCounters,     "initCounters");
    safe(initNav,          "initNav");
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initTilt,         "initTilt");
    safe(initForm,         "initForm");
    safe(initYear,         "initYear");
    safe(initGSAP,         "initGSAP");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
