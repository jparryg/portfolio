/* ============================================================
   KOONSULT — main.js v20260608
   IIFE pattern — no ES modules — no npm
   ============================================================ */
(function () {
  "use strict";

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  function boot() {
    safe(initSplash,       "initSplash");
    safe(initNav,          "initNav");
    safe(initReveal,       "initReveal");
    safe(initCounters,     "initCounters");
    safe(initTestimonials, "initTestimonials");
    safe(initForm,         "initForm");
    safe(initScrollAnimations, "initScrollAnimations");
    safe(initClientLogos, "initClientLogos");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* ── SPLASH ──────────────────────────────────────────── */
  function initSplash() {
    var splash = document.getElementById("splash");
    if (!splash) return;
    setTimeout(function () {
      splash.style.opacity = "0";
      splash.style.pointerEvents = "none";
      setTimeout(function () { splash.style.display = "none"; }, 500);
    }, 2100);
  }

  /* ── NAV ─────────────────────────────────────────────── */
  function initNav() {
    var nav = document.getElementById("nav");
    var hamburger = document.getElementById("navHamburger");
    var navLinks = document.getElementById("navLinks");
    if (!nav) return;

    window.addEventListener("scroll", function () {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    }, { passive: true });

    if (hamburger && navLinks) {
      hamburger.addEventListener("click", function () {
        navLinks.classList.toggle("open");
        hamburger.setAttribute("aria-expanded", navLinks.classList.contains("open"));
      });
      navLinks.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { navLinks.classList.remove("open"); });
      });
    }

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

  /* ── REVEAL ON SCROLL ────────────────────────────────── */
  function initReveal() {
    var els = document.querySelectorAll(".reveal:not([data-split])");
    if (!els.length) return;

    // Safety: activar todo a los 800ms si el observer no dispara
    setTimeout(function () {
      els.forEach(function (el) { el.classList.add("is-visible"); });
    }, 800);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    els.forEach(function (el) {
      var siblings = el.parentElement ? el.parentElement.querySelectorAll(".reveal") : [];
      var idx = Array.from(siblings).indexOf(el);
      if (idx > 0) el.style.transitionDelay = (idx * 0.08) + "s";
      observer.observe(el);
    });
  }

  /* ── COUNTERS ────────────────────────────────────────── */
  function initCounters() {
    var counters = document.querySelectorAll("[data-count-to]");
    if (!counters.length) return;

    // Safety: mostrar valores finales si el observer no dispara en 2s
    var safetyTimer = setTimeout(function () {
      counters.forEach(function (el) {
        el.textContent = el.getAttribute("data-count-to");
      });
    }, 2000);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        clearTimeout(safetyTimer);
        var el = entry.target;
        var target = parseInt(el.getAttribute("data-count-to"), 10);
        var duration = 1600;
        var start = performance.now();

        function tick(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          var ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(ease * target);
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }

        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    }, { threshold: 0.05 }); // ← bajado de 0.3 a 0.05

    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ── TESTIMONIALS SLIDER ─────────────────────────────── */
  function initTestimonials() {
    var cards = document.querySelectorAll(".testimonial-card");
    var dots = document.querySelectorAll(".t-dot");
    var prev = document.getElementById("tPrev");
    var next = document.getElementById("tNext");
    if (!cards.length) return;

    var current = 0;
    var autoInterval = null;

    function goTo(idx) {
      cards[current].classList.remove("active");
      dots[current] && dots[current].classList.remove("active");
      current = (idx + cards.length) % cards.length;
      cards[current].classList.add("active");
      dots[current] && dots[current].classList.add("active");
    }

    function startAuto() {
      stopAuto();
      autoInterval = setInterval(function () { goTo(current + 1); }, 5500);
    }

    function stopAuto() {
      if (autoInterval) clearInterval(autoInterval);
    }

    // Touch/swipe support
    var touchStartX = 0;
    var slider = document.querySelector(".testimonials-slider");
    if (slider) {
      slider.addEventListener("touchstart", function (e) {
        touchStartX = e.changedTouches[0].clientX;
      }, { passive: true });
      slider.addEventListener("touchend", function (e) {
        var diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          goTo(diff > 0 ? current + 1 : current - 1);
          startAuto();
        }
      }, { passive: true });
    }

    if (prev) prev.addEventListener("click", function () { goTo(current - 1); startAuto(); });
    if (next) next.addEventListener("click", function () { goTo(current + 1); startAuto(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { goTo(i); startAuto(); });
    });

    startAuto();
  }

  /* ── CONTACT FORM ────────────────────────────────────── */
  function initForm() {
    var form = document.getElementById("contactForm");
    var submitBtn = document.getElementById("submitBtn");
    var successEl = document.getElementById("formSuccess");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      submitBtn.classList.add("is-sending");
      submitBtn.disabled = true;
      setTimeout(function () {
        form.style.display = "none";
        successEl.classList.add("visible");
      }, 1800);
    });
  }

  /* ── GSAP SCROLL ANIMATIONS ──────────────────────────── */
  function initScrollAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    var diffCards = document.querySelectorAll(".diff-card");
    if (diffCards.length) {
      gsap.from(diffCards, {
        opacity: 0, y: 30, stagger: 0.15, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: ".diff-card-stack", start: "top 80%", once: true }
      });
    }

    // Stats: NO animar con GSAP — el CSS ya las muestra con opacity:1 !important
    // y los counters del JS se encargan de la animación numérica
  }

  /* ── CLIENT LOGOS SLIDER ─────────────────────────────── */
  function initClientLogos() {
    var track = document.getElementById("clTrack");
    var prev = document.getElementById("clPrev");
    var next = document.getElementById("clNext");
    if (!track) return;

    var slides = track.querySelectorAll(".cl-slide");
    var total = slides.length / 2;
    var current = 0;
    var slideW = 0;
    var gap = 48;

    function calcSlideW() {
      var wrap = track.parentElement;
      var cols = window.innerWidth <= 480 ? 1 : window.innerWidth <= 768 ? 2 : 4;
      slideW = (wrap.offsetWidth - gap * (cols - 1)) / cols;
      slides.forEach(function (s) { s.style.flex = "0 0 " + slideW + "px"; });
    }

    function goTo(idx) {
      current = ((idx % total) + total) % total;
      track.style.transform = "translateX(-" + (current * (slideW + gap)) + "px)";
    }

    calcSlideW();
    window.addEventListener("resize", function () { calcSlideW(); goTo(current); });

    // Touch/swipe
    var touchStartX = 0;
    track.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    track.addEventListener("touchend", function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });

    if (prev) prev.addEventListener("click", function () { goTo(current - 1); });
    if (next) next.addEventListener("click", function () { goTo(current + 1); });

    setInterval(function () { goTo(current + 1); }, 3500);
  }

})();
