(function () {
  "use strict";

  /* ── Helpers ─────────────────────────────────────────────── */
  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.from((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ── Nav ─────────────────────────────────────────────────── */
  function initNav() {
    var nav = $("#nav");
    var burger = $(".nav-burger");
    var mobile = $("#nav-mobile");
    if (!nav) return;

    /* Scroll solidify */
    function onScroll() {
      if (window.scrollY > 40) {
        nav.classList.add("is-scrolled");
      } else {
        nav.classList.remove("is-scrolled");
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* Mobile burger */
    if (burger && mobile) {
      burger.addEventListener("click", function () {
        var open = burger.getAttribute("aria-expanded") === "true";
        burger.setAttribute("aria-expanded", String(!open));
        mobile.setAttribute("aria-hidden", String(open));
        mobile.classList.toggle("is-open", !open);
      });

      /* Cerrar al hacer click en link */
      $$("a", mobile).forEach(function (a) {
        a.addEventListener("click", function () {
          burger.setAttribute("aria-expanded", "false");
          mobile.setAttribute("aria-hidden", "true");
          mobile.classList.remove("is-open");
        });
      });
    }

    /* Smooth scroll anchors */
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navOffset = 80;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ── Revela con IntersectionObserver ─────────────────────── */
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
      threshold: 0.05,           /* skill rule: ≤ 0.05 */
      rootMargin: "0px 0px -2% 0px"
    });

    items.forEach(function (el) { io.observe(el); });

    /* Safety net: forzar reveal a los 6s si aún no se disparó */
    setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 1.2) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ── Tilt sutil en cards ─────────────────────────────────── */
  function initTilt() {
    if (!fineHover) return;
    $$("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "perspective(800px) rotateY(" + (x * 7) + "deg) rotateX(" + (-y * 5) + "deg) translateY(-3px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ── Hero parallax ligero ────────────────────────────────── */
  function initHeroParallax() {
    if (reduced) return;
    var heroBg = $(".hero-bg img");
    if (!heroBg) return;

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var s = window.scrollY;
        heroBg.style.transform = "translateY(" + (s * 0.25) + "px)";
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── GSAP ScrollTrigger revela con stagger en carta ──────── */
  function initGsapReveal() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    var cards = $$(".carta-card");
    if (cards.length) {
      gsap.fromTo(cards, {
        y: 40,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.65,
        stagger: 0.1,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ".carta-grid",
          start: "top 82%",
          once: true
        }
      });
    }

    var facts = $$(".filosofia-fact");
    if (facts.length) {
      gsap.fromTo(facts, {
        x: 30,
        opacity: 0
      }, {
        x: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ".filosofia-facts",
          start: "top 80%",
          once: true
        }
      });
    }
  }

  /* ── Hero title animada al entrar ────────────────────────── */
  function initHeroAnim() {
    if (reduced) return;
    var lines = $$(".hero-line");
    lines.forEach(function (line, i) {
      line.style.opacity = "0";
      line.style.transform = "translateY(32px)";
      line.style.transition =
        "opacity .7s " + (0.1 + i * 0.14) + "s cubic-bezier(0.16,1,0.3,1), " +
        "transform .7s " + (0.1 + i * 0.14) + "s cubic-bezier(0.16,1,0.3,1)";
    });

    var eyebrow = $(".hero-eyebrow");
    if (eyebrow) {
      eyebrow.style.opacity = "0";
      eyebrow.style.transition = "opacity .6s var(--ease-out)";
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        lines.forEach(function (line) {
          line.style.opacity = "1";
          line.style.transform = "none";
        });
        if (eyebrow) eyebrow.style.opacity = "1";
      });
    });
  }

  /* ── Boot ─────────────────────────────────────────────────── */
  function boot() {
    safe(initNav, "initNav");
    safe(initReveals, "initReveals");
    safe(initHeroAnim, "initHeroAnim");

    if (!reduced && fineHover) {
      safe(initTilt, "initTilt");
    }
    safe(initHeroParallax, "initHeroParallax");

    if (window.gsap && window.ScrollTrigger) {
      safe(initGsapReveal, "initGsapReveal");
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
