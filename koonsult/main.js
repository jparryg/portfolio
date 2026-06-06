/* ============================================================
   KOONSULT — main.js v20260605
   IIFE pattern — no ES modules — no npm
   ============================================================ */
(function () {
  "use strict";

  /* ── SAFE WRAPPER ────────────────────────────────────── */
  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ── BOOT ────────────────────────────────────────────── */
  function boot() {
    safe(initSplash,       "initSplash");
    safe(initNav,          "initNav");
    safe(initReveal,       "initReveal");
    safe(initCounters,     "initCounters");
    safe(initTestimonials, "initTestimonials");
    safe(initForm,         "initForm");
    safe(initScrollAnimations, "initScrollAnimations");
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
    // CSS handles animation at 1.8s; JS as safety net
    setTimeout(function () {
      splash.style.opacity = "0";
      splash.style.pointerEvents = "none";
      setTimeout(function () {
        splash.style.display = "none";
      }, 500);
    }, 2100);
  }

  /* ── NAV ─────────────────────────────────────────────── */
  function initNav() {
    var nav = document.getElementById("nav");
    var hamburger = document.getElementById("navHamburger");
    var navLinks = document.getElementById("navLinks");

    if (!nav) return;

    // Scroll solidify
    window.addEventListener("scroll", function () {
      if (window.scrollY > 40) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    }, { passive: true });

    // Hamburger
    if (hamburger && navLinks) {
      hamburger.addEventListener("click", function () {
        navLinks.classList.toggle("open");
        var isOpen = navLinks.classList.contains("open");
        hamburger.setAttribute("aria-expanded", isOpen);
      });

      // Close on link click
      navLinks.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          navLinks.classList.remove("open");
        });
      });
    }

    // Smooth scroll for anchors (Lenis fallback)
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = 80;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  }

  /* ── REVEAL ON SCROLL ────────────────────────────────── */
  function initReveal() {
    var els = document.querySelectorAll(".reveal:not([data-split])");
    if (!els.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });

    // 6s safety timeout
    var safetyTimer = setTimeout(function () {
      els.forEach(function (el) { el.classList.add("is-visible"); });
    }, 6000);

    els.forEach(function (el) {
      // Stagger siblings
      var siblings = el.parentElement ? el.parentElement.querySelectorAll(".reveal") : [];
      var idx = Array.from(siblings).indexOf(el);
      if (idx > 0) {
        el.style.transitionDelay = (idx * 0.08) + "s";
      }
      observer.observe(el);
    });
  }

  /* ── COUNTERS ────────────────────────────────────────── */
  function initCounters() {
    var counters = document.querySelectorAll("[data-count-to]");
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute("data-count-to"), 10);
        var duration = 1600;
        var start = performance.now();

        function tick(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          var ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
          el.textContent = Math.round(ease * target);
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }

        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    }, { threshold: 0.3 });

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
      dots[current].classList.remove("active");
      current = (idx + cards.length) % cards.length;
      cards[current].classList.add("active");
      dots[current].classList.add("active");
    }

    function startAuto() {
      stopAuto();
      autoInterval = setInterval(function () { goTo(current + 1); }, 5500);
    }

    function stopAuto() {
      if (autoInterval) clearInterval(autoInterval);
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

      // Simulate submit — replace with real endpoint if needed
      setTimeout(function () {
        form.style.display = "none";
        successEl.classList.add("visible");
      }, 1800);
    });
  }

  /* ── GSAP SCROLL ANIMATIONS ──────────────────────────── */
  function initScrollAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      // GSAP not loaded — falls back to CSS reveal above
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Service cards stagger
    var serviceCards = document.querySelectorAll(".service-card");
    if (serviceCards.length) {
      gsap.from(serviceCards, {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".services-grid",
          start: "top 85%",
          once: true
        }
      });
      // Override reveal opacity for cards handled by GSAP
      serviceCards.forEach(function (c) { c.style.opacity = ""; c.style.transform = ""; });
    }

    // Diff cards
    var diffCards = document.querySelectorAll(".diff-card");
    if (diffCards.length) {
      gsap.from(diffCards, {
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".diff-card-stack",
          start: "top 80%",
          once: true
        }
      });
    }

    // Stats
    var stats = document.querySelectorAll(".stat");
    if (stats.length) {
      gsap.from(stats, {
        opacity: 0,
        y: 20,
        stagger: 0.12,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".stats-grid",
          start: "top 85%",
          once: true
        }
      });
    }
  }

})();
