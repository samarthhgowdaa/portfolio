/**
 * Samarth Gowda — Cyberdeck Aerospace Operating System (SG-OS v3.4)
 * Theme engine, Silicon Architecture explorer, Interactive Pinout HUD,
 * Ambient circuit bus canvas, and project telemetry filters.
 */
(function () {
  'use strict';

  var root = document.documentElement;

  // ============================================================
  // Multi-Palette Cyber Themes
  // ============================================================
  var swatches = Array.prototype.slice.call(document.querySelectorAll('.swatch-btn[data-theme-choice]'));

  var THEMES = {
    'petrol-teal':     '#081721',
    'moon-slate':      '#161c22',
    'cyber-marine':    '#181a36',
    'retro-artsy':     '#15161c',
    'obsidian-copper': '#0e1013',
    'parchment-light': '#faf8f5'
  };

  function applyTheme(themeName) {
    if (!THEMES[themeName]) themeName = 'petrol-teal';
    root.dataset.theme = themeName;

    swatches.forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.themeChoice === themeName);
    });

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', THEMES[themeName]);
    }
  }

  // Restore saved theme or default to petrol-teal
  var savedTheme = null;
  try { savedTheme = localStorage.getItem('sg_theme'); } catch (e) {}
  applyTheme(savedTheme || 'petrol-teal');

  swatches.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var choice = btn.dataset.themeChoice;
      applyTheme(choice);
      try { localStorage.setItem('sg_theme', choice); } catch (e) {}
      if (window.SG_SFX) window.SG_SFX.playChirp(1200, 0.04);
    });
  });

  // ============================================================
  // Silicon Architecture Stack Layer Explorer
  // ============================================================
  var stackTabs = Array.prototype.slice.call(document.querySelectorAll('.stack-tab-btn'));
  var stackPanels = Array.prototype.slice.call(document.querySelectorAll('.stack-panel'));

  if (stackTabs.length && stackPanels.length) {
    stackTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var layerId = tab.dataset.stackLayer;

        stackTabs.forEach(function (t) {
          t.classList.toggle('is-active', t === tab);
          t.setAttribute('aria-selected', String(t === tab));
        });

        stackPanels.forEach(function (panel) {
          var isMatch = panel.id === 'layer-' + layerId;
          panel.classList.toggle('is-active', isMatch);
          panel.hidden = !isMatch;
        });

        if (window.SG_SFX) window.SG_SFX.playChirp(900, 0.03);
      });
    });
  }

  // ============================================================
  // Microprocessor Pinout HUD Hover
  // ============================================================
  var chipPins = Array.prototype.slice.call(document.querySelectorAll('.chip-pin'));
  var pinTooltip = document.getElementById('pin-tooltip');

  if (pinTooltip) {
    chipPins.forEach(function (pin) {
      pin.addEventListener('mouseenter', function (e) {
        var name = pin.dataset.pinName || 'PIN';
        var func = pin.dataset.pinFunc || 'GPIO';
        pinTooltip.innerHTML = '<b>' + name + '</b>: <span>' + func + '</span>';
        pinTooltip.style.opacity = '1';
        if (window.SG_SFX) window.SG_SFX.playTerminalKey();
      });

      pin.addEventListener('mousemove', function (e) {
        var rect = pin.closest('.chip-diagram').getBoundingClientRect();
        pinTooltip.style.left = (e.clientX - rect.left + 12) + 'px';
        pinTooltip.style.top = (e.clientY - rect.top - 28) + 'px';
      });

      pin.addEventListener('mouseleave', function () {
        pinTooltip.style.opacity = '0';
      });
    });
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
        if (window.SG_SFX) window.SG_SFX.playChirp(800, 0.03);
      });
    });
  }

  // ============================================================
  // Mobile Navigation Drawer
  // ============================================================
  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('nav');

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
      var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
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
  // Ambient Circuit Bus Matrix (Canvas)
  // ============================================================
  var bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas) {
    var bgCtx = bgCanvas.getContext('2d');
    var w = 0;
    var h = 0;
    var pulses = [];
    var maxPulses = 14;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resizeBg() {
      w = bgCanvas.width = window.innerWidth;
      h = bgCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeBg);
    resizeBg();

    var gridSize = 48;

    function spawnPulse() {
      if (pulses.length >= maxPulses) return;
      var isHorizontal = Math.random() > 0.5;
      var x = Math.floor(Math.random() * (w / gridSize)) * gridSize;
      var y = Math.floor(Math.random() * (h / gridSize)) * gridSize;
      pulses.push({
        x: x,
        y: y,
        vx: isHorizontal ? (Math.random() > 0.5 ? 1.4 : -1.4) : 0,
        vy: !isHorizontal ? (Math.random() > 0.5 ? 1.4 : -1.4) : 0,
        length: Math.floor(Math.random() * 25) + 20,
        life: 0,
        maxLife: Math.floor(Math.random() * 120) + 70
      });
    }

    function renderBg() {
      bgCtx.clearRect(0, 0, w, h);

      var isDark = root.dataset.theme !== 'parchment-light' && root.dataset.theme !== 'light';
      var style = getComputedStyle(root);
      var accent = style.getPropertyValue('--accent').trim() || '#00f0ff';

      // Corner crosshairs & dots
      bgCtx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';
      for (var gx = 0; gx < w; gx += gridSize) {
        for (var gy = 0; gy < h; gy += gridSize) {
          bgCtx.fillRect(gx - 0.75, gy - 0.75, 1.5, 1.5);
        }
      }

      // Moving electrical pulses
      if (!prefersReduced) {
        if (Math.random() < 0.09) spawnPulse();

        bgCtx.strokeStyle = accent;
        for (var p = pulses.length - 1; p >= 0; p--) {
          var pulse = pulses[p];
          pulse.x += pulse.vx;
          pulse.y += pulse.vy;
          pulse.life++;

          var fade = Math.sin((pulse.life / pulse.maxLife) * Math.PI);
          bgCtx.globalAlpha = Math.max(0, fade * (isDark ? 0.28 : 0.18));
          bgCtx.lineWidth = 1.5;

          bgCtx.beginPath();
          bgCtx.moveTo(pulse.x, pulse.y);
          bgCtx.lineTo(pulse.x - pulse.vx * pulse.length, pulse.y - pulse.vy * pulse.length);
          bgCtx.stroke();

          // Glowing packet head
          bgCtx.fillStyle = accent;
          bgCtx.beginPath();
          bgCtx.arc(pulse.x, pulse.y, 2, 0, Math.PI * 2);
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
