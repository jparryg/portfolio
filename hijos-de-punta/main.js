(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ---------------------------------------------------------------
     Nav: scroll state + mobile menu
     --------------------------------------------------------------- */
  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;

    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = $("[data-nav-toggle]");
    var mobile = $("[data-nav-mobile]");
    if (!toggle || !mobile) return;

    var closeMobile = function () {
      mobile.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    };
    var openMobile = function () {
      mobile.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
    };

    toggle.addEventListener("click", function () {
      if (mobile.hidden) openMobile(); else closeMobile();
    });

    $$("a", mobile).forEach(function (a) {
      a.addEventListener("click", closeMobile);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 960 && !mobile.hidden) closeMobile();
    });
  }

  /* ---------------------------------------------------------------
     Smooth anchor scroll (native, offset for fixed nav)
     --------------------------------------------------------------- */
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navOffset = 100;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ---------------------------------------------------------------
     Custom cursor — two circles, hidden until first mousemove
     --------------------------------------------------------------- */
  function initCursor() {
    if (!fineHover) return;
    var cursor = $("[data-cursor]");
    var dot = $(".cursor-dot", cursor);
    var ring = $(".cursor-ring", cursor);
    if (!cursor || !dot || !ring) return;

    var ringX = 0, ringY = 0, mouseX = 0, mouseY = 0, firstMove = false;

    window.addEventListener("mousemove", function (e) {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.transform = "translate3d(" + mouseX + "px," + mouseY + "px,0)";
      if (!firstMove) {
        firstMove = true;
        ringX = mouseX; ringY = mouseY;
        ring.style.transform = "translate3d(" + ringX + "px," + ringY + "px,0)";
        cursor.classList.add("is-ready");
      }
    });

    var hoverables = "a, button, .dish-card, .ambiente-item";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(hoverables)) cursor.classList.add("is-active");
    });
    document.addEventListener("mouseout", function (e) {
      var related = e.relatedTarget;
      if (e.target.closest && e.target.closest(hoverables) && !(related && related.closest && related.closest(hoverables))) {
        cursor.classList.remove("is-active");
      }
    });

    function raf() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = "translate3d(" + ringX + "px," + ringY + "px,0)";
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* ---------------------------------------------------------------
     Bento tilt + halo on dish / ambiente cards
     --------------------------------------------------------------- */
  function initTilt() {
    if (!fineHover) return;
    var cards = $$("[data-tilt]");
    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rx = (px - 0.5) * 10;
        var ry = (0.5 - py) * 8;
        card.style.setProperty("--rx", rx.toFixed(2) + "deg");
        card.style.setProperty("--ry", ry.toFixed(2) + "deg");
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      });
      card.addEventListener("mouseover", function (e) {
        if (!card.contains(e.relatedTarget)) card.classList.add("is-hovering");
      });
      card.addEventListener("mouseout", function (e) {
        if (!card.contains(e.relatedTarget)) {
          card.classList.remove("is-hovering");
          card.style.setProperty("--rx", "0deg");
          card.style.setProperty("--ry", "0deg");
        }
      });
    });
  }

  /* ---------------------------------------------------------------
     Reveal on scroll — IntersectionObserver + 6s safety fallback
     --------------------------------------------------------------- */
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
    }, { threshold: 0.02, rootMargin: "0px 0px -2% 0px" });

    targets.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 6000);
  }

  /* ---------------------------------------------------------------
     Footer year
     --------------------------------------------------------------- */
  function initYear() {
    var el = $("[data-year]");
    if (!el) return;
    el.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------------
     Boot
     --------------------------------------------------------------- */
  function boot() {
    safe(initNav, "initNav");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initCursor, "initCursor");
    safe(initTilt, "initTilt");
    safe(initReveals, "initReveals");
    safe(initYear, "initYear");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
