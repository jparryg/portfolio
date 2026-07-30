(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function $(sel, scope) { return (scope || document).querySelector(sel); }
  function $$(sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); }
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  /* ---------------- Cursor ---------------- */
  function initCursor() {
    var root = $("[data-cursor-root]");
    if (!root || !fineHover) return;
    document.documentElement.classList.add("has-cursor");
    var ring = root.querySelector(".cursor-ring");
    var dot = root.querySelector(".cursor-dot");
    var tx = 0, ty = 0, rx = 0, ry = 0, firstMove = false;

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (dot) dot.style.transform = "translate3d(" + tx + "px," + ty + "px,0)";
      if (!firstMove) {
        firstMove = true;
        rx = tx; ry = ty;
        if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
        root.classList.add("is-ready");
      }
    }, { passive: true });

    function tick() {
      rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
      if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    var HOVERABLES = "[data-cursor], .dish-card, .btn, a[href]";
    document.addEventListener("mouseover", function (e) { if (e.target.closest(HOVERABLES)) root.classList.add("is-interactive"); });
    document.addEventListener("mouseout", function (e) {
      var related = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest(HOVERABLES) : null;
      if (e.target.closest(HOVERABLES) && !related) root.classList.remove("is-interactive");
    });
  }

  /* ---------------- Nav ---------------- */
  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;
    var onScroll = function () {
      if (scrollY > 40) nav.classList.add("is-scrolled"); else nav.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initNavMobile() {
    var burger = $("[data-nav-burger]");
    var menu = $("[data-nav-mobile]");
    if (!burger || !menu) return;

    function close() {
      burger.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      menu.hidden = true;
    }
    function open() {
      burger.setAttribute("aria-expanded", "true");
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add("is-open"); });
    }
    burger.addEventListener("click", function () {
      var isOpen = burger.getAttribute("aria-expanded") === "true";
      if (isOpen) close(); else open();
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", close); });
  }

  /* ---------------- Smooth anchors ---------------- */
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navH = 100; // must track --nav-h in styles.css
      var top = el.getBoundingClientRect().top + scrollY - navH;
      window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!els.length) return;

    // Forcing a reveal also has to un-stick any lazy <img> inside it: if the
    // IntersectionObserver-driven path stalled, native loading="lazy" (which
    // relies on the same viewport-intersection machinery) is stalled too.
    // Flipping loading to "eager" on an <img> that hasn't started loading yet
    // makes the browser fetch it immediately, regardless of why the lazy
    // heuristic never fired.
    function forceReveal(el) {
      if (el.classList.contains("is-revealed")) return;
      el.classList.add("is-revealed");
      $$('img[loading="lazy"]', el).forEach(function (img) {
        if (!img.complete) img.loading = "eager";
      });
    }

    if (!("IntersectionObserver" in window)) {
      els.forEach(forceReveal);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          forceReveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });

    els.forEach(function (el) { io.observe(el); });

    // Safety net #1 — one-shot check at 6s (required baseline per skill rules).
    setTimeout(function () {
      $$("[data-reveal]:not(.is-revealed)").forEach(function (el) {
        if (el.getBoundingClientRect().top < innerHeight) forceReveal(el);
      });
    }, 6000);

    // Safety net #2 — a one-shot 6s timer only catches content that was
    // ALREADY in view at t=6s. Anything below the fold that the user scrolls
    // to later never gets a second chance if the IntersectionObserver above
    // is stalled (backgrounded/unfocused tab, extension interference, a
    // browser that silently drops the observer) — it would stay invisible
    // forever. A throttled scroll listener re-checks on every scroll instead
    // of a single fixed offset from page load, and detaches once nothing is
    // left to reveal.
    var scrollFallbackActive = true;
    var raf = null;
    function scrollFallback() {
      if (!scrollFallbackActive) return;
      raf = null;
      var pending = $$("[data-reveal]:not(.is-revealed)");
      if (!pending.length) { scrollFallbackActive = false; window.removeEventListener("scroll", onScroll); return; }
      pending.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) forceReveal(el);
      });
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(scrollFallback); }
    window.addEventListener("scroll", onScroll, { passive: true });
    scrollFallback(); // also catch anything already in view at boot time
  }

  /* ---------------- Scroll progress ---------------- */
  function initScrollProgress() {
    var bar = $("[data-scroll-progress]");
    if (!bar) return;
    var raf = null;
    function update() {
      var max = document.documentElement.scrollHeight - innerHeight;
      var pct = max > 0 ? scrollY / max : 0;
      bar.style.transform = "scaleX(" + pct + ")";
      raf = null;
    }
    window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  /* ---------------- Sticky mobile CTA ---------------- */
  function initStickyCta() {
    var cta = $("[data-sticky-cta]");
    var hero = $(".hero");
    if (!cta || !hero) return;
    var onScroll = function () {
      var heroBottom = hero.getBoundingClientRect().bottom;
      if (heroBottom < 0) cta.classList.add("is-visible"); else cta.classList.remove("is-visible");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------- Tilt + halo on dish cards ---------------- */
  function initTilt() {
    if (!fineHover) return;
    $$(".dish-card").forEach(function (card) {
      var MAX = 7;
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        tx = -py * MAX; ty = px * MAX;
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener("mouseleave", function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
      function loop() {
        cx += (tx - cx) * 0.15; cy += (ty - cy) * 0.15;
        card.style.setProperty("--rx", cx.toFixed(2) + "deg");
        card.style.setProperty("--ry", cy.toFixed(2) + "deg");
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ---------------- Marquee ---------------- */
  function initMarquee() {
    if (!window.gsap) return;
    $$("[data-marquee]").forEach(function (track) {
      var clone = track.cloneNode(true);
      clone.removeAttribute("data-marquee");
      clone.setAttribute("aria-hidden", "true");
      track.parentNode.appendChild(clone);
      var distance = track.scrollWidth;
      var speed = 85; // fast enough to read as a moving ticker, not a static duplicated list
      gsap.to([track, clone], {
        x: -distance, duration: distance / speed, ease: "none", repeat: -1,
        modifiers: { x: gsap.utils.unitize(function (x) { return parseFloat(x) % distance; }) },
      });
    });
  }

  /* ---------------- Count-up ---------------- */
  function initCountUp() {
    $$("[data-count-to]").forEach(function (el) {
      var target = parseFloat(el.dataset.countTo);
      var decimals = (el.dataset.countTo.split(".")[1] || "").length;
      var obj = { v: 0 };
      var done = false;
      var trigger = function () {
        if (done) return;
        done = true;
        if (window.gsap) {
          gsap.to(obj, { v: target, duration: 1.2, ease: "power2.out", onUpdate: function () { el.textContent = obj.v.toFixed(decimals); } });
        } else {
          el.textContent = target.toFixed(decimals);
        }
      };
      if (!("IntersectionObserver" in window)) { trigger(); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { trigger(); io.unobserve(e.target); } });
      }, { threshold: 0.5 });
      io.observe(el);
      // Safety net — the hardcoded "4.7" in HTML is already correct, but force it
      // back if the observer never fires (rare) so the count-up doesn't stall at 0.
      setTimeout(function () { if (!done) { el.textContent = target.toFixed(decimals); done = true; } }, 6000);
    });
  }

  /* ---------------- Hero parallax ---------------- */
  function initHeroParallax() {
    if (!window.gsap || !window.ScrollTrigger || reduced) return;
    var heroBg = $(".hero-bg");
    var heroContent = $(".hero-content");
    if (heroBg) {
      gsap.to(heroBg, { yPercent: 20, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    }
    if (heroContent) {
      gsap.to(heroContent, { yPercent: -25, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    }
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    safe(initNav, "initNav");
    safe(initNavMobile, "initNavMobile");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initCursor, "initCursor");
    safe(initReveals, "initReveals");
    safe(initScrollProgress, "initScrollProgress");
    safe(initStickyCta, "initStickyCta");
    safe(initTilt, "initTilt");
    safe(initCountUp, "initCountUp");

    if (window.gsap) {
      if (window.ScrollTrigger) { try { gsap.registerPlugin(ScrollTrigger); } catch (e) {} }
      safe(initMarquee, "initMarquee");
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
