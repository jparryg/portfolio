(function () {
  "use strict";

  /* ── helpers ── */
  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const escHTML = (s) => String(s == null ? "" : s)
    .replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  /* ── NAV ── */
  function initNav() {
    const nav = $(".nav");
    if (!nav) return;

    // Solidify on scroll
    const solidify = () => {
      nav.classList.toggle("is-solid", window.scrollY > 40);
    };
    window.addEventListener("scroll", solidify, { passive: true });
    solidify();

    // Burger toggle
    const burger = $(".nav-burger");
    const mobileMenu = $(".nav-mobile");
    if (!burger || !mobileMenu) return;

    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open);
      mobileMenu.setAttribute("aria-hidden", !open);
    });

    // Close on link click
    $$(".nav-mobile-link, .nav-mobile-cta").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", false);
        mobileMenu.setAttribute("aria-hidden", true);
      });
    });

    // Smooth anchor scroll with nav offset
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const navH = nav.offsetHeight || 68;
      const top = el.getBoundingClientRect().top + window.scrollY - navH - 12;
      window.scrollTo({ top, behavior: "smooth" });
    });
  }

  /* ── HERO PARALLAX ── */
  function initHeroParallax() {
    if (!window.gsap || !window.ScrollTrigger) return;
    const heroImg = $(".hero-bg img");
    if (!heroImg) return;

    gsap.to(heroImg, {
      yPercent: 25,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }

  /* ── REVEAL ON SCROLL ── */
  function initReveals() {
    const els = $$(".reveal");
    if (!els.length) return;

    // Safety net: reveal everything after 6s regardless
    const safetyTimer = setTimeout(() => {
      els.forEach(el => el.classList.add("is-visible"));
    }, 6000);

    if (!window.IntersectionObserver) {
      els.forEach(el => el.classList.add("is-visible"));
      clearTimeout(safetyTimer);
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });

    // Stagger siblings in same container
    const groups = {};
    els.forEach(el => {
      const key = el.parentElement ? el.parentElement.dataset.revealGroup || "" : "";
      if (!groups[key]) groups[key] = [];
      groups[key].push(el);
      obs.observe(el);
    });

    // Also clear safety if all visible
    let revealed = 0;
    els.forEach(el => {
      const origCallback = obs;
      // Just rely on safety net above
    });
  }

  /* ── TILT 3D ── */
  function initTilt() {
    if (!fineHover) return;
    const cards = $$("[data-tilt]");
    const MAX_TILT = 7;

    cards.forEach(card => {
      card.addEventListener("mouseover", handleEnter);
      card.addEventListener("mouseout", handleLeave);
      card.addEventListener("mousemove", handleMove);

      function handleEnter(e) {
        if (!card.contains(e.relatedTarget)) {
          card.style.transition = "transform 0.1s";
        }
      }
      function handleLeave(e) {
        if (!card.contains(e.relatedTarget)) {
          card.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
          card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)";
        }
      }
      function handleMove(e) {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const rx = ((e.clientY - cy) / rect.height) * -MAX_TILT;
        const ry = ((e.clientX - cx) / rect.width) * MAX_TILT;
        card.style.transition = "transform 0.05s";
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      }
    });
  }

  /* ── COUNT-UP NUMBERS ── */
  function initCountUp() {
    const els = $$("[data-count-to]");
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.countTo);
        const isFloat = String(target).includes(".");
        const duration = 1400;
        const start = performance.now();

        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          const value = target * ease;
          el.textContent = isFloat
            ? value.toFixed(1)
            : Math.round(value).toLocaleString("es-PE");
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = isFloat ? target.toFixed(1) : target.toLocaleString("es-PE");
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.2 });

    els.forEach(el => obs.observe(el));
  }

  /* ── TESTIMONIALS CAROUSEL ── */
  function initTestimonials() {
    const track = $("#testimonials-track");
    if (!track) return;

    const cards = $$(".testimonial-card", track);
    if (!cards.length) return;
    const dotsContainer = $("#t-dots");
    const prevBtn = $(".t-prev");
    const nextBtn = $(".t-next");
    let current = 0;
    let autoTimer;

    // Build dots
    if (dotsContainer) {
      cards.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.className = "t-dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", "Reseña " + (i + 1));
        dot.addEventListener("click", () => goto(i));
        dotsContainer.appendChild(dot);
      });
    }

    function goto(idx) {
      current = (idx + cards.length) % cards.length;
      const offset = -current * 100;
      cards.forEach((card, i) => {
        card.style.transform = `translateX(${(i - current) * 100}%)`;
      });
      $$(".t-dot", dotsContainer).forEach((d, i) => {
        d.classList.toggle("is-active", i === current);
      });
    }

    // Init positions
    cards.forEach((card, i) => {
      card.style.position = "absolute";
      card.style.top = "0"; card.style.left = "0";
      card.style.width = "100%";
      card.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
      card.style.transform = `translateX(${i * 100}%)`;
    });
    track.style.position = "relative";
    track.style.overflow = "hidden";
    // Set track height to first card
    function setHeight() {
      const card = cards[current];
      track.style.height = card.offsetHeight + "px";
    }
    setHeight();
    window.addEventListener("resize", setHeight);

    if (prevBtn) prevBtn.addEventListener("click", () => { clearInterval(autoTimer); goto(current - 1); });
    if (nextBtn) nextBtn.addEventListener("click", () => { clearInterval(autoTimer); goto(current + 1); });

    // Auto-rotate
    autoTimer = setInterval(() => goto(current + 1), 5000);

    // Swipe
    let startX;
    track.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { clearInterval(autoTimer); goto(diff > 0 ? current + 1 : current - 1); }
    });
  }

  /* ── GSAP SCROLL ANIMATIONS ── */
  function initGsapAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // Bento cards stagger
    const bentoCards = $$(".bento-card");
    if (bentoCards.length) {
      gsap.from(bentoCards, {
        opacity: 0,
        y: 40,
        stagger: 0.08,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".bento",
          start: "top 75%",
          once: true
        }
      });
    }

    // Marquee pause on hover (performance)
    const track = $(".marquee-track");
    const marqueeEl = $(".marquee");
    if (track && marqueeEl) {
      marqueeEl.addEventListener("mouseover", () => track.style.animationPlayState = "paused");
      marqueeEl.addEventListener("mouseout", () => track.style.animationPlayState = "running");
    }

    // Hero title line animation
    const heroTitle = $(".hero-title");
    if (heroTitle) {
      gsap.from(heroTitle, {
        opacity: 0,
        y: 30,
        duration: 1.0,
        ease: "power3.out",
        delay: 0.3
      });
    }

    // Hero sub + actions
    const heroSub = $(".hero-sub");
    const heroRating = $(".hero-rating");
    const heroActions = $(".hero-actions");
    if (heroSub) gsap.from(heroSub, { opacity: 0, y: 20, duration: .8, ease: "power3.out", delay: 0.55 });
    if (heroRating) gsap.from(heroRating, { opacity: 0, y: 15, duration: .7, ease: "power3.out", delay: 0.7 });
    if (heroActions) gsap.from(heroActions, { opacity: 0, y: 15, duration: .7, ease: "power3.out", delay: 0.85 });
  }

  /* ── CURRENT DAY HIGHLIGHT ── */
  function initHoursHighlight() {
    const days = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
    const todayName = days[new Date().getDay()];
    const items = $$(".hours-list li");
    items.forEach(item => {
      const daySpan = item.querySelector("span:first-child");
      if (daySpan && daySpan.textContent.trim() === todayName) {
        item.style.fontWeight = "500";
        const badge = document.createElement("span");
        badge.textContent = "hoy";
        badge.style.cssText = "font-size:.65rem;letter-spacing:.08em;text-transform:uppercase;background:var(--accent);color:#fff;padding:.15rem .5rem;border-radius:100px;margin-left:.5rem;";
        daySpan.appendChild(badge);
      }
    });
  }

  /* ── BOOT ── */
  function boot() {
    safe(initNav, "initNav");
    safe(initReveals, "initReveals");
    safe(initCountUp, "initCountUp");
    safe(initTilt, "initTilt");
    safe(initTestimonials, "initTestimonials");
    safe(initHoursHighlight, "initHoursHighlight");

    if (window.gsap && window.ScrollTrigger) {
      safe(initHeroParallax, "initHeroParallax");
      safe(initGsapAnimations, "initGsapAnimations");
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
