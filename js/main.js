/**
 * Samarth Gowda — Modern Portfolio Main Logic
 * Light/Dark theme switcher, scrollspy, interactive project filters,
 * mobile drawer, and ambient hardware signal matrix.
 */
(function () {
  'use strict';

  var root = document.documentElement;

  // ============================================================
  // Light / Dark Theme Switcher (Defaults to System Theme)
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
      themeLabel.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    }
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
      themeToggle.setAttribute('title', 'Switch to ' + (theme === 'dark' ? 'Light' : 'Dark') + ' Mode');
    }

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#081721' : '#faf8f5');
    }
  }

  // Initial theme resolution: saved theme or system preference
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

  // Listen to system preference changes if user hasn't set an explicit preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
      if (!localStorage.getItem('sg_theme')) {
        applyTheme(e.matches ? 'light' : 'dark');
      }
    });
  }

  // ============================================================
  // Mobile Navigation Drawer
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
  // Scrollspy (Active Section Tracker)
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
  // Project Category Filters
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

  // ============================================================
  // Ambient Hardware Trace Matrix
  // ============================================================
  var bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas) {
    var bgCtx = bgCanvas.getContext('2d');
    var w = 0;
    var h = 0;
    var pulses = [];
    var maxPulses = 12;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resizeBg() {
      w = bgCanvas.width = window.innerWidth;
      h = bgCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeBg);
    resizeBg();

    var gridSize = 42;

    function spawnPulse() {
      if (pulses.length >= maxPulses) return;
      var isHorizontal = Math.random() > 0.5;
      var x = Math.floor(Math.random() * (w / gridSize)) * gridSize;
      var y = Math.floor(Math.random() * (h / gridSize)) * gridSize;
      pulses.push({
        x: x,
        y: y,
        vx: isHorizontal ? (Math.random() > 0.5 ? 1.2 : -1.2) : 0,
        vy: !isHorizontal ? (Math.random() > 0.5 ? 1.2 : -1.2) : 0,
        length: Math.floor(Math.random() * 20) + 16,
        life: 0,
        maxLife: Math.floor(Math.random() * 120) + 80
      });
    }

    function renderBg() {
      bgCtx.clearRect(0, 0, w, h);

      var isDark = root.dataset.theme !== 'parchment-light' && root.dataset.theme !== 'light';
      var style = getComputedStyle(root);
      var accent = style.getPropertyValue('--accent').trim() || '#148d8d';

      // Grid intersection dots
      bgCtx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';
      for (var gx = 0; gx < w; gx += gridSize) {
        for (var gy = 0; gy < h; gy += gridSize) {
          bgCtx.fillRect(gx - 0.75, gy - 0.75, 1.5, 1.5);
        }
      }

      // Moving pulses
      if (!prefersReduced) {
        if (Math.random() < 0.08) spawnPulse();

        bgCtx.strokeStyle = accent;
        for (var p = pulses.length - 1; p >= 0; p--) {
          var pulse = pulses[p];
          pulse.x += pulse.vx;
          pulse.y += pulse.vy;
          pulse.life++;

          var fade = Math.sin((pulse.life / pulse.maxLife) * Math.PI);
          bgCtx.globalAlpha = Math.max(0, fade * (isDark ? 0.24 : 0.16));
          bgCtx.lineWidth = 1.4;

          bgCtx.beginPath();
          bgCtx.moveTo(pulse.x, pulse.y);
          bgCtx.lineTo(pulse.x - pulse.vx * pulse.length, pulse.y - pulse.vy * pulse.length);
          bgCtx.stroke();

          bgCtx.fillStyle = accent;
          bgCtx.beginPath();
          bgCtx.arc(pulse.x, pulse.y, 1.8, 0, Math.PI * 2);
          bgCtx.fill();

          if (pulse.life >= pulse.maxLife || pulse.x < 0 || pulse.x > w || pulse.y < 0 || pulse.y > h) {
            pulses.splice(p, 1);
          }
        }
        bgCtx.globalAlpha = 1.0;
      }

      requestAnimationFrame(renderBg);
    }

    renderBg();
  }
})();
