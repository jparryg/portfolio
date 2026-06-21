(function () {
  "use strict";

  /* ── safe wrapper ── */
  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[PH Barber] " + name + " failed:", e); }
  }

  /* ── reveal via IntersectionObserver ── */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
    /* fallback: show all after 6s */
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
        el.classList.add("is-visible");
      });
    }, 6000);
  }

  /* ── nav scroll class ── */
  function initNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    function onScroll() {
      nav.classList.toggle("is-scrolled", window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── mobile menu ── */
  function initMobileMenu() {
    var burger  = document.querySelector(".nav-burger");
    var mobileNav = document.getElementById("nav-mobile");
    if (!burger || !mobileNav) return;
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      burger.classList.toggle("is-open", !open);
      if (open) {
        mobileNav.setAttribute("hidden", "");
      } else {
        mobileNav.removeAttribute("hidden");
      }
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        burger.setAttribute("aria-expanded", "false");
        burger.classList.remove("is-open");
        mobileNav.setAttribute("hidden", "");
      });
    });
  }

  /* ── GSAP ScrollTrigger reveals (optional enhancement) ── */
  function initGsap() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ── boot ── */
  function boot() {
    safe(initNav,        "nav");
    safe(initMobileMenu, "mobileMenu");
    safe(initReveal,     "reveal");
    safe(initGsap,       "gsap");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
