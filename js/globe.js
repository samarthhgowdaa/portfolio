/**
 * Interactive 3D Dotted Canvas Globe & Visitor Telemetry Widget
 * Zero dependencies, ultra-lightweight, 60 FPS, respects reduced-motion.
 */
(function () {
  'use strict';

  // ---------- 3D Dot-Matrix Globe ----------
  var canvas = document.getElementById('globe-canvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var size = 110;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    var radius = 46;
    var cx = size / 2;
    var cy = size / 2;
    var rotationY = 0;
    var tiltZ = 0.38; // ~22 degrees axial tilt
    var isDragging = false;
    var lastMouseX = 0;
    var rotSpeed = 0.008;

    // Generate latitude / longitude sphere sample points
    var points = [];
    var latLines = 14;
    var lonPoints = 22;

    for (var i = 1; i < latLines; i++) {
      var lat = (Math.PI * i) / latLines - Math.PI / 2;
      var rLat = Math.cos(lat) * radius;
      var y = Math.sin(lat) * radius;
      var count = Math.max(6, Math.floor(lonPoints * Math.cos(lat)));
      for (var j = 0; j < count; j++) {
        var lon = (2 * Math.PI * j) / count;
        points.push({
          x: rLat * Math.cos(lon),
          y: y,
          z: rLat * Math.sin(lon)
        });
      }
    }

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var animFrameId = null;
    var isVisible = true;

    function render() {
      if (!isVisible) return;
      ctx.clearRect(0, 0, size, size);

      // Read current theme accent color
      var style = getComputedStyle(document.documentElement);
      var accentColor = style.getPropertyValue('--accent').trim() || '#e58a4e';

      // Subtle atmospheric halo
      var grad = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.15);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, accentColor.startsWith('#') ? accentColor + '12' : 'rgba(229,138,78,0.06)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Sort points for depth rendering
      var cosR = Math.cos(rotationY);
      var sinR = Math.sin(rotationY);
      var cosT = Math.cos(tiltZ);
      var sinT = Math.sin(tiltZ);

      var projected = [];

      for (var k = 0; k < points.length; k++) {
        var p = points[k];
        // Rotate around Y
        var rx = p.x * cosR - p.z * sinR;
        var rz = p.x * sinR + p.z * cosR;
        var ry = p.y;

        // Tilt around Z
        var tx = rx * cosT - ry * sinT;
        var ty = rx * sinT + ry * cosT;
        var tz = rz;

        projected.push({
          x: cx + tx,
          y: cy + ty,
          z: tz
        });
      }

      // Draw dots
      for (var m = 0; m < projected.length; m++) {
        var pt = projected[m];
        var alpha = (pt.z + radius) / (2 * radius); // 0 (back) to 1 (front)
        if (alpha < 0.05) continue;

        var dotRadius = 0.8 + alpha * 1.2;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, dotRadius, 0, Math.PI * 2);

        if (pt.z > 0) {
          // Front hemisphere - bright & glowing
          ctx.fillStyle = accentColor;
          ctx.globalAlpha = Math.min(1, alpha * 1.15);
        } else {
          // Back hemisphere - faint silhouette
          ctx.fillStyle = accentColor;
          ctx.globalAlpha = alpha * 0.35;
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      if (!prefersReduced && !isDragging) {
        rotationY += rotSpeed;
      }
      animFrameId = requestAnimationFrame(render);
    }

    // Drag interaction
    canvas.addEventListener('mousedown', function (e) {
      isDragging = true;
      lastMouseX = e.clientX;
    });
    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - lastMouseX;
      lastMouseX = e.clientX;
      rotationY += dx * 0.015;
    });
    window.addEventListener('mouseup', function () {
      isDragging = false;
    });

    // Touch interaction
    canvas.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
      }
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (!isDragging || e.touches.length !== 1) return;
      var dx = e.touches[0].clientX - lastMouseX;
      lastMouseX = e.touches[0].clientX;
      rotationY += dx * 0.015;
    }, { passive: true });
    window.addEventListener('touchend', function () {
      isDragging = false;
    });

    // Pause when not visible in viewport or tab hidden
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting && !document.hidden;
        if (isVisible && !animFrameId) {
          animFrameId = requestAnimationFrame(render);
        }
      }, { threshold: 0.1 });
      observer.observe(canvas);
    }

    document.addEventListener('visibilitychange', function () {
      isVisible = !document.hidden;
      if (isVisible && !animFrameId) {
        animFrameId = requestAnimationFrame(render);
      }
    });

    render();
  }

  // ---------- Profile Visit & Telemetry Counter ----------
  function initVisitorTelemetry() {
    var countEl = document.getElementById('visitor-count');
    if (!countEl) return;

    // Retrieve or seed visitor count in localStorage
    var storedVisits = parseInt(localStorage.getItem('sg_site_visits') || '1042', 10);
    var hasCounted = sessionStorage.getItem('sg_visited_session');

    if (!hasCounted) {
      storedVisits += 1;
      localStorage.setItem('sg_site_visits', storedVisits);
      sessionStorage.setItem('sg_visited_session', 'true');
    }

    countEl.textContent = storedVisits.toLocaleString();

    // Local time in Bengaluru (IST, UTC+5:30)
    var timeEl = document.getElementById('ist-time');
    if (timeEl) {
      function updateTime() {
        try {
          var now = new Date();
          var ist = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).format(now);
          timeEl.textContent = ist + ' IST (UTC+5:30)';
        } catch (err) {
          timeEl.textContent = 'UTC+5:30';
        }
      }
      updateTime();
      setInterval(updateTime, 1000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisitorTelemetry);
  } else {
    initVisitorTelemetry();
  }
})();
