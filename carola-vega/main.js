/* ═══════════════════════════════════════════════════════════
   CAROLA VEGA — main.js
   IIFE, no build step required
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Splash loader ──────────────────────────────────────── */
  function initSplash() {
    var splash     = document.getElementById('splash');
    var splashName = splash && splash.querySelector('.splash-name');
    var splashBar  = splash && splash.querySelector('.splash-bar');

    if (!splash) return;

    // Animate name in
    if (splashName) {
      splashName.style.transition = 'opacity .6s ease, transform .6s ease';
      requestAnimationFrame(function () {
        setTimeout(function () {
          splashName.style.opacity   = '1';
          splashName.style.transform = 'translateY(0)';
        }, 80);
      });
    }

    // Animate bar
    if (splashBar) {
      splashBar.style.transition = 'width .8s cubic-bezier(.22,1,.36,1)';
      setTimeout(function () {
        splashBar.style.width = '100%';
      }, 200);
    }

    // Hide splash
    setTimeout(function () {
      splash.style.transition = 'opacity .5s ease';
      splash.style.opacity    = '0';
      setTimeout(function () {
        splash.classList.add('hidden');
        document.body.style.overflow = '';
      }, 500);
    }, 1400);

    document.body.style.overflow = 'hidden';
  }

  /* ── Nav scroll behavior ────────────────────────────────── */
  function initNav() {
    var nav    = document.getElementById('nav');
    var burger = document.getElementById('navBurger');
    var links  = nav && nav.querySelector('.nav-links');

    if (!nav) return;

    var onScroll = function () {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Burger toggle
    if (burger && links) {
      burger.addEventListener('click', function () {
        var isOpen = links.classList.toggle('open');
        burger.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Close on link click
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          links.classList.remove('open');
          burger.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /* ── Hero image parallax zoom ───────────────────────────── */
  function initHero() {
    var img = document.querySelector('.hero-img');
    if (!img) return;

    img.addEventListener('load', function () {
      img.classList.add('loaded');
    });
    if (img.complete) img.classList.add('loaded');
  }

  /* ── IntersectionObserver reveals ──────────────────────── */
  function initReveals() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    // Stagger siblings
    var parents = {};
    els.forEach(function (el) {
      var key = el.parentElement;
      parents[key] = (parents[key] || []);
      parents[key].push(el);
    });
    Object.values(parents).forEach(function (group) {
      group.forEach(function (el, i) {
        el.style.transitionDelay = (i * 80) + 'ms';
      });
    });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ── Count-up for stats ─────────────────────────────────── */
  function initCountUp() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function animate(el, target, duration) {
      var start     = null;
      var startVal  = 0;

      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var value    = Math.round(easeOut(progress) * (target - startVal) + startVal);
        el.textContent = value.toLocaleString('es-PE');
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el     = entry.target;
          var target = parseInt(el.getAttribute('data-count'), 10);
          animate(el, target, 1800);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { io.observe(el); });
  }

  /* ── Tilt effect on cards ───────────────────────────────── */
  function initTilt() {
    var cards = document.querySelectorAll('.programa-card');
    var MAX   = 6; // degrees

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect   = card.getBoundingClientRect();
        var cx     = rect.left + rect.width  / 2;
        var cy     = rect.top  + rect.height / 2;
        var dx     = (e.clientX - cx) / (rect.width  / 2);
        var dy     = (e.clientY - cy) / (rect.height / 2);
        var rotX   = (-dy * MAX).toFixed(2);
        var rotY   = ( dx * MAX).toFixed(2);
        card.style.transform = 'perspective(800px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(-8px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1), box-shadow .35s, border-color .35s';
        setTimeout(function () { card.style.transition = ''; }, 500);
      });
    });
  }

  /* ── GSAP ScrollTrigger reveals (progressive enhancement) ─ */
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Hero title words
    var heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      gsap.from(heroTitle.children, {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: 'power3.out',
        delay: 1.5
      });
    }

    // Hero sub & actions
    gsap.from(['.hero-sub', '.hero-actions'], {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: .9,
      ease: 'power3.out',
      delay: 2
    });

    // Section titles split
    document.querySelectorAll('.section-title[data-split]').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%' },
        y: 40,
        opacity: 0,
        duration: .9,
        ease: 'power3.out'
      });
    });

    // Gallery parallax
    document.querySelectorAll('.gal-item').forEach(function (item, i) {
      gsap.fromTo(item,
        { yPercent: 10 * (i % 2 === 0 ? 1 : -1) },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        }
      );
    });
  }

  /* ── Smooth anchor scrolling ────────────────────────────── */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ── Boot ───────────────────────────────────────────────── */
  function boot() {
    initSplash();
    initNav();
    initHero();
    initReveals();
    initCountUp();
    initTilt();
    initSmoothAnchors();

    // GSAP runs after libraries load
    if (document.readyState === 'complete') {
      initGSAP();
    } else {
      window.addEventListener('load', initGSAP);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

}());
