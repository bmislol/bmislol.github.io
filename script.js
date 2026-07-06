/* ============================================================
   Charbel Ghanem — portfolio interactions
   Ported from the Claude Design (DCLogic) component to plain
   vanilla JS. Progressive enhancement: the page is fully
   readable with this file removed.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  var DARK = ['ef-dark-vibrant', 'ef-dark-soft', 'catppuccin-mocha'];
  var DARK_MAP = {
    'ef-light-vibrant': 'ef-dark-vibrant', 'ef-dark-vibrant': 'ef-light-vibrant',
    'ef-light-soft': 'ef-dark-soft', 'ef-dark-soft': 'ef-light-soft',
    'catppuccin-latte': 'catppuccin-mocha', 'catppuccin-mocha': 'catppuccin-latte'
  };
  var DIFF = {
    easy:   { label: 'Easy',   color: '#8DA101', fill: '14%',  base: 2.3 },
    normal: { label: 'Normal', color: '#DFA000', fill: '50%',  base: 2.95 },
    fast:   { label: 'Fast',   color: '#F57D26', fill: '100%', base: 3.7 }
  };

  /* ---------- boot splash removal ---------- */
  function killBoot() {
    var boot = $('[data-boot]');
    if (!boot) return;
    var remove = function () { if (boot && boot.parentNode) boot.parentNode.removeChild(boot); };
    if (reduceMotion) { remove(); return; }
    setTimeout(remove, 2100);
  }

  /* ---------- theme ---------- */
  function currentTheme() { return root.getAttribute('data-theme') || 'ef-light-vibrant'; }

  function paintDarkIcon() {
    var dark = DARK.indexOf(currentTheme()) !== -1;
    var sun = $('#icon-sun'), moon = $('#icon-moon');
    if (sun) sun.hidden = !dark;
    if (moon) moon.hidden = dark;
    var btn = $('#dark-btn');
    if (btn) btn.setAttribute('aria-label', dark ? 'Switch to a light palette' : 'Switch to a dark palette');
  }

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    set('cg-theme', t);
    paintDarkIcon();
  }

  function initTheme() {
    paintDarkIcon();

    var themeBtn = $('#theme-btn');
    var modal = $('#theme-modal');
    var backdrop = $('#theme-backdrop');

    function setThemeOpen(open) {
      if (modal) modal.hidden = !open;
      if (backdrop) backdrop.hidden = !open;
      if (themeBtn) themeBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    window.__closeTheme = function () { setThemeOpen(false); };

    if (themeBtn) themeBtn.addEventListener('click', function () {
      setThemeOpen(modal && modal.hidden);
    });
    if (backdrop) backdrop.addEventListener('click', function () { setThemeOpen(false); });

    $all('[data-set-theme]').forEach(function (b) {
      b.addEventListener('click', function () {
        applyTheme(b.getAttribute('data-set-theme'));
        setThemeOpen(false);
      });
    });

    var darkBtn = $('#dark-btn');
    if (darkBtn) darkBtn.addEventListener('click', function () {
      applyTheme(DARK_MAP[currentTheme()] || 'ef-dark-vibrant');
    });
  }

  /* ---------- mobile menu ---------- */
  function initMenu() {
    var btn = $('#menu-btn');
    var modal = $('#menu-modal');
    var close = $('#menu-close');
    if (!modal) return;

    function setOpen(open) {
      modal.hidden = !open;
      if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    window.__closeMenu = function () { setOpen(false); };

    if (btn) btn.addEventListener('click', function () { setOpen(true); });
    if (close) close.addEventListener('click', function () { setOpen(false); });
    $all('.menu-link', modal).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
  }

  /* ---------- career tabs ---------- */
  function initTabs() {
    var tabs = [
      { btn: $('#tab-edu'), panel: $('#panel-edu') },
      { btn: $('#tab-exp'), panel: $('#panel-exp') }
    ];
    tabs.forEach(function (t) {
      if (!t.btn) return;
      t.btn.addEventListener('click', function () {
        tabs.forEach(function (o) {
          var active = o === t;
          if (o.btn) {
            o.btn.setAttribute('data-active', active ? '1' : '0');
            o.btn.setAttribute('aria-selected', active ? 'true' : 'false');
          }
          if (o.panel) o.panel.hidden = !active;
        });
      });
    });
  }

  /* ---------- visitor name (synced across inputs) ---------- */
  function initName() {
    var inputs = $all('.player-name');
    var saved = get('cg-visitor');
    if (saved) inputs.forEach(function (i) { i.value = saved; });
    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        var v = input.value;
        set('cg-visitor', v);
        inputs.forEach(function (o) { if (o !== input) o.value = v; });
      });
    });
  }
  function visitorName() {
    var i = $('.player-name');
    return (i && i.value ? i.value : '').trim();
  }

  /* ---------- certificate rail + scroll effects ---------- */
  var pastHero = false;
  function layoutRail() {
    var rail = $('[data-rail]');
    if (!rail || !rail.parentNode) return;
    var dots = $all('[data-dot]', rail.parentNode);
    if (dots.length < 2) return;
    var base = rail.parentNode.getBoundingClientRect().top;
    var f = dots[0].getBoundingClientRect();
    var l = dots[dots.length - 1].getBoundingClientRect();
    var top = (f.top + f.height / 2) - base;
    var bot = (l.top + l.height / 2) - base;
    rail.style.top = top + 'px';
    rail.style.bottom = 'auto';
    rail.style.height = (bot - top) + 'px';
  }
  function handleScroll() {
    layoutRail();

    var hero = $('#home');
    if (hero) {
      var past = hero.getBoundingClientRect().bottom < 90;
      if (past !== pastHero) {
        pastHero = past;
        var float = $('#float-mascot');
        if (float) float.hidden = !past;
      }
    }

    var rail = $('[data-rail]');
    var fill = $('[data-rail-fill]');
    if (rail && fill) {
      var r = rail.getBoundingClientRect();
      var vh = window.innerHeight;
      var start = vh * 0.80, end = vh * 0.40;
      var p = (start - r.top) / (r.height + (start - end));
      p = Math.max(0, Math.min(1, p));
      fill.style.height = (p * 100) + '%';
      var fillPx = p * r.height;
      var nodes = rail.parentNode ? $all('[data-node]', rail.parentNode) : [];
      nodes.forEach(function (n) {
        var rel = n.getBoundingClientRect().top - r.top;
        n.setAttribute('data-on', rel <= fillPx + 26 ? '1' : '0');
      });
    }
  }
  function initScroll() {
    var raf = null;
    var onScroll = function () {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = null; handleScroll(); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    handleScroll();
    setTimeout(handleScroll, 400);
    setTimeout(handleScroll, 1300);
  }

  /* ---------- quest XP bars ---------- */
  function initQuests() {
    var fills = $all('[data-qfill]');
    if (!fills.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      fills.forEach(function (f) { f.style.width = f.getAttribute('data-w') + '%'; });
      return;
    }
    fills.forEach(function (f) { f.style.width = '0%'; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.width = en.target.getAttribute('data-w') + '%';
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    fills.forEach(function (f) { io.observe(f); });
  }

  /* ---------- github repos ---------- */
  function initRepos() {
    var strip = $('#repo-strip');
    if (!strip) return;
    var skip = ['bmislol.github.io', 'bmislol', 'maintainer-copilot', 'Course_Scheduling_OrTools', 'uptime-monitor'];

    function msg(text) {
      strip.innerHTML = '';
      var p = document.createElement('p');
      p.style.cssText = "font-family:'Pixelify Sans';font-size:.8rem;color:var(--fg-muted);";
      p.textContent = text;
      strip.appendChild(p);
    }

    fetch('https://api.github.com/users/bmislol/repos?sort=pushed&per_page=100')
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (list) {
        if (!Array.isArray(list)) throw 0;
        var rs = list.filter(function (r) { return !r.fork && skip.indexOf(r.name) === -1; }).slice(0, 6);
        if (!rs.length) { msg("No public repos to show yet — the full list lives on my profile."); return; }

        strip.innerHTML = '';
        var grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:.9rem;';

        rs.forEach(function (r) {
          var a = document.createElement('a');
          a.className = 'repo';
          a.href = r.html_url; a.target = '_blank'; a.rel = 'noopener noreferrer';
          a.style.cssText = 'background:var(--bg-1);border:2px solid var(--line);border-radius:12px;box-shadow:3px 3px 0 var(--shadow);padding:.95rem 1.05rem;text-decoration:none;color:var(--fg);display:block;';

          var h4 = document.createElement('h4');
          h4.style.cssText = "font-family:'Bricolage Grotesque';font-weight:700;font-size:1.02rem;color:var(--fg-strong);margin-bottom:.3rem;text-transform:capitalize;";
          h4.textContent = r.name.replace(/[-_]/g, ' ');

          var p = document.createElement('p');
          p.style.cssText = 'font-size:.82rem;color:var(--fg-muted);margin-bottom:.6rem;min-height:2.4em;line-height:1.4;';
          p.textContent = r.description || 'No description provided.';

          var meta = document.createElement('div');
          meta.style.cssText = "display:flex;gap:1rem;font-family:'Pixelify Sans';font-size:.68rem;color:var(--fg-muted);";
          var lang = document.createElement('span');
          lang.style.color = 'var(--accent)';
          lang.textContent = r.language || '—';
          var stars = document.createElement('span');
          stars.textContent = '★ ' + (r.stargazers_count || 0);
          meta.appendChild(lang); meta.appendChild(stars);

          a.appendChild(h4); a.appendChild(p); a.appendChild(meta);
          grid.appendChild(a);
        });
        strip.appendChild(grid);
      })
      .catch(function () { msg("Couldn't reach GitHub right now — the full list lives on my profile."); });
  }

  /* ---------- certificate lightbox ---------- */
  function initLightbox() {
    var box = $('#lightbox');
    var wrap = $('#lightbox-img-wrap');
    var label = $('#lightbox-label');
    var dl = $('#lightbox-download');
    var verify = $('#lightbox-verify');
    if (!box) return;

    function open(a) {
      var img = a.querySelector('img');
      var href = a.getAttribute('href') || '';
      var src = img ? img.getAttribute('src') : href;
      var lbl = img ? (img.getAttribute('alt') || '') : '';
      var ver = /^https?:/i.test(href) ? href : null;

      if (wrap) {
        wrap.innerHTML = '';
        var big = document.createElement('img');
        big.src = src; big.alt = lbl;
        big.style.cssText = 'max-width:100%;max-height:72vh;object-fit:contain;border-radius:4px;';
        wrap.appendChild(big);
      }
      if (label) label.textContent = lbl;
      if (dl) dl.setAttribute('href', src);
      if (verify) {
        if (ver) { verify.hidden = false; verify.setAttribute('href', ver); }
        else { verify.hidden = true; verify.removeAttribute('href'); }
      }
      box.hidden = false;
    }
    function close() { box.hidden = true; }
    window.__closeCert = close;
    window.__lightboxOpen = function () { return !box.hidden; };

    $all('.cert-link').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); open(a); });
    });
    box.addEventListener('click', function (e) {
      if (e.target === box) close();
    });
    if ($('#lightbox-close')) $('#lightbox-close').addEventListener('click', close);
  }

  /* ============================================================
     Slime Hop — one-button endless runner on a canvas
     ============================================================ */
  var Game = (function () {
    var state = 'idle';   // 'idle' | 'run' | 'over'
    var best = parseInt(get('cg-best') || '0', 10) || 0;
    var difficulty = get('cg-diff') || 'easy';
    if (!DIFF[difficulty]) difficulty = 'easy';
    var g = null, raf = null, cs = null, dragging = false;

    var modal, canvas, idleEl, overEl, scoreEl, bestEl;

    function el() {
      modal = $('#game-modal'); canvas = $('#game-canvas');
      idleEl = $('#game-idle'); overEl = $('#game-over');
      scoreEl = $('#game-score'); bestEl = $('#game-best');
    }

    function col(k) { return cs ? (cs.getPropertyValue(k).trim() || '#888') : '#888'; }
    function rr(ctx, x, y, w, h, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    function drawSlime(o, x, yb, w, h) {
      var ctx = o.ctx, top = yb - h;
      ctx.lineWidth = 3; ctx.strokeStyle = col('--ink'); ctx.fillStyle = col('--accent');
      rr(ctx, x, top, w, h, Math.min(15, h / 2)); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,.12)'; rr(ctx, x + 5, yb - 9, w - 10, 6, 3); ctx.fill();
      ctx.fillStyle = col('--ink');
      var ey = top + h * 0.4;
      ctx.fillRect(x + w * 0.3 - 3, ey, 6, 8);
      ctx.fillRect(x + w * 0.7 - 3, ey, 6, 8);
    }

    function setOverlays() {
      if (idleEl) idleEl.hidden = state !== 'idle';
      if (overEl) overEl.hidden = state !== 'over';
    }

    function open() {
      el(); if (!modal) return;
      modal.hidden = false;
      state = 'idle'; setOverlays();
      if (bestEl) bestEl.textContent = best;
      syncDiff();
      var tries = 0;
      (function wait() {
        if (canvas && canvas.clientWidth > 0) { drawIdle(); return; }
        if (++tries > 90) return;
        requestAnimationFrame(wait);
      })();
    }
    function close() { stop(); if (modal) modal.hidden = true; state = 'idle'; }

    function drawIdle() {
      if (!canvas) return;
      cs = getComputedStyle(document.documentElement);
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var W = canvas.clientWidth, H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      var ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var gr = H - 30;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = col('--ink'); ctx.globalAlpha = .5; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, gr + 2); ctx.lineTo(W, gr + 2); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = col('--grid');
      for (var x = 12; x < W; x += 38) ctx.fillRect(x, gr + 11, 5, 5);
      drawSlime({ ctx: ctx }, 60, gr, 38, 32);
    }

    function start() {
      if (!canvas) return;
      cs = getComputedStyle(document.documentElement);
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var W = canvas.clientWidth, H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      var ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var ground = H - 30;
      var base = (DIFF[difficulty] || DIFF.easy).base;
      g = {
        ctx: ctx, W: W, H: H, ground: ground, canvasEl: canvas, dpr: dpr,
        sx: 56, sw: 38, sh: 30, y: ground, vy: 0, gravity: 0.40, jump: -10.8,
        obs: [], speed: base, speedBase: base, spawn: 90, score: 0, dead: false,
        floor: 0, coyote: 9, last: 0, acc: 0
      };
      state = 'run'; setOverlays();
      if (scoreEl) scoreEl.textContent = '0';
      stop();
      var loop = function (now) {
        if (state !== 'run' || !g || g.dead) return;
        if (!g.last) g.last = now;
        var dt = now - g.last; g.last = now; if (dt > 100) dt = 100;
        g.acc += dt; var STEP = 1000 / 60, n = 0;
        while (g.acc >= STEP && n < 5) { step(); g.acc -= STEP; n++; if (g.dead) break; }
        draw();
        if (g && !g.dead) raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    function step() {
      var W = g.W, gr = g.ground;
      g.vy += g.gravity; g.y += g.vy;
      if (g.y >= gr) { g.y = gr; g.vy = 0; g.coyote = 9; } else if (g.coyote > 0) { g.coyote--; }
      g.speed = g.speedBase + Math.min(0.8, g.score * 0.018);
      g.floor = (g.floor - g.speed) % 38; if (g.floor > 0) g.floor -= 38;
      g.spawn--;
      if (g.spawn <= 0) {
        g.obs.push({ x: W + 20, w: 13 + Math.random() * 10, h: 11 + Math.random() * 10, sc: false });
        g.spawn = Math.max(130, 200 - g.score * 0.5 - Math.random() * 22);
      }
      for (var i = 0; i < g.obs.length; i++) {
        var o = g.obs[i]; o.x -= g.speed;
        if (!o.sc && o.x + o.w < g.sx) { o.sc = true; g.score++; if (scoreEl) scoreEl.textContent = g.score; }
      }
      g.obs = g.obs.filter(function (o) { return o.x + o.w > -12; });
      var sL = g.sx, sR = g.sx + g.sw, sT = g.y - g.sh, sB = g.y;
      for (var j = 0; j < g.obs.length; j++) {
        var b = g.obs[j], oT = gr - b.h;
        if (sL < b.x + b.w - 9 && sR > b.x + 9 && sT < gr && sB > oT + 5) { gameOver(); break; }
      }
    }

    function draw() {
      var cv = canvas; if (!cv) return;
      if (cv !== g.canvasEl) {
        g.canvasEl = cv; cv.width = g.W * g.dpr; cv.height = g.H * g.dpr;
        g.ctx = cv.getContext('2d'); g.ctx.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);
      }
      var ctx = g.ctx, W = g.W, H = g.H, gr = g.ground;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = col('--ink'); ctx.globalAlpha = .5; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, gr + 2); ctx.lineTo(W, gr + 2); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = col('--grid');
      for (var x = g.floor; x < W; x += 38) ctx.fillRect(x, gr + 11, 5, 5);
      ctx.fillStyle = col('--accent-2'); ctx.strokeStyle = col('--ink'); ctx.lineWidth = 3;
      for (var i = 0; i < g.obs.length; i++) { var o = g.obs[i], oT = gr - o.h; rr(ctx, o.x, oT, o.w, o.h, 3); ctx.fill(); ctx.stroke(); }
      var squash = g.y < gr ? 3 : 0;
      drawSlime(g, g.sx, g.y, g.sw + squash, g.sh - squash);
    }

    function gameOver() {
      if (!g || g.dead) return; g.dead = true;
      if (g.score > best) { best = g.score; set('cg-best', String(best)); }
      state = 'over'; setOverlays();
      var nm = visitorName() || 'player';
      if ($('#over-msg')) $('#over-msg').textContent = 'nice run, ' + nm + '!';
      if ($('#over-score')) $('#over-score').textContent = g.score;
      if ($('#over-best')) $('#over-best').textContent = best;
      if (bestEl) bestEl.textContent = best;
    }

    function flap() {
      if (state === 'idle' || state === 'over') { start(); return; }
      if (!g || g.dead) return;
      if (g.y >= g.ground - 2 || g.coyote > 0) { g.vy = g.jump; g.coyote = 0; }
    }
    function reset() { stop(); state = 'idle'; setOverlays(); requestAnimationFrame(drawIdle); }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = null; }
    function isOpen() { return modal && !modal.hidden; }

    /* difficulty slider */
    function syncDiff() {
      var d = DIFF[difficulty] || DIFF.easy;
      var fill = $('#diff-fill'), label = $('#diff-label'), track = $('#diff-track');
      if (fill) fill.style.height = d.fill;
      if (label) { label.textContent = d.label; label.style.color = d.color; }
      if (track) track.setAttribute('aria-valuetext', d.label);
    }
    function setDiff(d) { if (!DIFF[d]) return; difficulty = d; set('cg-diff', d); syncDiff(); }
    function levelFromEvent(e) {
      var track = $('#diff-track'); if (!track) return;
      var r = track.getBoundingClientRect();
      var ratio = 1 - Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      var lvl = ratio < 0.32 ? 'easy' : ratio < 0.68 ? 'normal' : 'fast';
      if (lvl !== difficulty) setDiff(lvl);
    }

    function bind() {
      el(); syncDiff();
      $all('.game-open').forEach(function (b) { b.addEventListener('click', open); });
      if (canvas) canvas.addEventListener('click', flap);
      if ($('#game-start')) $('#game-start').addEventListener('click', start);
      if ($('#game-again')) $('#game-again').addEventListener('click', flap);
      if ($('#game-reset')) $('#game-reset').addEventListener('click', reset);
      if ($('#game-close')) $('#game-close').addEventListener('click', close);
      if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) close(); });

      var track = $('#diff-track');
      if (track) {
        track.addEventListener('pointerdown', function (e) {
          dragging = true;
          try { track.setPointerCapture(e.pointerId); } catch (_) {}
          levelFromEvent(e);
        });
        track.addEventListener('pointermove', function (e) { if (dragging) levelFromEvent(e); });
        var end = function () { dragging = false; };
        track.addEventListener('pointerup', end);
        track.addEventListener('pointerleave', end);
        track.addEventListener('keydown', function (e) {
          var order = ['easy', 'normal', 'fast'];
          var i = order.indexOf(difficulty);
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); setDiff(order[Math.min(2, i + 1)]); }
          else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); setDiff(order[Math.max(0, i - 1)]); }
        });
      }
    }

    return { bind: bind, flap: flap, close: close, isOpen: isOpen };
  })();

  /* ---------- global keyboard ---------- */
  function initKeys() {
    window.addEventListener('keydown', function (e) {
      if (window.__lightboxOpen && window.__lightboxOpen()) {
        if (e.code === 'Escape') { window.__closeCert(); }
        return;
      }
      if (Game.isOpen()) {
        if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); Game.flap(); }
        else if (e.code === 'Escape') { Game.close(); }
        return;
      }
      if (e.code === 'Escape') {
        if (window.__closeTheme) window.__closeTheme();
        if (window.__closeMenu) window.__closeMenu();
      }
    });
  }

  ready(function () {
    killBoot();
    initTheme();
    initMenu();
    initTabs();
    initName();
    initScroll();
    initQuests();
    initRepos();
    initLightbox();
    Game.bind();
    initKeys();
  });
})();
