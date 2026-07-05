/**
 * Analítica (GTM / GA4) — para explicarle a Marcela sin leer código:
 *
 * Cada botón de WhatsApp del sitio dispara un evento "whatsapp_click" al
 * dataLayer, con un parámetro wa_location que indica EN QUÉ PARTE del sitio
 * se hizo clic:
 *   hero               -> botón secundario del banner principal
 *   nav / nav_mobile    -> botón "Reservar" del menú (versión escritorio/celular)
 *   cta_valor           -> botón "Cotizar en soles" de la sección de beneficios
 *   unidad_1a / 1b/2a/2b -> botón "Reservar" dentro de cada departamento
 *   cta_final           -> botón de la última sección antes del footer
 *   float               -> el botón flotante de WhatsApp (siempre visible)
 *
 * Una vez conectada la cuenta real de GTM/GA4 (reemplazando
 * [GTM_CONTAINER_ID] en index.html), en GA4 esto se ve como un evento
 * "whatsapp_click" con un reporte que muestra cuánta gente hace clic en
 * WhatsApp y desde qué sección del sitio — útil para saber qué parte
 * convierte más antes de invertir en publicidad.
 */
(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var i18n = window.__I18N__ || { es: {}, en: {} };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  var state = { lang: "es" };

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var escHTML = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var t = function () { return i18n[state.lang] || i18n.es || {}; };
  var tpl = function (str, vars) {
    return String(str || "").replace(/\{(\w+)\}/g, function (_, key) {
      return vars && vars[key] != null ? vars[key] : "";
    });
  };
  var waLink = function (phone, message) {
    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
  };
  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  var ICON_GUESTS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c.6-3.6 3.3-6 6.5-6s5.9 2.4 6.5 6"/><circle cx="17" cy="8.5" r="2.3"/><path d="M16 14.2c2.6.3 4.7 2.4 5.2 5.3"/></svg>';
  var ICON_BED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 18v-7a2 2 0 012-2h14a2 2 0 012 2v7"/><path d="M3 18v2M21 18v2M3 13h18"/><path d="M6 11V9a2 2 0 012-2h2a2 2 0 012 2v2"/></svg>';
  var ICON_BATH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12h16v2a5 5 0 01-5 5H9a5 5 0 01-5-5v-2z"/><path d="M7 12V6a2 2 0 012-2h.5"/><path d="M9 19v2M15 19v2"/></svg>';
  var ICON_STAR = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.6l-6.1 3.4 1.5-6.8-5.2-4.7 6.9-.7L12 2.5z"/></svg>';
  var ICON_WA = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 004.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.16c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.13.11-1.82-.12-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.18-4.94-4.37-.14-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.02-2.42.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.1.19-.15.31-.3.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2.01 1.12 1 2.06 1.31 2.35 1.46.29.15.46.13.63-.06.17-.19.72-.83.91-1.12.19-.29.38-.24.63-.14.25.1 1.6.75 1.87.88.27.13.45.19.51.3.07.11.07.61-.17 1.29z"/></svg>';
  var ICON_CHEV_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 5l-7 7 7 7"/></svg>';
  var ICON_CHEV_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 5l7 7-7 7"/></svg>';

  function unitCardHTML(u, lang) {
    var dict = i18n[lang] || i18n.es;
    var title = (dict.unit_title_prefix || "Depto") + " " + u.code;

    var galleryHTML = u.photos.map(function (src, i) {
      return '<figure><img src="' + escHTML(src) + '" alt="' + escHTML(title) + ' — foto ' + (i + 1) + '" loading="lazy" decoding="async"></figure>';
    }).join("");

    var dotsHTML = u.photos.map(function (_, i) {
      return '<span' + (i === 0 ? ' class="is-active"' : '') + '></span>';
    }).join("");

    var arrowsHTML = u.photos.length > 1
      ? '<button type="button" class="unit-gallery-nav prev" data-gallery-prev aria-label="' + escHTML(dict.gallery_prev) + '">' + ICON_CHEV_L + "</button>" +
        '<button type="button" class="unit-gallery-nav next" data-gallery-next aria-label="' + escHTML(dict.gallery_next) + '">' + ICON_CHEV_R + "</button>"
      : "";

    var hasVideo = !!u.video;

    var videoHTML = hasVideo
      ? '<video class="unit-video-cover" data-unit-video src="' + escHTML(u.video) + '" poster="' + escHTML(u.poster || "") + '" muted loop playsinline preload="metadata"></video>'
      : "";

    var toggleHTML = hasVideo
      ? '<button type="button" class="unit-media-toggle" data-media-toggle>' + escHTML(dict.unit_toggle_photos) + "</button>"
      : "";

    var badgeHTML = u.badge ? '<span class="unit-badge">' + escHTML(dict.unit_badge_favorite) + "</span>" : "";

    var waHref = waLink(data.whatsapp, tpl(dict.wa_msg_unit, { code: u.code }));
    var reserveLabel = tpl(dict.unit_reserve, { code: u.code });
    var specsRooms = tpl(dict.unit_specs_rooms, { bedrooms: u.bedrooms, beds: u.beds });
    var waTrackId = "unidad_" + u.id;

    var testimonialsHTML = (u.testimonials && u.testimonials.length)
      ? '<div class="unit-testimonials">' +
          '<h4>' + escHTML(dict.testimonials_title) + "</h4>" +
          u.testimonials.map(function (rev) {
            return '<div class="testimonial">' +
              '<div class="testimonial-stars">★★★★★</div>' +
              '<p>“' + escHTML(rev.text) + '”</p>' +
              '<span class="testimonial-name">— ' + escHTML(rev.name) + ", " + escHTML(rev.date) + "</span>" +
            "</div>";
          }).join("") +
        "</div>"
      : "";

    var aboutHTML = u.about
      ? '<div class="unit-about">' +
          '<h4>' + escHTML(dict.unit_about_title) + "</h4>" +
          "<p>" + escHTML(u.about.text) + "</p>" +
          '<ul class="unit-about-highlights">' +
            u.about.highlights.map(function (h) { return "<li>" + escHTML(h) + "</li>"; }).join("") +
          "</ul>" +
        "</div>"
      : "";

    return (
      '<article class="unit-card" data-unit-card>' +
        '<div class="unit-media"' + (hasVideo ? ' data-unit-media data-media-mode="video"' : "") + '>' +
          videoHTML +
          '<div class="unit-gallery" data-unit-gallery>' + galleryHTML + "</div>" +
          arrowsHTML +
          toggleHTML +
          badgeHTML +
          '<div class="unit-price"><span class="amount">$' + u.price + " <span>" + escHTML(dict.unit_night) + '</span></span><span class="note">' + escHTML(dict.unit_price_note) + "</span></div>" +
          '<div class="unit-dots" data-unit-dots>' + dotsHTML + "</div>" +
        "</div>" +
        '<div class="unit-body">' +
          '<div class="unit-title-row"><h3 class="unit-title">' + escHTML(title) + '</h3>' +
            '<span class="unit-rating">' + ICON_STAR + " " + u.rating.toFixed(2) + " · " + u.reviews + " " + escHTML(dict.unit_reviews_word) + "</span>" +
          "</div>" +
          '<ul class="unit-specs">' +
            "<li>" + ICON_GUESTS + " " + u.guests + " " + escHTML(dict.unit_guests) + "</li>" +
            "<li>" + ICON_BED + " " + escHTML(specsRooms) + "</li>" +
            "<li>" + ICON_BATH + " " + u.baths + " " + escHTML(dict.unit_baths) + "</li>" +
          "</ul>" +
          testimonialsHTML +
          aboutHTML +
          '<div class="unit-cta"><a class="btn btn-primary" data-wa-track="' + waTrackId + '" href="' + escHTML(waHref) + '" target="_blank" rel="noopener">' + ICON_WA + " " + escHTML(reserveLabel) + "</a></div>" +
        "</div>" +
      "</article>"
    );
  }

  function initUnitGalleries() {
    $$("[data-unit-card]").forEach(function (card) {
      var gallery = $("[data-unit-gallery]", card);
      var dotsWrap = $("[data-unit-dots]", card);
      if (!gallery || !dotsWrap) return;
      var dots = $$("span", dotsWrap);
      var prevBtn = $("[data-gallery-prev]", card);
      var nextBtn = $("[data-gallery-next]", card);

      var figs = $$("figure", gallery);
      var count = figs.length;

      var currentIndex = function () {
        var idx = Math.round(gallery.scrollLeft / (gallery.clientWidth || 1));
        return Math.max(0, Math.min(idx, count - 1));
      };

      var setActive = function (idx) {
        dots.forEach(function (d, i) { d.classList.toggle("is-active", i === idx); });
      };

      var goTo = function (idx) {
        if (!figs[idx]) return;
        gallery.scrollTo({ left: figs[idx].offsetLeft, behavior: reduced ? "auto" : "smooth" });
      };

      if (dots.length) {
        gallery.addEventListener("scroll", function () {
          setActive(currentIndex());
        }, { passive: true });

        dots.forEach(function (dot, i) {
          dot.style.cursor = "pointer";
          dot.style.pointerEvents = "auto";
          dot.addEventListener("click", function () { goTo(i); });
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          goTo((currentIndex() - 1 + count) % count);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          goTo((currentIndex() + 1) % count);
        });
      }
    });
  }

  function initUnitVideos() {
    var videos = $$("[data-unit-video]");
    if (!videos.length || typeof IntersectionObserver === "undefined") return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        var media = v.closest("[data-unit-media]");
        var inPhotoMode = media && media.getAttribute("data-media-mode") === "photos";
        if (entry.isIntersecting && !inPhotoMode) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.4 });

    videos.forEach(function (v) { io.observe(v); });
  }

  function initUnitMediaToggle() {
    $$("[data-unit-media]").forEach(function (media) {
      var toggle = $("[data-media-toggle]", media);
      var video = $("[data-unit-video]", media);
      if (!toggle || !video) return;

      toggle.addEventListener("click", function () {
        var dict = t();
        var toPhotos = media.getAttribute("data-media-mode") !== "photos";
        media.setAttribute("data-media-mode", toPhotos ? "photos" : "video");
        toggle.textContent = toPhotos ? dict.unit_toggle_video : dict.unit_toggle_photos;
        if (toPhotos) {
          video.pause();
        } else {
          var rect = media.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            var p = video.play();
            if (p && p.catch) p.catch(function () {});
          }
        }
      });
    });
  }

  function renderUnits(lang) {
    var target = $("[data-units]");
    if (!target || !data.units) return;
    target.innerHTML = data.units.map(function (u) { return unitCardHTML(u, lang); }).join("");
    safe(initUnitGalleries, "initUnitGalleries");
    safe(initUnitVideos, "initUnitVideos");
    safe(initUnitMediaToggle, "initUnitMediaToggle");
  }

  function mountUnits() {
    var target = $("[data-units]");
    if (!target || target.children.length > 0) return;
    renderUnits(state.lang);
  }

  function initNav() {
    var nav = $("[data-nav]");
    var toggle = $("[data-nav-toggle]");
    var mobile = $("[data-nav-mobile]");
    if (!nav) return;

    var onScroll = function () {
      if (window.scrollY > 40) nav.classList.add("is-solid");
      else nav.classList.remove("is-solid");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle && mobile) {
      var setOpen = function (open) {
        mobile.hidden = !open;
        requestAnimationFrame(function () {
          mobile.classList.toggle("is-open", open);
        });
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      };
      toggle.addEventListener("click", function () {
        setOpen(mobile.hidden);
      });
      $$("[data-nav-close]", mobile).forEach(function (a) {
        a.addEventListener("click", function () { setOpen(false); });
      });
    }
  }

  function initReveals() {
    var els = $$(".reveal");
    if (!els.length) return;

    if (typeof IntersectionObserver === "undefined") {
      els.forEach(function (el) { el.classList.add("is-visible"); });
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

    els.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      els.forEach(function (el) {
        if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  function initCountUp() {
    var els = $$("[data-count-to]");
    if (!els.length) return;

    var animate = function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var isDecimal = el.hasAttribute("data-count-decimal");
      var duration = reduced ? 200 : 1400;
      var start = null;

      var step = function (ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var val = target * eased;
        el.textContent = isDecimal ? val.toFixed(2) : Math.round(val);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = isDecimal ? target.toFixed(2) : target;
      };
      requestAnimationFrame(step);
    };

    if (typeof IntersectionObserver === "undefined") {
      els.forEach(animate);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    els.forEach(function (el) { io.observe(el); });
  }

  function trackWaClick(location) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "whatsapp_click", wa_location: location });
  }

  function initWaTracking() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-wa-track]");
      if (!el) return;
      safe(function () { trackWaClick(el.getAttribute("data-wa-track")); }, "trackWaClick");
    });
  }

  function initAmbientSound() {
    var btn = $("[data-sound-toggle]");
    if (!btn) return;
    if (typeof (window.AudioContext || window.webkitAudioContext) === "undefined") {
      btn.hidden = true;
      return;
    }

    var ctx = null;
    var nodes = null;
    var playing = false;

    var start = function () {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!ctx) ctx = new AC();
      var bufferSize = 2 * ctx.sampleRate;
      var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      var noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      var filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 550;

      var gain = ctx.createGain();
      gain.gain.value = 0;

      var lfo = ctx.createOscillator();
      lfo.frequency.value = 0.14;
      var lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.045;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      noise.start(0);
      lfo.start(0);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 1.4);

      nodes = { noise: noise, lfo: lfo, gain: gain };
    };

    var stop = function () {
      if (!nodes || !ctx) return;
      var gain = nodes.gain;
      var noise = nodes.noise;
      var lfo = nodes.lfo;
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      setTimeout(function () {
        try { noise.stop(); lfo.stop(); } catch (e) {}
      }, 650);
      nodes = null;
    };

    btn.addEventListener("click", function () {
      playing = !playing;
      btn.classList.toggle("is-active", playing);
      btn.setAttribute("aria-pressed", playing ? "true" : "false");
      var dict = t();
      var label = $("[data-sound-label]", btn);
      if (label) label.textContent = playing ? dict.sound_toggle_on : dict.sound_toggle_off;
      if (playing) start(); else stop();
    });
  }

  function initHeroParallax() {
    if (reduced || !window.gsap || !window.ScrollTrigger) return;
    var img = $(".hero-media img");
    if (!img) return;
    gsap.to(img, {
      yPercent: 10,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 }
    });
  }

  function applyI18n(lang) {
    var dict = i18n[lang];
    if (!dict) return;
    state.lang = lang;
    document.documentElement.lang = lang;

    $$("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });
    $$("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (dict[key] != null) el.innerHTML = dict[key];
    });
    $$("[data-i18n-content]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-content");
      if (dict[key] != null) el.setAttribute("content", dict[key]);
    });
    $$("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (dict[key] != null) el.setAttribute("aria-label", dict[key]);
    });
    $$("[data-wa-link]").forEach(function (el) {
      el.setAttribute("href", waLink(data.whatsapp, dict.wa_msg_general));
    });

    $$("[data-lang-btn]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang-btn") === lang);
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang-btn") === lang ? "true" : "false");
    });

    var soundBtn = $("[data-sound-toggle]");
    if (soundBtn) {
      var soundLabel = $("[data-sound-label]", soundBtn);
      if (soundLabel) soundLabel.textContent = soundBtn.classList.contains("is-active") ? dict.sound_toggle_on : dict.sound_toggle_off;
    }

    renderUnits(lang);
  }

  function initLangToggle() {
    var btns = $$("[data-lang-btn]");
    if (!btns.length) return;
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang-btn");
        if (lang === state.lang) return;
        safe(function () { applyI18n(lang); }, "applyI18n");
      });
    });
  }

  function boot() {
    safe(mountUnits, "mountUnits");
    safe(initNav, "initNav");
    safe(initReveals, "initReveals");
    safe(initLangToggle, "initLangToggle");
    safe(initWaTracking, "initWaTracking");
    safe(initAmbientSound, "initAmbientSound");
    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (e) {}
      safe(initHeroParallax, "initHeroParallax");
    }
    safe(initCountUp, "initCountUp");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
