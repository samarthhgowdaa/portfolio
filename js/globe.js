/**
 * Realistic 3D Photorealistic Earth Globe & Visitor Telemetry Widget
 * Direct visual match to satellite earth with day/night terminator,
 * atmospheric blue rim glow, smooth continuous rotation, and drag interaction.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  var size = 130;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = size * dpr;
  canvas.height = size * dpr;

  var gl = canvas.getContext('webgl', { alpha: true, antialias: true, preserveDrawingBuffer: false }) ||
           canvas.getContext('experimental-webgl', { alpha: true, antialias: true });

  if (gl) {
    initWebGLGlobe(gl);
  } else {
    init2DFallback(canvas);
  }

  // ============================================================
  // WebGL Raymarched Photorealistic Earth Globe
  // ============================================================
  function initWebGLGlobe(gl) {
    var vsSource = [
      'attribute vec2 a_pos;',
      'varying vec2 v_coord;',
      'void main() {',
      '  v_coord = a_pos;',
      '  gl_Position = vec4(a_pos, 0.0, 1.0);',
      '}'
    ].join('\n');

    var fsSource = [
      'precision mediump float;',
      'varying vec2 v_coord;',
      'uniform sampler2D u_texture;',
      'uniform float u_rotation;',
      'uniform vec2 u_resolution;',
      '',
      'const float PI = 3.14159265359;',
      'const float TWO_PI = 6.28318530718;',
      '',
      'void main() {',
      '  vec2 p = v_coord;',
      '  float r = length(p);',
      '  float sphereRadius = 0.85;',
      '',
      '  // Outer atmosphere halo',
      '  if (r > sphereRadius) {',
      '    if (r < 1.0) {',
      '      float dist = (1.0 - r) / (1.0 - sphereRadius);',
      '      float halo = pow(dist, 2.5);',
      '      // Sun direction: shines from upper-right',
      '      float sunFactor = clamp((p.x * 0.8 + p.y * 0.3) + 0.5, 0.0, 1.0);',
      '      vec3 haloColor = vec3(0.32, 0.65, 0.95) * halo * (0.35 + sunFactor * 0.55);',
      '      gl_FragColor = vec4(haloColor, halo * 0.5);',
      '      return;',
      '    }',
      '    discard;',
      '  }',
      '',
      '  // Orthographic sphere surface calculation',
      '  vec2 normP = p / sphereRadius;',
      '  float z = sqrt(max(0.0, 1.0 - dot(normP, normP)));',
      '  vec3 normal = vec3(normP.x, normP.y, z);',
      '',
      '  // Axial tilt (approx 23.4 degrees)',
      '  float tilt = 0.408;',
      '  float cosT = cos(tilt);',
      '  float sinT = sin(tilt);',
      '  vec3 tilted = vec3(normal.x * cosT - normal.y * sinT, normal.x * sinT + normal.y * cosT, normal.z);',
      '',
      '  // Rotation around Earth polar axis',
      '  float rot = u_rotation;',
      '  float cosR = cos(rot);',
      '  float sinR = sin(rot);',
      '  vec3 rotated = vec3(tilted.x * cosR - tilted.z * sinR, tilted.y, tilted.x * sinR + tilted.z * cosR);',
      '',
      '  // Equirectangular spherical mapping',
      '  float lon = atan(rotated.x, rotated.z);',
      '  float lat = asin(clamp(rotated.y, -1.0, 1.0));',
      '  vec2 uv = vec2(lon / TWO_PI + 0.5, lat / PI + 0.5);',
      '',
      '  vec4 texColor = texture2D(u_texture, uv);',
      '',
      '  // Sun lighting: directional vector from upper-right',
      '  vec3 sunDir = normalize(vec3(0.85, 0.30, 0.45));',
      '  float nDotL = dot(normal, sunDir);',
      '  float dayTerminator = smoothstep(-0.15, 0.28, nDotL);',
      '',
      '  // Atmospheric Fresnel edge glow (blue limb on the horizon)',
      '  float fresnel = pow(1.0 - z, 3.2);',
      '  vec3 atmoGlow = vec3(0.38, 0.72, 1.0) * fresnel * (0.35 + dayTerminator * 0.65);',
      '',
      '  // Ambient night glow & daytime radiance',
      '  float nightLight = 0.05;',
      '  vec3 litColor = texColor.rgb * (dayTerminator * 0.95 + nightLight) + atmoGlow;',
      '',
      '  gl_FragColor = vec4(litColor, 1.0);',
      '}'
    ].join('\n');

    function createShader(gl, type, source) {
      var s = gl.createShader(type);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('Shader error:', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    var vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    var fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('Program link error:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // Quad geometry covering [-1, 1]
    var quad = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    var aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var uRot = gl.getUniformLocation(prog, 'u_rotation');
    var uTex = gl.getUniformLocation(prog, 'u_texture');
    var uRes = gl.getUniformLocation(prog, 'u_resolution');

    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1i(uTex, 0);

    // Texture loading
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Temporary 1x1 placeholder
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([14, 44, 64, 255]));

    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };
    img.src = 'assets/earth_opt.jpg';

    // State & Animation Loop
    var rotation = 1.2;
    var rotSpeed = 0.0035;
    var isDragging = false;
    var lastX = 0;
    var isVisible = true;
    var animId = null;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function draw() {
      if (!isVisible) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(uRot, rotation);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!prefersReduced && !isDragging) {
        rotation += rotSpeed;
      }
      animId = requestAnimationFrame(draw);
    }

    // Drag interaction
    canvas.addEventListener('mousedown', function (e) {
      isDragging = true;
      lastX = e.clientX;
    });
    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - lastX;
      lastX = e.clientX;
      rotation -= dx * 0.015;
    });
    window.addEventListener('mouseup', function () { isDragging = false; });

    canvas.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        isDragging = true;
        lastX = e.touches[0].clientX;
      }
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (!isDragging || e.touches.length !== 1) return;
      var dx = e.touches[0].clientX - lastX;
      lastX = e.touches[0].clientX;
      rotation -= dx * 0.015;
    }, { passive: true });
    window.addEventListener('touchend', function () { isDragging = false; });

    // Performance: Pause when offscreen or tab hidden
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting && !document.hidden;
        if (isVisible && !animId) animId = requestAnimationFrame(draw);
      }, { threshold: 0.1 });
      obs.observe(canvas);
    }

    document.addEventListener('visibilitychange', function () {
      isVisible = !document.hidden;
      if (isVisible && !animId) animId = requestAnimationFrame(draw);
    });

    draw();
  }

  // ============================================================
  // Canvas 2D Fallback
  // ============================================================
  function init2DFallback(canvas) {
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    var cx = w / 2;
    var cy = h / 2;
    var r = (w / 2) * 0.85;
    var rot = 0;

    var img = new Image();
    img.src = 'assets/earth_opt.jpg';

    function render2D() {
      ctx.clearRect(0, 0, w, h);

      // Atmosphere outer glow
      var atmo = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.15);
      atmo.addColorStop(0, 'transparent');
      atmo.addColorStop(1, 'rgba(60, 140, 220, 0.35)');
      ctx.fillStyle = atmo;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Sphere clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      if (img.complete && img.naturalWidth > 0) {
        var mapW = r * 4;
        var mapH = r * 2;
        var offsetX = (rot * 40) % mapW;
        ctx.drawImage(img, cx - offsetX, cy - r, mapW, mapH);
        ctx.drawImage(img, cx - offsetX + mapW, cy - r, mapW, mapH);
      } else {
        ctx.fillStyle = '#0e2c40';
        ctx.fill();
      }

      // Day / Night shadow gradient
      var shadow = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
      shadow.addColorStop(0, 'rgba(5, 10, 15, 0.92)');
      shadow.addColorStop(0.55, 'rgba(5, 10, 15, 0.65)');
      shadow.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      rot += 0.02;
      requestAnimationFrame(render2D);
    }
    render2D();
  }

  // ============================================================
  // Profile Visit & Telemetry Counter
  // ============================================================
  function initVisitorTelemetry() {
    var countEl = document.getElementById('visitor-count');
    if (!countEl) return;

    var storedVisits = parseInt(localStorage.getItem('sg_site_visits') || '1042', 10);
    var hasCounted = sessionStorage.getItem('sg_visited_session');

    if (!hasCounted) {
      storedVisits += 1;
      localStorage.setItem('sg_site_visits', storedVisits);
      sessionStorage.setItem('sg_visited_session', 'true');
    }

    countEl.textContent = storedVisits.toLocaleString();

    var timeEl = document.getElementById('ist-time');
    var hudClockEl = document.getElementById('hud-clock');

    function updateTime() {
      var now = new Date();
      if (timeEl) {
        try {
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
      if (hudClockEl) {
        try {
          var utc = now.toISOString().substring(11, 19) + ' UTC';
          hudClockEl.textContent = utc;
        } catch (err) {
          hudClockEl.textContent = '00:00:00 UTC';
        }
      }
    }
    updateTime();
    setInterval(updateTime, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisitorTelemetry);
  } else {
    initVisitorTelemetry();
  }
})();
