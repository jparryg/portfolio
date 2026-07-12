(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  /* ---------------- Nav: scroll shadow + mobile toggle ---------------- */
  function initNav() {
    var nav = $("[data-nav]");
    var toggle = $("[data-nav-toggle]");
    var links = $("[data-nav-links]");
    if (!nav || !toggle || !links) return;

    var mobileQuery = matchMedia("(max-width: 959px)");

    function syncForViewport() {
      if (mobileQuery.matches) {
        if (!links.hasAttribute("data-user-opened")) links.hidden = true;
        toggle.setAttribute("aria-expanded", links.hidden ? "false" : "true");
      } else {
        links.hidden = false;
        toggle.setAttribute("aria-expanded", "false");
      }
    }
    syncForViewport();
    mobileQuery.addEventListener ? mobileQuery.addEventListener("change", syncForViewport) : mobileQuery.addListener(syncForViewport);

    toggle.addEventListener("click", function () {
      var isHidden = links.hidden;
      links.hidden = !isHidden;
      links.setAttribute("data-user-opened", "1");
      toggle.setAttribute("aria-expanded", isHidden ? "true" : "false");
    });

    links.addEventListener("click", function (e) {
      if (e.target.closest("a") && mobileQuery.matches) {
        links.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------- Reveal on scroll ---------------- */
  function initReveals() {
    var targets = $$(".reveal");
    if (!targets.length) return;

    if (typeof IntersectionObserver === "undefined") {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
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

    targets.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      targets.forEach(function (el) {
        if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ---------------- Hero mesh follows mouse (desktop only) ---------------- */
  function initMeshFollow() {
    var mesh = $("[data-mouse-mesh]");
    if (!mesh || !fineHover) return;
    var hero = $(".hero");
    hero.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      mesh.style.setProperty("--mx", x + "%");
      mesh.style.setProperty("--my", y + "%");
    });
  }

  /* ---------------- Hero scrim width: measured, not guessed ----------------
     The scrim panel behind the hero text must never be narrower than the
     text itself. A hardcoded px breakpoint isn't reliable because the
     h1 font-size formula changes non-linearly at 1280px, so the "safe"
     width doesn't scale evenly with viewport width. Measuring the real
     rendered line extents (via Range.getClientRects) sidesteps that
     entirely. Falls back to the CSS default (640px) if this never runs. */
  function initHeroScrimWidth() {
    var inner = $(".hero-inner");
    var h1 = $(".hero-title");
    var sub = $(".hero-sub");
    if (!inner || !h1) return;

    function measure() {
      var innerRect = inner.getBoundingClientRect();
      var maxRight = 0;
      [h1, sub].forEach(function (el) {
        if (!el) return;
        var range = document.createRange();
        range.selectNodeContents(el);
        var rects = range.getClientRects();
        for (var i = 0; i < rects.length; i++) {
          if (rects[i].right > maxRight) maxRight = rects[i].right;
        }
      });
      if (maxRight <= 0) return;
      var safeWidth = Math.ceil(maxRight - innerRect.left) + 40;
      inner.style.setProperty("--hero-scrim-min", safeWidth + "px");
    }

    measure();
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 120);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure).catch(function () {});
    }
  }

  /* ---------------- Magnetic buttons ---------------- */
  function initMagnetic() {
    if (!fineHover) return;
    $$("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate(" + (x * 0.18) + "px, " + (y * 0.35) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------------- Count-up badges (hero + social proof) ---------------- */
  function initCountUp() {
    $$("[data-count-to]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      if (isNaN(target)) return;

      var run = function () {
        var duration = reduced ? 400 : 1400;
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = (target * eased).toFixed(1);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target.toFixed(1);
        }
        requestAnimationFrame(step);
      };

      if (typeof IntersectionObserver === "undefined") { run(); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { run(); io.disconnect(); }
        });
      }, { threshold: 0.05 });
      io.observe(el);
    });
  }

  /* ---------------- Card tilt (fine pointer only) ---------------- */
  function initTilt() {
    if (!fineHover) return;
    $$(".mode-card, .service-card, .testimonial-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "perspective(800px) rotateX(" + (py * -4) + "deg) rotateY(" + (px * 4) + "deg) translateY(-2px)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------------- Smooth anchor scroll (native) ---------------- */
  function initAnchorScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navOffset = 90;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ---------------- Footer year ---------------- */
  function initFooterYear() {
    var el = $("[data-year]");
    if (!el) return;
    el.textContent = new Date().getFullYear();
  }

  /* ---------------- GSAP scroll parallax on hero (optional enrichment) ---------------- */
  function initHeroParallax() {
    if (reduced) return;
    var img = $(".hero-bg img");
    if (!img || !window.gsap || !window.ScrollTrigger) return;
    gsap.to(img, {
      yPercent: 12,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 }
    });
  }

  function boot() {
    safe(initNav, "initNav");
    safe(initReveals, "initReveals");
    safe(initHeroScrimWidth, "initHeroScrimWidth");
    safe(initMeshFollow, "initMeshFollow");
    safe(initMagnetic, "initMagnetic");
    safe(initCountUp, "initCountUp");
    safe(initTilt, "initTilt");
    safe(initAnchorScroll, "initAnchorScroll");
    safe(initFooterYear, "initFooterYear");

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
