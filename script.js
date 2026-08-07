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
     Hidden once the page's critical resources (hero image, fonts) have
     loaded via window.load, with a hard-cap timeout so a slow/broken
     asset can never leave it stuck on screen. */
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
    window.addEventListener("load", hidePreloader);
    window.setTimeout(hidePreloader, 3500); // hard cap
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
