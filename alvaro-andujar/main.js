(function () {
  "use strict";

  /* ---- BRAND DATA ---- */
  window.__BRAND__ = {
    name: "Dr. Álvaro Andújar Ferrari",
    wa: "+51972024219",
    waMsg: "Hola Dr. Alvaro, quisiera agendar una consulta.",
    email: "alvaro.andujar.ferrari.83@gmail.com",
    ig: "https://www.instagram.com/dralvaroandujarferrari/"
  };

  /* ---- SAFE WRAPPER ---- */
  function safe(fn, name) {
    try { fn(); }
    catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ---- WAIT FOR LIBS ---- */
  function waitForGSAP(cb, attempts) {
    attempts = attempts || 0;
    if (window.gsap && window.ScrollTrigger) { cb(); return; }
    if (attempts > 40) { cb(); return; } // fallback — run without GSAP
    setTimeout(function () { waitForGSAP(cb, attempts + 1); }, 100);
  }

  /* ---- SPLASH ---- */
  function initSplash() {
    var splash = document.getElementById("splash");
    if (!splash) return;
    // CSS animation handles most of it; JS double safety
    var t = setTimeout(function () {
      splash.style.opacity = "0";
      splash.style.pointerEvents = "none";
      setTimeout(function () { splash.remove(); }, 400);
    }, 4200);
    // If user interacts before 4s, dismiss faster
    window.addEventListener("scroll", function dismissSplash() {
      clearTimeout(t);
      splash.style.opacity = "0";
      splash.style.pointerEvents = "none";
      setTimeout(function () { splash.remove(); }, 400);
      window.removeEventListener("scroll", dismissSplash);
    }, { once: true, passive: true });
  }

  /* ---- NAV ---- */
  function initNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;

    // Scroll solidify
    window.addEventListener("scroll", function () {
      if (window.scrollY > 60) { nav.classList.add("scrolled"); }
      else { nav.classList.remove("scrolled"); }
    }, { passive: true });

    // Hamburger
    var ham = document.getElementById("hamburger");
    var mob = document.getElementById("navMobile");
    if (ham && mob) {
      ham.addEventListener("click", function () {
        var expanded = ham.getAttribute("aria-expanded") === "true";
        ham.setAttribute("aria-expanded", String(!expanded));
        mob.hidden = expanded;
      });
      // Close on link click
      mob.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          ham.setAttribute("aria-expanded", "false");
          mob.hidden = true;
        });
      });
    }

    // Smooth anchor scroll with offset for fixed nav
    document.addEventListener("click", function (e) {
      var anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navH = nav.offsetHeight || 80;
      var top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  }

  /* ---- REVEALS ---- */
  function initReveals() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    // Safety net: force visible after 6s regardless of observer
    var safetyTimeout = setTimeout(function () {
      els.forEach(function (el) { el.classList.add("is-visible"); });
    }, 6000);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
      // Clear safety if all done
      var remaining = document.querySelectorAll(".reveal:not(.is-visible)");
      if (!remaining.length) clearTimeout(safetyTimeout);
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });

    els.forEach(function (el, i) {
      // Stagger by DOM order
      el.style.transitionDelay = (i % 6 * 0.08) + "s";
      observer.observe(el);
    });
  }

  /* ---- CARD HOVER TILT ---- */
  function initCardTilt() {
    if (window.matchMedia("(hover: none)").matches) return;
    var cards = document.querySelectorAll(".servicio-card, .test-card");
    cards.forEach(function (card) {
      card.addEventListener("mouseover", function (e) {
        if (!card.contains(e.relatedTarget)) {
          card.addEventListener("mousemove", onTilt);
        }
      });
      card.addEventListener("mouseout", function (e) {
        if (!card.contains(e.relatedTarget)) {
          card.removeEventListener("mousemove", onTilt);
          card.style.transform = "";
        }
      });
      function onTilt(e) {
        var rect = card.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) / (rect.width / 2);
        var dy = (e.clientY - cy) / (rect.height / 2);
        var rx = dy * 6;   // max 6deg
        var ry = -dx * 6;
        card.style.transform = "perspective(700px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-6px)";
      }
    });
  }

  /* ---- MAGNETIC CTA BUTTONS ---- */
  function initMagnetic() {
    if (window.matchMedia("(hover: none)").matches) return;
    var btns = document.querySelectorAll(".btn-primary, .btn-ghost");
    btns.forEach(function (btn) {
      btn.addEventListener("mouseover", function (e) {
        if (!btn.contains(e.relatedTarget)) {
          btn.addEventListener("mousemove", onMag);
        }
      });
      btn.addEventListener("mouseout", function (e) {
        if (!btn.contains(e.relatedTarget)) {
          btn.removeEventListener("mousemove", onMag);
          btn.style.transform = "";
        }
      });
      function onMag(e) {
        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) * 0.22;
        var dy = (e.clientY - cy) * 0.22;
        btn.style.transform = "translate(" + dx + "px, " + dy + "px)";
      }
    });
  }

  /* ---- GSAP ANIMATIONS (progressive enhancement) ---- */
  function initGSAP() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // Hero content entrance
    var heroEls = [".hero-kicker",".hero-title",".hero-sub",".hero-actions",".hero-credential"];
    heroEls.forEach(function (sel, i) {
      var el = document.querySelector(sel);
      if (!el) return;
      gsap.from(el, {
        opacity: 0, y: 30,
        duration: 0.75, delay: 0.3 + i * 0.12,
        ease: "power2.out"
      });
    });

    gsap.from(".hero-img-wrap", { opacity:0, scale:0.95, duration:1, delay:0.5, ease:"power2.out" });
    gsap.from(".stat-pill", { opacity:0, scale:0.85, duration:0.6, delay:0.9, stagger:0.15, ease:"back.out(1.6)" });

    // Service cards stagger
    gsap.from(".servicio-card", {
      scrollTrigger: { trigger: ".servicios-grid", start:"top 80%", once:true },
      opacity:0, y:40, duration:0.65, stagger:0.1, ease:"power2.out"
    });

    // Testimonials
    gsap.from(".test-card", {
      scrollTrigger: { trigger: ".test-grid", start:"top 80%", once:true },
      opacity:0, y:30, duration:0.6, stagger:0.15, ease:"power2.out"
    });

    // Timeline items
    gsap.from(".tl-item", {
      scrollTrigger: { trigger: ".timeline", start:"top 80%", once:true },
      opacity:0, x:-20, duration:0.55, stagger:0.12, ease:"power2.out"
    });
  }

  /* ---- WHATSAPP FORM ---- */
  function initWAForm() {
    var btn = document.getElementById("btnForm");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var nombre = (document.getElementById("nombre") || {}).value || "";
      var telefono = (document.getElementById("telefono") || {}).value || "";
      var servicio = (document.getElementById("servicio") || {}).value || "Consulta general";
      var mensaje = (document.getElementById("mensaje") || {}).value || "";
      var text = "Hola Dr. Álvaro, soy " + (nombre || "un paciente") + " y quisiera agendar una cita.";
      if (servicio) text += " Servicio: " + servicio + ".";
      if (mensaje) text += " " + mensaje;
      if (telefono) text += " Mi teléfono: " + telefono + ".";
      var url = "https://wa.me/51972024219?text=" + encodeURIComponent(text);
      window.open(url, "_blank", "noopener");
    });
  }

  /* ---- BOOT ---- */
  function boot() {
    safe(initSplash,  "initSplash");
    safe(initNav,     "initNav");
    safe(initReveals, "initReveals");
    safe(initCardTilt,"initCardTilt");
    safe(initMagnetic,"initMagnetic");
    safe(initWAForm,  "initWAForm");
    waitForGSAP(function () { safe(initGSAP, "initGSAP"); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

}());
