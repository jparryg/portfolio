(function () {
  "use strict";

  /* ── safe wrapper: un init roto no rompe el resto ── */
  function safe(fn, name) {
    try { fn(); }
    catch (e) { console.warn("[CO9.8] " + name + " failed:", e); }
  }

  /* ── Splash ── */
  function initSplash() {
    var splash = document.querySelector("[data-splash]");
    if (!splash) return;
    function hide() { splash.classList.add("is-out"); }
    if (document.readyState === "complete") {
      setTimeout(hide, 650);
    } else {
      window.addEventListener("load", function () { setTimeout(hide, 450); });
    }
    setTimeout(hide, 3800); // safety
  }

  /* ── Nav scroll ── */
  function initNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    function tick() { nav.classList.toggle("is-scrolled", window.scrollY > 40); }
    window.addEventListener("scroll", tick, { passive: true });
    tick();
  }

  /* ── Mobile nav ── */
  function initMobileNav() {
    var burger = document.querySelector(".nav-burger");
    var menu   = document.getElementById("nav-mobile");
    if (!burger || !menu) return;

    function open()  { burger.setAttribute("aria-expanded","true");  menu.hidden = false; document.body.style.overflow = "hidden"; }
    function close() { burger.setAttribute("aria-expanded","false"); menu.hidden = true;  document.body.style.overflow = ""; }

    burger.addEventListener("click", function () {
      burger.getAttribute("aria-expanded") === "true" ? close() : open();
    });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ── Smooth scroll anchors ── */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 80,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ── Reveal on scroll (IntersectionObserver) ── */
  function initReveals() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length || typeof IntersectionObserver === "undefined") {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.04, rootMargin: "0px 0px -2% 0px" });

    items.forEach(function (el) { io.observe(el); });

    /* Safety: force-reveal ALL hidden elements after 1.5s — no viewport check */
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
        el.classList.add("is-visible");
      });
    }, 1500);
  }

  /* ── Card tilt (only on hover-capable devices) ── */
  function initTilt() {
    if (window.matchMedia("(hover: none)").matches) return;

    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      function onMove(e) {
        var r  = card.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
        var dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
        card.style.transform = "perspective(600px) rotateX(" + (dy * -3.5) + "deg) rotateY(" + (dx * 3.5) + "deg) scale(1.02)";
      }
      function onEnter() {
        card.style.transition = "transform .1s";
        card.addEventListener("mousemove", onMove);
      }
      function onLeave() {
        card.style.transition = "transform .45s cubic-bezier(0.16,1,0.3,1)";
        card.removeEventListener("mousemove", onMove);
        card.style.transform = "";
      }
      card.addEventListener("mouseover", function (e) { if (!card.contains(e.relatedTarget)) onEnter(); });
      card.addEventListener("mouseout",  function (e) { if (!card.contains(e.relatedTarget)) onLeave(); });
    });
  }

  /* ── Custom cursor ── */
  function initCursor() {
    if (window.matchMedia("(hover: none)").matches) return;
    var cursor = document.querySelector(".cursor");
    var dot    = document.querySelector(".cursor-dot");
    var ring   = document.querySelector(".cursor-ring");
    if (!cursor || !dot || !ring) return;

    var dx = 0, dy = 0, rx = 0, ry = 0, firstMove = false;

    window.addEventListener("mousemove", function (e) {
      dx = e.clientX; dy = e.clientY;
      dot.style.transform = "translate3d(" + dx + "px," + dy + "px,0) translate(-50%,-50%)";
      if (!firstMove) {
        firstMove = true; rx = dx; ry = dy;
        ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0) translate(-50%,-50%)";
        cursor.classList.add("is-ready");
      }
    });

    /* Separate rAF for ring smoothing */
    (function loop() {
      rx += (dx - rx) * 0.11;
      ry += (dy - ry) * 0.11;
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();

    /* Expand ring on interactive elements */
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest("a, button")) cursor.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest("a, button")) cursor.classList.remove("is-hover");
    });
  }

  /* ── Count-up numbers ── */
  function initCountUp() {
    var items = document.querySelectorAll("[data-count-to]");
    if (!items.length || typeof IntersectionObserver === "undefined") return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el     = e.target;
        var raw    = el.getAttribute("data-count-to");
        if (!raw || raw.indexOf("[") !== -1) return; // skip placeholder
        var target = parseFloat(raw);
        var suffix = el.getAttribute("data-count-suffix") || "";
        var dur    = 1400;
        var t0     = performance.now();
        (function tick(now) {
          var p   = Math.min((now - t0) / dur, 1);
          var ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(ease * target) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
        io.unobserve(el);
      });
    }, { threshold: 0.04, rootMargin: "0px 0px -2% 0px" });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ── GSAP ScrollTrigger: parallax on hero ── */
  function initScrollTrigger() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(".hero-bg img", {
      yPercent: 14,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }

  /* ── Boot ── */
  function boot() {
    safe(initSplash,        "initSplash");
    safe(initNav,           "initNav");
    safe(initMobileNav,     "initMobileNav");
    safe(initSmoothScroll,  "initSmoothScroll");
    safe(initReveals,       "initReveals");
    safe(initTilt,          "initTilt");
    safe(initCursor,        "initCursor");
    safe(initCountUp,       "initCountUp");
    safe(initScrollTrigger, "initScrollTrigger");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
