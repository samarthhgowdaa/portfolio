/**
 * Samarth Gowda — Portfolio Main Logic
 * Theme Switcher (v2.elejeune.me style), scrollspy, project filters,
 * and animated pixel-art electronic components canvas engine.
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

  // ============================================================
  // 5. Pixel Art Electronic Components Background Engine
  // ============================================================
  var bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas) {
    var bgCtx = bgCanvas.getContext('2d');
    var w = 0;
    var h = 0;
    var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Sprite 1: DIP-10 Microchip / IC with notch and pin 1 dot
    var SPRITE_IC = [
      "  #  #  #  #  #  ",
      "+###############+",
      "|#.............#|",
      "|#..o..........#|",
      "(#.............#|",
      "|#.............#|",
      "+###############+",
      "  #  #  #  #  #  "
    ];

    // Sprite 2: Raspberry Pi / Microcontroller Dev Board
    var SPRITE_PI = [
      "+#################+",
      "|#o.............##|",
      "|#..##.##.##.##.##|",
      "|#..##.##.##.##..#|",
      "|#...............#|++",
      "|#.....####......#|++",
      "|#.....#oo#......#|  ",
      "|#.....#oo#......#|++",
      "|#.....####......#|++",
      "|#...............#|  ",
      "|#o.............o#|  ",
      "+#################+",
      "   ####   ####     "
    ];

    // Sprite 3: Axial Resistor with color bands
    var SPRITE_RESISTOR = [
      "        .#####.        ",
      "       +#######+       ",
      "-------|#.#.#.#|-------",
      "-------|#.#.#.#|-------",
      "-------|#.#.#.#|-------",
      "       +#######+       ",
      "        .#####.        "
    ];

    // Sprite 4: Polarized Electrolytic Capacitor
    var SPRITE_CAP_ELECTRO = [
      "  .#######.  ",
      " +#########+ ",
      " |#--.....#| ",
      " |#--.....#| ",
      " |#--.....#| ",
      " |#--.....#| ",
      " |#--.....#| ",
      " +#########+ ",
      "  .#######.  ",
      "    |   |    ",
      "    |   |    ",
      "    |   |    ",
      "    |        "
    ];

    // Sprite 5: Ceramic Disc Capacitor "104" (100nF)
    var SPRITE_CAP_CERAMIC = [
      "   .#####.   ",
      "  +#######+  ",
      " |#.......#| ",
      " |#..104..#| ",
      " |#.......#| ",
      "  +#######+  ",
      "   .#####.   ",
      "    |   |    ",
      "    \\   /    ",
      "     | |     ",
      "     | |     "
    ];

    // Sprite 6: 5mm Dome LED Diode
    var SPRITE_LED = [
      "   .#####.   ",
      "  +#######+  ",
      " |#.......#| ",
      " |#...o...#| ",
      " |#..ooo..#| ",
      " |#.......#| ",
      "+###########+",
      "+###########+",
      "    |   |    ",
      "    |   |    ",
      "    |   |    ",
      "    |        "
    ];

    // Sprite 7: TO-92 Transistor (3 leads: E, B, C)
    var SPRITE_TRANSISTOR = [
      "  .#######.  ",
      " +#########+ ",
      " |#.......#| ",
      "+###########+",
      "|###########|",
      "+###########+",
      "   |  |  |   ",
      "   |  |  |   ",
      "   |  |  |   ",
      "   |  |  |   "
    ];

    // Sprite 8: HC-49 Crystal Oscillator (16MHz)
    var SPRITE_CRYSTAL = [
      " .#############. ",
      "+###############+",
      "|#.............#|",
      "|#...16.000....#|",
      "|#.............#|",
      "+###############+",
      " .#############. ",
      "    |       |    ",
      "    |       |    ",
      "    |       |    "
    ];

    // Sprite 9: Digital Logic AND Gate
    var SPRITE_GATE = [
      "                  ",
      "---#####          ",
      "   #....####      ",
      "   #........##    ",
      "   #..........#   ",
      "   #...........#--",
      "   #..........#   ",
      "   #........##    ",
      "   #....####      ",
      "---#####          ",
      "                  "
    ];

    // Sprite 10: Retro CRT Terminal Display
    var SPRITE_CRT = [
      "+###############+",
      "|#+-----------+#|",
      "|#| >_        |#|",
      "|#|           |#|",
      "|#|           |#|",
      "|#+-----------+#|",
      "+###############+",
      "      #####      ",
      "     #######     ",
      "    #########    "
    ];

    var RAW_SPRITES = [
      SPRITE_IC,
      SPRITE_PI,
      SPRITE_RESISTOR,
      SPRITE_CAP_ELECTRO,
      SPRITE_CAP_CERAMIC,
      SPRITE_LED,
      SPRITE_TRANSISTOR,
      SPRITE_CRYSTAL,
      SPRITE_GATE,
      SPRITE_CRT
    ];

    // Pre-compile sprites into coordinate lists for 60fps rendering without string allocations
    function compileSprite(rows) {
      var width = 0;
      var height = rows.length;
      var primary = [];
      var fill = [];
      var accent = [];

      for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        if (row.length > width) width = row.length;
        for (var c = 0; c < row.length; c++) {
          var ch = row[c];
          if (ch === ' ') continue;
          if (ch === 'o' || (ch >= '0' && ch <= '9') || ch === '>' || ch === '_') {
            accent.push([c, r]);
          } else if (ch === '.') {
            fill.push([c, r]);
          } else {
            primary.push([c, r]);
          }
        }
      }

      return {
        width: width,
        height: height,
        primary: primary,
        fill: fill,
        accent: accent
      };
    }

    var COMPILED_SPRITES = RAW_SPRITES.map(compileSprite);

    // Particles system
    var components = [];

    function initParticles() {
      components = [];
      var count = Math.min(22, Math.max(12, Math.floor(w / 70)));
      var baseScale = (w < 640) ? 1.75 : 2.2;

      for (var i = 0; i < count; i++) {
        components.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -0.16 - Math.random() * 0.24,
          phase: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.008 + Math.random() * 0.012,
          wobbleAmp: 6 + Math.random() * 10,
          spriteIndex: i % COMPILED_SPRITES.length,
          scale: baseScale,
          alpha: 0.35 + Math.random() * 0.25
        });
      }
    }

    function resizeBg() {
      w = bgCanvas.width = window.innerWidth;
      h = bgCanvas.height = window.innerHeight;
      initParticles();
    }
    window.addEventListener('resize', resizeBg);
    resizeBg();

    function renderBg() {
      bgCtx.clearRect(0, 0, w, h);

      // In Dark mode (black bg): white components. In Light mode (white bg): black components.
      var isDark = (root.dataset.theme !== 'light');
      var rgb = isDark ? '255, 255, 255' : '0, 0, 0';

      // Subtle PCB perfboard dot grid in backdrop
      var dotSpacing = 44;
      bgCtx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.028)' : 'rgba(0, 0, 0, 0.035)';
      for (var gx = dotSpacing / 2; gx < w; gx += dotSpacing) {
        for (var gy = dotSpacing / 2; gy < h; gy += dotSpacing) {
          bgCtx.fillRect(Math.round(gx - 1), Math.round(gy - 1), 2, 2);
        }
      }

      // Render pixel-art electronics components
      for (var i = 0; i < components.length; i++) {
        var comp = components[i];

        if (!prefersReduced) {
          comp.x += comp.vx;
          comp.y += comp.vy;
          comp.phase += comp.wobbleSpeed;

          var spr = COMPILED_SPRITES[comp.spriteIndex];
          var sprW = spr.width * comp.scale;
          var sprH = spr.height * comp.scale;

          // Wrap screen boundaries seamlessly
          if (comp.y < -sprH - 30) {
            comp.y = h + 30;
            comp.x = Math.random() * w;
          } else if (comp.y > h + sprH + 30) {
            comp.y = -sprH - 30;
            comp.x = Math.random() * w;
          }
          if (comp.x < -sprW - 30) {
            comp.x = w + 30;
          } else if (comp.x > w + sprW + 30) {
            comp.x = -sprW - 30;
          }
        }

        var posX = Math.round(comp.x + Math.sin(comp.phase) * comp.wobbleAmp);
        var posY = Math.round(comp.y);
        var s = comp.scale;
        var sprite = COMPILED_SPRITES[comp.spriteIndex];

        // 1. Fill Pixels (Translucent Body)
        if (sprite.fill.length) {
          bgCtx.fillStyle = 'rgba(' + rgb + ', ' + (comp.alpha * (isDark ? 0.14 : 0.10)).toFixed(3) + ')';
          for (var f = 0; f < sprite.fill.length; f++) {
            var ptF = sprite.fill[f];
            bgCtx.fillRect(Math.round(posX + ptF[0] * s), Math.round(posY + ptF[1] * s), Math.ceil(s), Math.ceil(s));
          }
        }

        // 2. Primary Pixels (Outlines, Leads, Pins)
        if (sprite.primary.length) {
          bgCtx.fillStyle = 'rgba(' + rgb + ', ' + (comp.alpha * (isDark ? 0.65 : 0.60)).toFixed(3) + ')';
          for (var p = 0; p < sprite.primary.length; p++) {
            var ptP = sprite.primary[p];
            bgCtx.fillRect(Math.round(posX + ptP[0] * s), Math.round(posY + ptP[1] * s), Math.ceil(s), Math.ceil(s));
          }
        }

        // 3. Accent Pixels (Markings, Labels, Highlights)
        if (sprite.accent.length) {
          bgCtx.fillStyle = 'rgba(' + rgb + ', ' + (comp.alpha * (isDark ? 0.90 : 0.85)).toFixed(3) + ')';
          for (var a = 0; a < sprite.accent.length; a++) {
            var ptA = sprite.accent[a];
            bgCtx.fillRect(Math.round(posX + ptA[0] * s), Math.round(posY + ptA[1] * s), Math.ceil(s), Math.ceil(s));
          }
        }
      }

      requestAnimationFrame(renderBg);
    }

    renderBg();
  }
})();
