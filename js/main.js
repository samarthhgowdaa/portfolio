/**
 * Samarth Gowda — Portfolio Main Logic
 * Theme Switcher (v2.elejeune.me style), smooth anchor navigation,
 * IntersectionObserver scrollspy, discrete wheel momentum lerp, and project filters.
 */
(function () {
  'use strict';

  var root = document.documentElement;

  // ============================================================
  // 1. Light / Dark Theme Switcher (Defaults to System Theme)
  // ============================================================
  var themeToggle = document.getElementById('theme-toggle');
  var themeLabel  = document.getElementById('theme-label');

  function getSystemTheme() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
      ? 'light'
      : 'dark';
  }

  function applyTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') theme = 'dark';
    root.dataset.theme = theme;

    if (themeLabel) {
      themeLabel.textContent = (theme === 'dark') ? 'Dark' : 'Light';
    }
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
      themeToggle.setAttribute('title', 'Switch to ' + (theme === 'dark' ? 'Light' : 'Dark') + ' theme');
    }

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#0d0e12' : '#f5f3ee');
    }
  }

  // Initial theme resolution: saved preference or system preference
  var savedTheme = null;
  try { savedTheme = localStorage.getItem('sg_theme'); } catch (e) {}
  applyTheme(savedTheme || getSystemTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = (root.dataset.theme === 'light') ? 'light' : 'dark';
      var next = (current === 'dark') ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('sg_theme', next); } catch (e) {}
    });
  }

  // Auto-respond to system preference changes if user hasn't explicitly locked one
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
      if (!localStorage.getItem('sg_theme')) {
        applyTheme(e.matches ? 'light' : 'dark');
      }
    });
  }

  // ============================================================
  // 2. Mobile Navigation Drawer
  // ============================================================
  var navToggle = document.getElementById('nav-toggle');
  var nav       = document.getElementById('nav');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a[data-nav]')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  // ============================================================
  // 3. Smooth Anchor Navigation & IntersectionObserver Scrollspy
  // ============================================================
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('a[data-nav]'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  // Smooth scroll handler for all internal anchor links
  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    var targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;
    var targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();
    closeNav();

    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (history.pushState) {
      history.pushState(null, '', targetId);
    }
  });

  // Zero-reflow IntersectionObserver scrollspy
  if (sections.length && 'IntersectionObserver' in window) {
    var activeId = sections[0].id;

    function updateActiveNav(id) {
      if (!id || id === activeId) return;
      activeId = id;
      navLinks.forEach(function (link) {
        link.classList.toggle('is-current', link.getAttribute('href') === '#' + id);
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          updateActiveNav(entry.target.id);
        }
      });
    }, {
      root: null,
      rootMargin: '-18% 0px -70% 0px',
      threshold: 0
    });

    sections.forEach(function (sec) { observer.observe(sec); });

    // Edge check: Top of page and bottom of page
    window.addEventListener('scroll', function () {
      if (window.scrollY < 40) {
        updateActiveNav(sections[0].id);
      } else if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 16) {
        updateActiveNav(sections[sections.length - 1].id);
      }
    }, { passive: true });
  }

  // ============================================================
  // 4. Silky Smooth Momentum Scroll Engine (Desktop Wheel)
  // ============================================================
  (function initSmoothWheel() {
    // Respect user motion preference & touch environments
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ('ontouchstart' in window && !window.matchMedia('(pointer: fine)').matches) return;

    var currentY = window.scrollY;
    var targetY  = window.scrollY;
    var isRunning = false;
    var dampening = 0.10; // Ease factor

    function getMaxScroll() {
      return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }

    function lerpLoop() {
      var diff = targetY - currentY;
      if (Math.abs(diff) < 0.6) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        isRunning = false;
        return;
      }

      currentY += diff * dampening;
      window.scrollTo(0, currentY);
      requestAnimationFrame(lerpLoop);
    }

    window.addEventListener('wheel', function (e) {
      // Allow pinch-to-zoom and horizontal trackpad gestures
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      // Detect discrete mouse wheel notches (lines mode or integer steps >= 40px)
      // Continuous precision trackpads emit small fractional pixel values
      var isLineMode = e.deltaMode === 1;
      var isDiscreteStep = (e.deltaMode === 0 && Math.abs(e.deltaY) >= 40 && Number.isInteger(e.deltaY));

      if (!isLineMode && !isDiscreteStep) {
        // Trackpad or precision device — let browser handle native 120Hz gesture physics
        currentY = targetY = window.scrollY;
        return;
      }

      e.preventDefault();

      var delta = isLineMode ? e.deltaY * 34 : e.deltaY * 1.05;
      var maxScroll = getMaxScroll();

      if (!isRunning) {
        currentY = window.scrollY;
        targetY  = window.scrollY;
      }

      targetY = Math.max(0, Math.min(maxScroll, targetY + delta));

      if (!isRunning) {
        isRunning = true;
        requestAnimationFrame(lerpLoop);
      }
    }, { passive: false });

    // Sync state on user scrollbar drag or keyboard navigation
    window.addEventListener('scroll', function () {
      if (!isRunning) {
        currentY = targetY = window.scrollY;
      }
    }, { passive: true });

    window.addEventListener('resize', function () {
      currentY = targetY = window.scrollY;
    });
  })();

  // ============================================================
  // 5. Project Category Filters
  // ============================================================
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('#project-grid .card'));
  var emptyMsg = document.getElementById('grid-empty');

  if (chips.length && cards.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var filterCategory = chip.dataset.filter;
        var visibleCount = 0;

        chips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });

        cards.forEach(function (card) {
          var cardCategory = card.dataset.category;
          var matches = filterCategory === 'all' || cardCategory === filterCategory;
          card.hidden = !matches;
          if (matches) visibleCount++;
        });

        if (emptyMsg) emptyMsg.hidden = visibleCount > 0;
      });
    });
  }
})();
