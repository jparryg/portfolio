(function () {
  "use strict";

  /* ── Helpers ─────────────────────────────────────────── */
  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.from((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ── Splash ──────────────────────────────────────────── */
  function initSplash() {
    var splash = $("[data-splash]");
    if (!splash) return;

    function hide() { splash.classList.add("is-out"); }

    if (document.readyState === "complete") {
      setTimeout(hide, 800);
    } else {
      window.addEventListener("load", function () { setTimeout(hide, 600); });
    }
    // JS safety net (CSS has its own at 4.5s)
    setTimeout(hide, 3500);
  }

  /* ── Nav ─────────────────────────────────────────────── */
  function initNav() {
    var nav = $("[data-nav]");
    var toggle = $("[data-nav-toggle]");
    var drawer = $("[data-nav-drawer]");
    var drawerLinks = $$("[data-drawer-link]");
    if (!nav) return;

    // Scrolled state via sentinel
    var sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:10px;left:0;width:1px;height:1px;pointer-events:none;";
    document.body.prepend(sentinel);

    var navObs = new IntersectionObserver(function (entries) {
      nav.classList.toggle("is-scrolled", !entries[0].isIntersecting);
    }, { threshold: 0 });
    navObs.observe(sentinel);

    // Mobile toggle
    if (toggle && drawer) {
      toggle.addEventListener("click", function () {
        var open = drawer.classList.toggle("is-open");
        toggle.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        drawer.setAttribute("aria-hidden", String(!open));
        document.body.style.overflow = open ? "hidden" : "";
      });

      // Close on link click
      drawerLinks.forEach(function (link) {
        link.addEventListener("click", function () {
          drawer.classList.remove("is-open");
          toggle.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          drawer.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";
        });
      });

      // Close on outside click
      document.addEventListener("click", function (e) {
        if (drawer.classList.contains("is-open") &&
            !drawer.contains(e.target) &&
            !toggle.contains(e.target)) {
          drawer.classList.remove("is-open");
          toggle.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          drawer.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";
        }
      });
    }
  }

  /* ── Smooth anchor scroll ────────────────────────────── */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navOffset = 80;
      var top = target.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({
        top: top,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ── Scroll reveals (IntersectionObserver) ───────────── */
  function initReveals() {
    var items = $$(".reveal");
    if (!items.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, {
      threshold: 0.04,
      rootMargin: "0px 0px -4% 0px"
    });

    items.forEach(function (el) {
      var delay = el.dataset.delay;
      if (delay) el.style.transitionDelay = (parseInt(delay, 10) * 0.08) + "s";
      io.observe(el);
    });

    // Safety: force-reveal anything still in viewport at 6s
    setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ── Card tilt (desktop hover only) ─────────────────── */
  function initTilt() {
    if (!fineHover) return;
    var cards = $$("[data-tilt]");
    if (!cards.length) return;

    cards.forEach(function (card) {
      var rect, cx, cy;
      var RAD = 7; // max degrees
      var animFrame = null;

      card.addEventListener("mouseover", function (e) {
        if (card.contains(e.relatedTarget)) return;
        rect = card.getBoundingClientRect();
        cx = rect.left + rect.width / 2;
        cy = rect.top + rect.height / 2;
      });

      card.addEventListener("mousemove", function (e) {
        if (animFrame) cancelAnimationFrame(animFrame);
        animFrame = requestAnimationFrame(function () {
          rect = card.getBoundingClientRect();
          cx = rect.left + rect.width / 2;
          cy = rect.top + rect.height / 2;
          var dx = (e.clientX - cx) / (rect.width / 2);
          var dy = (e.clientY - cy) / (rect.height / 2);
          var rotX = -dy * RAD;
          var rotY = dx * RAD;
          card.style.transform = "perspective(900px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg) scale3d(1.02,1.02,1.02)";
          card.style.transition = "transform .08s linear";
        });
      });

      card.addEventListener("mouseout", function (e) {
        if (card.contains(e.relatedTarget)) return;
        if (animFrame) cancelAnimationFrame(animFrame);
        card.style.transform = "perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)";
        card.style.transition = "transform .5s cubic-bezier(0.16,1,0.3,1)";
      });
    });
  }

  /* ── Hero parallax (subtle, CSS-var driven) ──────────── */
  function initHeroParallax() {
    var heroImg = $("[data-hero-img]");
    if (!heroImg || reduced) return;

    function onScroll() {
      var y = window.scrollY;
      var shift = y * 0.22;
      heroImg.style.transform = "translateY(" + shift + "px)";
    }

    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ── GSAP ScrollTrigger reveals (catalog stagger) ────── */
  function initGSAPReveals() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // Catalog cards — reveal handled by IO; GSAP only adds y-stagger on top
    // (opacity stays with CSS .reveal/.is-visible to avoid inline-style override)
    var catCards = $$(".cat-card");
    if (catCards.length) {
      for (var i = 0; i < catCards.length; i += 4) {
        var row = catCards.slice(i, i + 4);
        gsap.from(row, {
          y: 20,
          duration: .6,
          stagger: .08,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: row[0],
            start: "top 92%",
            once: true
          }
        });
      }
    }

    // Gallery items
    var galItems = $$(".galeria-item");
    if (galItems.length) {
      gsap.from(galItems, {
        y: 20,
        duration: .7,
        stagger: .12,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: galItems[0],
          start: "top 85%",
          once: true
        }
      });
    }

    // Diferencial cards
    var difs = $$(".diferencial");
    if (difs.length) {
      gsap.from(difs, {
        y: 24,
        duration: .6,
        stagger: .1,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: difs[0],
          start: "top 85%",
          once: true
        }
      });
    }
  }

  /* ── Stats count-up ──────────────────────────────────── */
  function initCountUp() {
    // Only numeric stats that aren't hardcoded as text
    // Stats with "+" prefix or numeric: skip if they contain letters
    // We just add a simple entrance animation — no actual count-up
    // (all stats are hardcoded text, not numeric targets)
    var stats = $$(".stat-num");
    stats.forEach(function (el, i) {
      el.style.opacity = "0";
      el.style.transform = "translateY(12px)";
      el.style.transition = "opacity .5s ease " + (i * .1 + .1) + "s, transform .5s ease " + (i * .1 + .1) + "s";
    });

    var statsObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          $$(".stat-num").forEach(function (el) {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          });
          statsObs.disconnect();
        }
      });
    }, { threshold: 0.04 });

    var statsStrip = $(".stats-strip");
    if (statsStrip) statsObs.observe(statsStrip);
  }

  /* ── FAB show/hide on contact section ───────────────── */
  function initFAB() {
    var fab = $("[data-whatsapp-fab]");
    if (!fab) return;
    // FAB is always visible — nothing to toggle
    // Show it only after splash is gone
    fab.style.opacity = "0";
    fab.style.transition = "opacity .5s ease, transform .3s ease";
    setTimeout(function () {
      fab.style.opacity = "1";
    }, 1500);
  }

  /* ── Boot ────────────────────────────────────────────── */
  function boot() {
    safe(initSplash, "initSplash");
    safe(initNav, "initNav");
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initReveals, "initReveals");
    safe(initTilt, "initTilt");
    safe(initHeroParallax, "initHeroParallax");
    safe(initCountUp, "initCountUp");
    safe(initFAB, "initFAB");

    // GSAP-dependent inits
    if (window.gsap && window.ScrollTrigger) {
      safe(initGSAPReveals, "initGSAPReveals");
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
