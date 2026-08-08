/* =========================================================
   Soumyadip Ghorai — Portfolio
   Vanilla JS: theme toggle, mobile nav, smooth scroll spy,
   scroll-reveal animations, skill bar fill, footer year,
   contact form (non-functional, front-end only)
   ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "sg-portfolio-theme";

  /* ---------------- Theme (light/dark) ---------------- */
  function applyTheme(theme) {
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    var sun = document.getElementById("icon-sun");
    var moon = document.getElementById("icon-moon");
    if (sun && moon) {
      if (theme === "dark") {
        sun.classList.remove("hidden");
        moon.classList.add("hidden");
      } else {
        sun.classList.add("hidden");
        moon.classList.remove("hidden");
      }
    }
  }

  function getInitialTheme() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  var currentTheme = getInitialTheme();
  applyTheme(currentTheme);

  /* ---------------- Preloader ----------------
     Hidden only once every <img> on the page (including lazy-loaded
     gallery/hover photos) has actually finished loading — not just
     window.load, which doesn't wait for loading="lazy" images. We
     temporarily force those to load eagerly so the preloader's wait is
     real, then leave loading="lazy" in place for anyone with JS off.
     A hard-cap timeout guarantees it can never get stuck open if a
     single image stalls or 404s. */
  (function () {
    var preloader = document.getElementById("preloader");
    if (!preloader) return;
    var hidden = false;
    function hidePreloader() {
      if (hidden) return;
      hidden = true;
      preloader.classList.add("preloader-hidden");
      window.setTimeout(function () {
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
      }, 600);
    }

    function whenAllImagesLoaded() {
      var imgs = Array.prototype.slice.call(document.images);
      if (!imgs.length) return Promise.resolve();
      imgs.forEach(function (img) {
        if (img.loading === "lazy") img.loading = "eager";
      });
      var pending = imgs.map(function (img) {
        if (img.complete) return Promise.resolve();
        return new Promise(function (resolve) {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      });
      return Promise.all(pending);
    }

    document.addEventListener("DOMContentLoaded", function () {
      whenAllImagesLoaded().then(hidePreloader);
    });
    window.setTimeout(hidePreloader, 6000); // hard cap
  })();

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        currentTheme = root.classList.contains("dark") ? "light" : "dark";
        applyTheme(currentTheme);
        localStorage.setItem(STORAGE_KEY, currentTheme);
      });
    }

    /* Respect OS changes only if the user hasn't explicitly chosen */
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });

    /* ---------------- Mobile hamburger menu ---------------- */
    var hamburger = document.getElementById("hamburger-btn");
    var mobileMenu = document.getElementById("mobile-menu");
    if (hamburger && mobileMenu) {
      hamburger.addEventListener("click", function () {
        var expanded = hamburger.getAttribute("aria-expanded") === "true";
        hamburger.setAttribute("aria-expanded", String(!expanded));
        mobileMenu.classList.toggle("open");
        document.getElementById("icon-hamburger").classList.toggle("hidden");
        document.getElementById("icon-close").classList.toggle("hidden");
      });

      /* close mobile menu after a link is tapped */
      mobileMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          mobileMenu.classList.remove("open");
          hamburger.setAttribute("aria-expanded", "false");
          document.getElementById("icon-hamburger").classList.remove("hidden");
          document.getElementById("icon-close").classList.add("hidden");
        });
      });
    }

    /* ---------------- Scroll-spy for nav links ---------------- */
    var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));

    function setActiveLink(id) {
      navLinks.forEach(function (link) {
        var isActive = link.getAttribute("href") === "#" + id;
        link.classList.toggle("active", isActive);
        link.classList.toggle("text-primary", isActive);
      });
    }

    if ("IntersectionObserver" in window && sections.length) {
      var spyObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              setActiveLink(entry.target.id);
            }
          });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach(function (s) { spyObserver.observe(s); });
    }

    /* ---------------- Scroll-reveal animations ----------------
       Belt-and-suspenders: a too-eager negative rootMargin or a
       timing race with web-font loading could otherwise leave
       above-the-fold content (hero heading, stat counters, button
       labels) stuck at opacity:0 forever, which reads as "invisible
       text" rather than a missing animation. Fixed with (a) a more
       forgiving observer, (b) an immediate check for anything
       already in the viewport at load, and (c) a hard timeout that
       force-reveals everything regardless, so nothing can stay
       permanently hidden. */
    var revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
    if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0, rootMargin: "0px 0px -10% 0px" }
      );
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }
    // Safety net: whatever hasn't revealed itself within 1.2s (observer
    // miss, slow font swap, etc.) is force-shown so content is never lost.
    setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }, 1200);

    /* ---------------- Animated number counters ----------------
       Counts up from 0 to data-target once the stat card scrolls into
       view, formatting with thousands separators and re-appending the
       original suffix (+, X, etc). Runs once per element. */
    var counters = document.querySelectorAll(".counter[data-target]");
    function animateCounter(el) {
      var target = parseInt(el.getAttribute("data-target"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1400;
      var start = null;
      function tick(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        var value = Math.round(target * eased);
        el.textContent = value.toLocaleString("en-US") + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(tick);
        } else {
          el.textContent = target.toLocaleString("en-US") + suffix;
        }
      }
      window.requestAnimationFrame(tick);
    }
    if ("IntersectionObserver" in window && counters.length) {
      var counterObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) { counterObserver.observe(el); });
    } else {
      counters.forEach(function (el) {
        var target = parseInt(el.getAttribute("data-target"), 10) || 0;
        el.textContent = target.toLocaleString("en-US") + (el.getAttribute("data-suffix") || "");
      });
    }

    /* ---------------- Skill radial progress fill on view ---------------- */
    var radials = document.querySelectorAll(".radial-progress .value-circle");
    if ("IntersectionObserver" in window && radials.length) {
      var radialObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var el = entry.target;
              var pct = parseFloat(el.getAttribute("data-pct")) || 0;
              var r = parseFloat(el.getAttribute("r"));
              var circumference = 2 * Math.PI * r;
              var offset = circumference * (1 - pct / 100);
              el.style.strokeDasharray = circumference.toFixed(2);
              el.style.strokeDashoffset = offset.toFixed(2);
              obs.unobserve(el);
            }
          });
        },
        { threshold: 0.4 }
      );
      radials.forEach(function (el) { radialObserver.observe(el); });
    }

    /* ---------------- Skill linear-bar fill on view ---------------- */
    var skillBars = document.querySelectorAll(".skill-bar-fill[data-width]");
    if ("IntersectionObserver" in window && skillBars.length) {
      var skillBarObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.style.width = entry.target.getAttribute("data-width") + "%";
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      skillBars.forEach(function (el) { skillBarObserver.observe(el); });
    } else {
      skillBars.forEach(function (el) { el.style.width = el.getAttribute("data-width") + "%"; });
    }

    /* ---------------- Sticky header shadow on scroll ---------------- */
    var header = document.getElementById("site-header");
    function onScroll() {
      if (!header) return;
      if (window.scrollY > 12) {
        header.classList.add("shadow-lg");
      } else {
        header.classList.remove("shadow-lg");
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------------- Experience hover-preview card ----------------
       Desktop/hover-capable devices only: a small themed card trails the
       cursor while hovering a role/company block in the Experience
       timeline, swapping its gradient/icon/label per entry and
       fading + scaling in on enter, out on leave. */
    (function () {
      var triggers = Array.prototype.slice.call(document.querySelectorAll(".exp-trigger"));
      if (!triggers.length) return;
      var canHoverFine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      if (canHoverFine) {
        var card = document.getElementById("exp-hover-card");
        var cardImg = document.getElementById("exp-hover-card-img");
        var cardLabel = document.getElementById("exp-hover-card-label");
        if (!card || !cardImg || !cardLabel) return;

        var OFFSET_X = 38, OFFSET_Y = -78; // card sits up and to the right of the cursor
        var mouseX = 0, mouseY = 0, curX = 0, curY = 0, active = false, primed = false;

        function render() {
          curX += (mouseX - curX) * 0.16;
          curY += (mouseY - curY) * 0.16;
          var scale = active ? 1 : 0.85;
          var rotate = active ? -2 : -5;
          card.style.transform =
            "translate(" + (curX + OFFSET_X) + "px, " + (curY + OFFSET_Y) + "px) " +
            "translate(-50%, -50%) scale(" + scale + ") rotate(" + rotate + "deg)";
          window.requestAnimationFrame(render);
        }
        window.requestAnimationFrame(render);

        triggers.forEach(function (trigger) {
          trigger.addEventListener("mouseenter", function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!primed) { curX = mouseX; curY = mouseY; primed = true; }
            active = true;
            card.classList.add("is-visible");
            var imgSrc = trigger.getAttribute("data-img");
            if (imgSrc && cardImg.getAttribute("src") !== imgSrc) cardImg.src = imgSrc;
            cardLabel.textContent = trigger.getAttribute("data-company") || "";
          });
          trigger.addEventListener("mousemove", function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
          });
          trigger.addEventListener("mouseleave", function () {
            active = false;
            card.classList.remove("is-visible");
          });
        });
      }
      // Touch/coarse-pointer devices get each entry's own flow-through
      // photo instead (see the .exp-flow-img block below) — nothing to
      // wire up here.
    })();

    /* ---------------- Experience flow-through photo (mobile only) ----------------
       Each entry's own photo (above its own text, see CSS) sweeps across
       purely as a function of THAT entry's own scroll position — off-screen
       on one side when the entry is about to enter the viewport, covering
       and revealing the text as it crosses, off-screen the other side as
       it leaves. Direction alternates per entry (1st left→right, 2nd
       right→left, ...) via each .exp-flow-img-wrap's data-direction, and
       progress is mapped 1:1 to scroll distance across the entry's full
       transit through the viewport. Driven continuously by scroll (no
       click/tap), reusing the same data-img attribute the
       desktop hover card already reads off each .exp-trigger — no
       duplicated content. */
    (function () {
      var wraps = Array.prototype.slice.call(document.querySelectorAll(".exp-flow-img-wrap"));
      var reduceMotionExp = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!wraps.length || reduceMotionExp) return;
      var items = wraps.map(function (wrap) {
        return {
          el: wrap.parentElement,
          img: wrap.querySelector("img"),
          sign: wrap.getAttribute("data-direction") === "rtl" ? -1 : 1
        };
      }).filter(function (it) { return it.el && it.img; });
      if (!items.length) return;

      var ticking = false;
      function update() {
        ticking = false;
        var vh = window.innerHeight;
        items.forEach(function (it) {
          var rect = it.el.getBoundingClientRect();
          if (rect.bottom < -100 || rect.top > vh + 100) return; // skip offscreen work
          // progress: 0 when the entry is just entering from the bottom of
          // the viewport, 1 when it has fully exited the top — mapped 1:1
          // to scroll distance (no artificial speed-up).
          var progress = (vh - rect.top) / (vh + rect.height);
          progress = Math.max(0, Math.min(1, progress));
          var pct = (progress * 2 - 1) * 160 * it.sign; // -160%..+160% of the image's own width
          it.img.style.transform = "translateX(" + pct.toFixed(1) + "%)";
        });
      }
      function requestUpdate() {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      }
      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", requestUpdate);
      update();
    })();

    /* ---------------- Services accordion (mobile only via CSS) ----------------
       The header is a real <button>, so this works regardless of viewport;
       the CSS above is what actually restricts the collapse/expand visuals
       to screens under md — at md+ the body is always shown and the
       chevron is hidden, so this JS is a no-op there beyond toggling an
       unused class. */
    var serviceCards = Array.prototype.slice.call(document.querySelectorAll(".service-card:not(.service-card--pinned-open)"));
    serviceCards.forEach(function (card) {
      var header = card.querySelector(".service-card-header");
      if (!header) return;
      header.addEventListener("click", function () {
        card.classList.toggle("is-open");
      });
    });

    /* ---------------- Gallery parallax ----------------
       Each .parallax-img is 130% the height of its cropped frame; on scroll
       we slide it vertically based on how far the tile's center is from the
       viewport center, so photos drift at a slightly different speed than
       the page — always staying fully inside the frame, never showing an
       empty edge. */
    var parallaxImgs = Array.prototype.slice.call(document.querySelectorAll(".parallax-img"));
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var parallaxTicking = false;

    function updateParallax() {
      parallaxTicking = false;
      var vh = window.innerHeight;
      parallaxImgs.forEach(function (img) {
        var rect = img.parentElement.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return; // skip offscreen work
        var center = rect.top + rect.height / 2;
        // Drift proportional to how far the tile center is from the viewport
        // center, scaled by the tile's own height (frame has 15% slack top
        // and bottom, i.e. up to ~30% of height available to move within).
        var travel = ((center - vh / 2) / (vh / 2)); // -1 (top) .. 1 (bottom)
        var offset = travel * rect.height * 0.14;
        img.style.transform = "translateY(" + offset.toFixed(1) + "px)";
      });
    }
    function requestParallax() {
      if (!parallaxTicking) {
        parallaxTicking = true;
        window.requestAnimationFrame(updateParallax);
      }
    }
    if (parallaxImgs.length && !reduceMotion) {
      window.addEventListener("scroll", requestParallax, { passive: true });
      window.addEventListener("resize", requestParallax);
      updateParallax();
    }

    /* ---------------- Gallery lightbox ---------------- */
    var lightbox = document.getElementById("lightbox");
    var lightboxImg = document.getElementById("lightbox-img");
    var lightboxCaption = document.getElementById("lightbox-caption");
    var lightboxClose = document.getElementById("lightbox-close");
    var galleryTiles = document.querySelectorAll(".gallery-tile[data-full]");

    function openLightbox(src, caption) {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = src;
      lightboxImg.alt = caption || "";
      if (lightboxCaption) lightboxCaption.textContent = caption || "";
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    }
    galleryTiles.forEach(function (tile) {
      tile.setAttribute("tabindex", "0");
      tile.setAttribute("role", "button");
      tile.addEventListener("click", function () {
        openLightbox(tile.getAttribute("data-full"), tile.getAttribute("data-caption"));
      });
      tile.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(tile.getAttribute("data-full"), tile.getAttribute("data-caption"));
        }
      });
    });
    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightbox) {
      lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) closeLightbox();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });

    /* ---------------- Footer year ---------------- */
    var yearEl = document.getElementById("current-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------------- Contact form (Formspree) ---------------- */
    var form = document.getElementById("contact-form");
    var formStatus = document.getElementById("form-status");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var submitBtn = form.querySelector('button[type="submit"]');
        var originalBtnHTML = submitBtn ? submitBtn.innerHTML : "";
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.classList.add("opacity-60", "cursor-not-allowed");
          submitBtn.textContent = "Sending…";
        }
        function showStatus(text) {
          if (!formStatus) return;
          formStatus.textContent = text;
          formStatus.classList.remove("hidden");
        }
        fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        })
          .then(function (response) {
            if (response.ok) {
              showStatus("Thanks! Your message has been sent — I typically get back within a weekend.");
              form.reset();
            } else {
              return response.json().then(function (data) {
                var msg = data && data.errors && data.errors.length ? data.errors.map(function (er) { return er.message; }).join(", ") : "Something went wrong. Please try emailing me directly instead.";
                showStatus(msg);
              });
            }
          })
          .catch(function () {
            showStatus("Network error — please try again, or email me directly at ghorai.soumyadip33@gmail.com.");
          })
          .finally(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.classList.remove("opacity-60", "cursor-not-allowed");
              submitBtn.innerHTML = originalBtnHTML;
            }
          });
      });
    }
  });
})();
