/**
 * Samarth Gowda — Portfolio Main Logic
 * Theme Switcher (v2.elejeune.me style), native scrollspy, and project filters.
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
  // 3. Scrollspy (Active Section Navigation Tracker)
  // ============================================================
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('a[data-nav]'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length) {
    var ticking = false;

    function syncScrollspy() {
      ticking = false;
      var triggerLine = window.innerHeight * 0.32;
      var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
      var activeSection = atBottom ? sections[sections.length - 1] : sections[0];

      if (!atBottom) {
        for (var i = 0; i < sections.length; i++) {
          if (sections[i].getBoundingClientRect().top <= triggerLine) {
            activeSection = sections[i];
          }
        }
      }

      navLinks.forEach(function (link) {
        var isCurrent = link.getAttribute('href') === '#' + activeSection.id;
        link.classList.toggle('is-current', isCurrent);
      });
    }

    function requestScrollspy() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(syncScrollspy);
    }

    window.addEventListener('scroll', requestScrollspy, { passive: true });
    window.addEventListener('resize', requestScrollspy);
    syncScrollspy();
  }

  // ============================================================
  // 4. Project Category Filters
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
