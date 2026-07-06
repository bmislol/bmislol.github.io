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
    easy:   { label: 'Easy',   color: '--success', fill: '14%',  base: 2.3 },
    normal: { label: 'Normal', color: '--warn',    fill: '50%',  base: 2.95 },
    fast:   { label: 'Fast',   color: '--danger',  fill: '100%', base: 3.7 }
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

  /* ---------- visitor name (shared across every .player-name input) ---------- */
  function applyVisitor(v) {
    set('cg-visitor', v);
    $all('.player-name').forEach(function (o) { if (o.value !== v) o.value = v; });
  }
  function initName() {
    var saved = get('cg-visitor');
    if (saved) $all('.player-name').forEach(function (i) { i.value = saved; });
    $all('.player-name').forEach(function (input) {
      input.addEventListener('input', function () { applyVisitor(input.value); });
    });
  }
  function visitorName() {
    var v = '';
    $all('.player-name').forEach(function (i) { if (!v && i.value && i.value.trim()) v = i.value.trim(); });
    return v;
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
     Mini-game window — a carousel that swaps self-contained game
     modules inside one panel. Each module implements:
       { id, title, hint, showScore,
         mount(container, host),  // build own DOM + timers INSIDE container
         destroy(),               // cancel every rAF/interval; host empties container
         onKey(e) -> bool,        // true if it consumed the key
         reset() }
     host = { theme, setScore(n), setBest(n) }
     Each module keeps ALL its listeners on nodes inside `container`, so
     destroy() + container.innerHTML='' frees them — no leaked loops/handlers.
     ============================================================ */

  /* ---------- Module 1: Slime Hop (one-button endless runner) ---------- */
  function createRunner() {
    var RUNNER_HTML = `
      <canvas id="game-canvas" style="display:block;width:100%;height:300px;cursor:pointer;touch-action:manipulation;"></canvas>
      <div id="game-idle" style="position:absolute;left:0;right:0;top:0;bottom:74px;display:flex;align-items:center;justify-content:center;">
        <div style="display:flex;gap:18px;align-items:center;background:var(--bg-1);border:2px solid var(--ink);border-radius:14px;box-shadow:4px 4px 0 var(--shadow);padding:14px 20px;">
          <div style="text-align:center;">
            <div style="font-family:'Bricolage Grotesque';font-weight:800;font-size:1.5rem;color:var(--fg-strong);margin-bottom:.1rem;">Slime Hop</div>
            <div style="font-family:'Pixelify Sans';font-size:.72rem;color:var(--fg-muted);margin-bottom:.6rem;white-space:nowrap;">one button · hop the blocks</div>
            <div style="display:flex;align-items:center;justify-content:center;gap:.45rem;font-family:'Pixelify Sans';font-size:.74rem;color:var(--fg-muted);margin-bottom:.7rem;">name <input class="player-name nameinput" maxlength="14" placeholder="player" aria-label="Your name" style="font-family:'Pixelify Sans';font-size:.82rem;color:var(--accent);background:var(--bg-2);border:2px solid var(--line);border-radius:7px;text-align:center;width:108px;padding:5px 6px;"></div>
            <button id="game-start" style="font-family:'Pixelify Sans';font-size:.95rem;color:var(--on-accent);background:var(--accent);border:2px solid var(--ink);border-radius:10px;padding:10px 26px;cursor:pointer;box-shadow:3px 3px 0 var(--shadow);">▸ Start</button>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px;align-self:stretch;justify-content:center;border-left:2px solid var(--line);padding-left:18px;">
            <div style="font-family:'Pixelify Sans';font-size:.58rem;letter-spacing:1px;color:var(--fg-muted);">SPEED</div>
            <div id="diff-track" role="slider" aria-label="Difficulty" aria-valuetext="Easy" tabindex="0" style="position:relative;width:16px;height:92px;border:2px solid var(--ink);border-radius:9px;background:var(--bg-inset);cursor:grab;touch-action:none;">
              <div id="diff-fill" style="position:absolute;left:0;right:0;bottom:0;height:14%;border-radius:6px;overflow:hidden;background:linear-gradient(0deg,var(--success) 0%,var(--warn) 52%,var(--danger) 100%);background-size:100% 88px;background-position:left bottom;background-repeat:no-repeat;transition:height .28s cubic-bezier(.2,.8,.2,1);">
                <div style="position:absolute;inset:0;background-image:repeating-linear-gradient(125deg,rgba(255,255,255,.26) 0 5px,transparent 5px 15px);background-size:30px 30px;animation:flow 1.3s linear infinite;"></div>
                <div style="position:absolute;left:-1px;right:-1px;top:-1px;height:4px;border-radius:3px;background:rgba(255,255,255,.85);"></div>
              </div>
              <span style="position:absolute;left:50%;top:6px;transform:translateX(-50%);width:12px;height:12px;border-radius:50%;background:var(--bg-1);border:2.5px solid var(--danger);box-sizing:border-box;pointer-events:none;"></span>
              <span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:50%;background:var(--bg-1);border:2.5px solid var(--warn);box-sizing:border-box;pointer-events:none;"></span>
              <span style="position:absolute;left:50%;bottom:6px;transform:translateX(-50%);width:12px;height:12px;border-radius:50%;background:var(--bg-1);border:2.5px solid var(--success);box-sizing:border-box;pointer-events:none;"></span>
            </div>
            <div id="diff-label" style="font-family:'Pixelify Sans';font-size:.74rem;font-weight:600;color:var(--success);min-width:54px;text-align:center;">Easy</div>
          </div>
        </div>
      </div>
      <div id="game-over" hidden style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;background:rgba(0,0,0,.4);">
        <div style="font-family:'Bricolage Grotesque';font-weight:800;font-size:1.7rem;color:#fff;">game over</div>
        <div id="over-msg" style="font-family:'Pixelify Sans';font-size:.85rem;color:#fff;">nice run!</div>
        <div style="font-family:'Pixelify Sans';font-size:.8rem;color:rgba(255,255,255,.85);margin-bottom:.3rem;">score <span id="over-score">0</span> · best <span id="over-best">0</span></div>
        <button id="game-again" style="font-family:'Pixelify Sans';font-size:.9rem;color:var(--on-accent);background:var(--accent);border:2px solid var(--ink);border-radius:10px;padding:10px 18px;cursor:pointer;box-shadow:3px 3px 0 rgba(0,0,0,.3);">▸ play again</button>
      </div>`;

    var host, box, canvas, idleEl, overEl;
    var state = 'idle';   // 'idle' | 'run' | 'over'
    var g = null, raf = null, waitRaf = null, cs = null, dragging = false;
    var best = 0, difficulty = 'easy';
    // Setter-proxies so the untouched start()/step() can keep doing scoreEl.textContent = ...
    var scoreEl = { set textContent(v) { if (host) host.setScore(v); } };
    var bestEl = { set textContent(v) { if (host) host.setBest(v); } };

    function $c(sel) { return box ? box.querySelector(sel) : null; }
    function el() { canvas = $c('#game-canvas'); idleEl = $c('#game-idle'); overEl = $c('#game-over'); }

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

    function mount(container, hostApi) {
      host = hostApi; box = container;
      container.innerHTML = RUNNER_HTML;
      el();
      difficulty = Store.get('runner-diff', 'easy'); if (!DIFF[difficulty]) difficulty = 'easy';
      best = parseInt(Store.get('runner-best', 0), 10) || 0;
      state = 'idle'; setOverlays();
      host.setBest(best); host.setScore(0);
      syncDiff();
      bindInner();
      var tries = 0; waitRaf = null;
      (function wait() {
        if (canvas && canvas.clientWidth > 0) { drawIdle(); return; }
        if (++tries > 90) return;
        waitRaf = requestAnimationFrame(wait);
      })();
    }
    function destroy() { stop(); if (waitRaf) cancelAnimationFrame(waitRaf); waitRaf = null; dragging = false; g = null; state = 'idle'; }
    function onKey(e) {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); flap(); return true; }
      return false;
    }

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
      if (g.score > best) { best = g.score; Store.set('runner-best', best); }
      state = 'over'; setOverlays();
      var nm = visitorName() || 'player';
      if ($c('#over-msg')) $c('#over-msg').textContent = 'nice run, ' + nm + '!';
      if ($c('#over-score')) $c('#over-score').textContent = g.score;
      if ($c('#over-best')) $c('#over-best').textContent = best;
      if (bestEl) bestEl.textContent = best;
    }

    function flap() {
      if (state === 'idle' || state === 'over') { start(); return; }
      if (!g || g.dead) return;
      if (g.y >= g.ground - 2 || g.coyote > 0) { g.vy = g.jump; g.coyote = 0; }
    }
    function reset() { stop(); state = 'idle'; setOverlays(); waitRaf = requestAnimationFrame(drawIdle); }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = null; }

    /* difficulty slider */
    function syncDiff() {
      var d = DIFF[difficulty] || DIFF.easy;
      var fill = $c('#diff-fill'), label = $c('#diff-label'), track = $c('#diff-track');
      if (fill) fill.style.height = d.fill;
      if (label) { label.textContent = d.label; label.style.color = 'var(' + d.color + ')'; }
      if (track) track.setAttribute('aria-valuetext', d.label);
    }
    function setDiff(d) { if (!DIFF[d]) return; difficulty = d; Store.set('runner-diff', d); syncDiff(); }
    function levelFromEvent(e) {
      var track = $c('#diff-track'); if (!track) return;
      var r = track.getBoundingClientRect();
      var ratio = 1 - Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      var lvl = ratio < 0.32 ? 'easy' : ratio < 0.68 ? 'normal' : 'fast';
      if (lvl !== difficulty) setDiff(lvl);
    }

    function bindInner() {
      if (canvas) canvas.addEventListener('click', flap);
      var startBtn = $c('#game-start'); if (startBtn) startBtn.addEventListener('click', start);
      var againBtn = $c('#game-again'); if (againBtn) againBtn.addEventListener('click', flap);
      var nameInput = $c('.player-name');
      if (nameInput) {
        var saved = get('cg-visitor'); if (saved) nameInput.value = saved;
        nameInput.addEventListener('input', function () { applyVisitor(nameInput.value); });
      }
      var track = $c('#diff-track');
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
          // stopPropagation so the slider's arrows adjust difficulty instead of
          // bubbling up to the host router and switching games.
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); setDiff(order[Math.min(2, i + 1)]); }
          else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); setDiff(order[Math.max(0, i - 1)]); }
        });
      }
    }

    return {
      id: 'runner', title: '▸ SLIME HOP',
      hint: 'tap / click / space to hop · ◀ ▶ switch · esc to close',
      showScore: true, mount: mount, destroy: destroy, onKey: onKey, reset: reset
    };
  }

  /* ---------- Module 2: Goo Farm (idle clicker) ---------- */
  function createClicker() {
    var CLICKER_HTML = `
      <div style="display:flex;gap:14px;padding:16px;min-height:268px;box-sizing:border-box;">
        <div style="flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;width:172px;">
          <canvas id="goo-canvas" width="150" height="150" role="button" tabindex="0" aria-label="Poke the slime for goo" style="width:150px;height:150px;cursor:pointer;touch-action:manipulation;"></canvas>
          <div style="font-family:'Pixelify Sans';text-align:center;">
            <div style="font-size:1.6rem;font-weight:700;color:var(--accent);line-height:1;"><span id="goo-count">0</span></div>
            <div style="font-size:.62rem;letter-spacing:1px;color:var(--fg-muted);margin-top:3px;">GOO · <span id="goo-rate">0</span>/s</div>
          </div>
        </div>
        <div id="goo-upgrades" style="flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;justify-content:center;"></div>
      </div>`;

    var host, box, canvas, ctx, raf = null, timer = null, dpr = 1;
    var squash = 0, bob = 0, s = null, rows = [];
    var UP = [
      { key: 'poke',  name: 'Sharper Poke',  desc: '+1 goo per poke', base: 15,  growth: 1.55, apply: function () { s.click += 1; } },
      { key: 'spawn', name: 'Slime Spawner', desc: '+1 goo / sec',    base: 60,  growth: 1.7,  apply: function () { s.auto += 1; } },
      { key: 'mult',  name: 'Goo Frenzy',    desc: '×1.5 everything', base: 250, growth: 2.3,  apply: function () { s.mult = Math.round(s.mult * 150) / 100; } }
    ];

    function fresh() { return { goo: 0, click: 1, auto: 0, mult: 1, lv: { poke: 0, spawn: 0, mult: 0 } }; }
    function $c(sel) { return box ? box.querySelector(sel) : null; }
    function col(k) { return (host && host.theme ? (host.theme.getPropertyValue(k).trim() || '#888') : '#888'); }
    function cost(u) { return Math.ceil(u.base * Math.pow(u.growth, s.lv[u.key])); }
    function save() { Store.set('goo-farm', s); }
    function fmt(n) {
      n = Math.floor(n);
      if (n < 1000) return String(n);
      if (n < 1e6) return (n / 1e3).toFixed(n < 1e4 ? 1 : 0) + 'k';
      if (n < 1e9) return (n / 1e6).toFixed(2) + 'M';
      return (n / 1e9).toFixed(2) + 'B';
    }

    function rr(x, y, w, h, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    function drawGoo() {
      if (!ctx) return;
      var W = 150, H = 150, cx = W / 2;
      ctx.clearRect(0, 0, W, H);
      var by = Math.sin(bob) * 3;
      var w = 96 + squash * 22, h = 92 - squash * 26;
      var base = 122 + by;
      ctx.fillStyle = 'rgba(0,0,0,.14)';
      ctx.beginPath(); ctx.ellipse(cx, 130, w * 0.5, 7, 0, 0, 6.3); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = col('--ink'); ctx.fillStyle = col('--accent');
      rr(cx - w / 2, base - h, w, h, Math.min(26, h / 2)); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.20)';
      rr(cx - w / 2 + 12, base - h + 9, w - 24, 11, 6); ctx.fill();
      ctx.fillStyle = col('--ink');
      var ey = base - h * 0.6;
      ctx.fillRect(cx - 20, ey, 8, 13);
      ctx.fillRect(cx + 12, ey, 8, 13);
      ctx.strokeStyle = col('--ink'); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, ey + 15, 9, 0.12 * Math.PI, 0.88 * Math.PI); ctx.stroke();
    }
    function tick() {
      bob += 0.055;
      if (squash > 0) squash = Math.max(0, squash - 0.08);
      drawGoo();
      raf = requestAnimationFrame(tick);
    }
    function income() { if (s.auto > 0) { s.goo += s.auto * s.mult; save(); refresh(); } }
    function poke() { s.goo += s.click * s.mult; squash = 1; save(); refresh(); }

    function refresh() {
      var cnt = $c('#goo-count'); if (cnt) cnt.textContent = fmt(s.goo);
      var rate = $c('#goo-rate'); if (rate) rate.textContent = fmt(s.auto * s.mult);
      rows.forEach(function (row) {
        var c = cost(row.u), afford = s.goo >= c;
        row.costEl.textContent = fmt(c) + ' goo';
        row.lvlEl.textContent = 'Lv ' + s.lv[row.u.key];
        row.btn.disabled = !afford;
        row.btn.style.opacity = afford ? '1' : '.5';
        row.btn.style.cursor = afford ? 'pointer' : 'not-allowed';
      });
    }
    function buy(u) {
      var c = cost(u);
      if (s.goo < c) return;
      s.goo -= c; s.lv[u.key]++; u.apply(); save(); refresh();
    }
    function renderUpgrades() {
      var wrap = $c('#goo-upgrades'); if (!wrap) return;
      wrap.innerHTML = '';
      rows = UP.map(function (u) {
        var btn = document.createElement('button');
        btn.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:left;font-family:'Pixelify Sans';background:var(--bg-1);border:2px solid var(--ink);border-radius:10px;box-shadow:2px 2px 0 var(--shadow);padding:8px 10px;color:var(--fg-strong);";
        var left = document.createElement('div');
        var nm = document.createElement('div');
        nm.style.cssText = 'font-size:.82rem;color:var(--fg-strong);display:flex;gap:6px;align-items:center;';
        nm.appendChild(document.createTextNode(u.name + ' '));
        var lvlEl = document.createElement('span');
        lvlEl.style.cssText = 'font-size:.58rem;color:var(--on-accent);background:var(--accent-2);border-radius:4px;padding:1px 5px;';
        nm.appendChild(lvlEl);
        var desc = document.createElement('div');
        desc.style.cssText = 'font-size:.64rem;color:var(--fg-muted);';
        desc.textContent = u.desc;
        left.appendChild(nm); left.appendChild(desc);
        var costEl = document.createElement('div');
        costEl.style.cssText = 'font-size:.72rem;color:var(--success);white-space:nowrap;flex-shrink:0;';
        btn.appendChild(left); btn.appendChild(costEl);
        btn.addEventListener('click', function () { buy(u); });
        wrap.appendChild(btn);
        return { u: u, btn: btn, costEl: costEl, lvlEl: lvlEl };
      });
    }

    function mount(container, hostApi) {
      host = hostApi; box = container;
      s = Store.get('goo-farm', null);
      if (!s || typeof s !== 'object') s = fresh();
      if (!s.lv || typeof s.lv !== 'object') s.lv = { poke: 0, spawn: 0, mult: 0 };
      // Harden every field against a corrupted/partial/hand-edited save: scalars must
      // be finite and in range, and each upgrade level a non-negative integer — otherwise
      // cost() (base*growth^lv) yields NaN (dead buttons) or a negative level (1-goo exploit).
      var num = function (v, lo, def) { return (typeof v === 'number' && isFinite(v)) ? Math.max(lo, v) : def; };
      s.goo = num(s.goo, 0, 0);
      s.click = num(s.click, 1, 1);
      s.auto = num(s.auto, 0, 0);
      s.mult = num(s.mult, 1, 1);
      ['poke', 'spawn', 'mult'].forEach(function (k) {
        var v = s.lv[k];
        s.lv[k] = (typeof v === 'number' && isFinite(v) && v >= 0) ? Math.floor(v) : 0;
      });
      container.innerHTML = CLICKER_HTML;
      canvas = $c('#goo-canvas'); ctx = canvas.getContext('2d');
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = 150 * dpr; canvas.height = 150 * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderUpgrades();
      refresh();
      canvas.addEventListener('click', poke);
      canvas.addEventListener('keydown', function (e) { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); poke(); } });
      squash = 0; bob = 0;
      raf = requestAnimationFrame(tick);
      timer = setInterval(income, 1000);
    }
    function destroy() {
      if (raf) cancelAnimationFrame(raf); raf = null;
      if (timer) clearInterval(timer); timer = null;
    }
    function reset() { s = fresh(); save(); renderUpgrades(); refresh(); }
    function onKey() { return false; }

    return {
      id: 'clicker', title: '▸ GOO FARM',
      hint: 'poke the slime for goo · buy upgrades · ◀ ▶ switch · esc to close',
      showScore: false, mount: mount, destroy: destroy, onKey: onKey, reset: reset
    };
  }

  /* ---------- Module 3: Pocket Slime (a pet you keep alive between visits) ---------- */
  function createPet() {
    // ---- feel tunables ----
    var HUNGER_DECAY = 3.5;                  // stat points lost per REAL hour
    var HAPPINESS_DECAY = 2.5;
    var ENERGY_DECAY = 2;
    var CATCHUP_CAP_MS = 24 * 3600 * 1000;   // treat any absence > 24h as 24h (never a dead pet)
    var FEED_GAIN = 22;                      // Feed -> +hunger
    var PLAY_HAPPY = 20, PLAY_ENERGY_COST = 16, PLAY_MIN_ENERGY = 18;  // Play -> +happy, -energy
    var REST_MS = 6000, REST_ENERGY = 42;    // Rest -> +energy over one short sleep
    var COOLDOWN_MS = 3500;                  // per-action cooldown (anti-spam)
    var LOW_HUNGER = 30, LOW_ENERGY = 25, HIGH_HAPPY = 78;  // mood thresholds
    var SCHEMA = 1;

    var PET_HTML = `
      <div style="display:flex;gap:14px;padding:16px;min-height:268px;box-sizing:border-box;">
        <div style="flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;width:172px;">
          <canvas id="pet-canvas" width="160" height="160" style="width:160px;height:160px;"></canvas>
          <div id="pet-mood" style="font-family:'Pixelify Sans';font-size:.8rem;letter-spacing:1px;color:var(--accent);text-transform:uppercase;">content</div>
        </div>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;justify-content:center;">
          <div id="pet-note" role="status" aria-live="polite" style="font-family:'Pixelify Sans';font-size:.72rem;color:var(--fg-muted);min-height:2.2em;line-height:1.15;">&nbsp;</div>
          <div>
            <div style="display:flex;justify-content:space-between;font-family:'Pixelify Sans';font-size:.62rem;color:var(--fg-muted);margin-bottom:2px;"><span>hunger</span><span id="pet-hunger-val">0</span></div>
            <div style="height:11px;border:2px solid var(--ink);border-radius:6px;background:var(--bg-inset);overflow:hidden;"><div id="pet-hunger-fill" style="height:100%;width:0;background:var(--success);transition:width .3s;"></div></div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;font-family:'Pixelify Sans';font-size:.62rem;color:var(--fg-muted);margin-bottom:2px;"><span>happiness</span><span id="pet-happy-val">0</span></div>
            <div style="height:11px;border:2px solid var(--ink);border-radius:6px;background:var(--bg-inset);overflow:hidden;"><div id="pet-happy-fill" style="height:100%;width:0;background:var(--success);transition:width .3s;"></div></div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;font-family:'Pixelify Sans';font-size:.62rem;color:var(--fg-muted);margin-bottom:2px;"><span>energy</span><span id="pet-energy-val">0</span></div>
            <div style="height:11px;border:2px solid var(--ink);border-radius:6px;background:var(--bg-inset);overflow:hidden;"><div id="pet-energy-fill" style="height:100%;width:0;background:var(--success);transition:width .3s;"></div></div>
          </div>
          <div style="display:flex;gap:7px;margin-top:5px;">
            <button id="pet-feed" style="flex:1;font-family:'Pixelify Sans';font-size:.8rem;color:var(--on-accent);background:var(--accent);border:2px solid var(--ink);border-radius:9px;box-shadow:2px 2px 0 var(--shadow);padding:9px 4px;cursor:pointer;">Feed</button>
            <button id="pet-play" style="flex:1;font-family:'Pixelify Sans';font-size:.8rem;color:var(--on-accent);background:var(--accent-2);border:2px solid var(--ink);border-radius:9px;box-shadow:2px 2px 0 var(--shadow);padding:9px 4px;cursor:pointer;">Play</button>
            <button id="pet-rest" style="flex:1;font-family:'Pixelify Sans';font-size:.8rem;color:var(--fg-strong);background:var(--bg-1);border:2px solid var(--ink);border-radius:9px;box-shadow:2px 2px 0 var(--shadow);padding:9px 4px;cursor:pointer;">Rest</button>
          </div>
        </div>
      </div>`;

    var host, box, canvas, ctx, raf = null, timer = null, dpr = 1;
    var pet = null, note = '', phase = 0, bounce = 0, uiAcc = 0;
    var resting = false, restStart = 0, restFrom = 0, restTo = 0;
    var cd = { feed: 0, play: 0, rest: 0 };
    var els = {};

    function $c(sel) { return box ? box.querySelector(sel) : null; }
    function clamp(v) { return v < 0 ? 0 : v > 100 ? 100 : v; }
    function fresh() { return { schemaVersion: SCHEMA, hunger: 85, happiness: 100, energy: 95, lastSeen: Date.now() }; }
    function save() { Store.set('pet', pet); }
    function sanitize(o) {
      var n = function (v, d) { return (typeof v === 'number' && isFinite(v)) ? clamp(v) : d; };
      return {
        schemaVersion: SCHEMA,
        hunger: n(o.hunger, 85), happiness: n(o.happiness, 100), energy: n(o.energy, 95),
        lastSeen: (typeof o.lastSeen === 'number' && isFinite(o.lastSeen)) ? o.lastSeen : Date.now()
      };
    }

    // ---- colors (theme vars only; blend two vars to shift mood tint) ----
    function col(k) { return (host && host.theme ? (host.theme.getPropertyValue(k).trim() || '#888') : '#888'); }
    function parseCol(s) {
      s = (s || '').trim();
      if (s.charAt(0) === '#') {
        if (s.length === 4) return [parseInt(s.charAt(1) + s.charAt(1), 16), parseInt(s.charAt(2) + s.charAt(2), 16), parseInt(s.charAt(3) + s.charAt(3), 16)];
        return [parseInt(s.substr(1, 2), 16), parseInt(s.substr(3, 2), 16), parseInt(s.substr(5, 2), 16)];
      }
      var m = s.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
      return m ? [+m[1], +m[2], +m[3]] : [136, 136, 136];
    }
    function mix(a, b, t) {
      var A = parseCol(a), B = parseCol(b);
      return 'rgb(' + Math.round(A[0] + (B[0] - A[0]) * t) + ',' + Math.round(A[1] + (B[1] - A[1]) * t) + ',' + Math.round(A[2] + (B[2] - A[2]) * t) + ')';
    }
    function bodyColor(m) {
      var acc = col('--accent');
      if (m === 'hungry') return mix(acc, col('--fg-muted'), 0.4);
      if (m === 'sleepy' || m === 'sleeping') return mix(acc, col('--bg-2'), 0.45);
      if (m === 'happy') return mix(acc, col('--accent-2'), 0.25);
      return acc;
    }

    // ---- real-time decay + mood ----
    function applyDecay(now) {
      var el = now - (pet.lastSeen || now);
      if (el < 0) el = 0;
      if (el > CATCHUP_CAP_MS) el = CATCHUP_CAP_MS;   // cap: a long absence never zeroes the pet
      var h = el / 3600000;
      pet.hunger = clamp(pet.hunger - HUNGER_DECAY * h);
      pet.happiness = clamp(pet.happiness - HAPPINESS_DECAY * h);
      pet.energy = clamp(pet.energy - ENERGY_DECAY * h);
      pet.lastSeen = now;
    }
    function mood() {
      if (resting) return 'sleeping';
      if (pet.energy < LOW_ENERGY) return 'sleepy';
      if (pet.hunger < LOW_HUNGER) return 'hungry';
      if (pet.happiness > HIGH_HAPPY && pet.energy > 40 && pet.hunger > 40) return 'happy';
      return 'content';
    }
    function comeback(before, after, elapsed) {
      if (elapsed < 5 * 60 * 1000) return 'Welcome back!';
      if (after.hunger <= 35) return 'Slime missed you — it\'s hungry!';
      if (after.energy <= 30) return 'Slime got sleepy waiting for you.';
      if (after.happiness <= 45) return 'Slime felt a little lonely.';
      return 'Slime is happy you\'re back!';
    }

    // ---- actions ----
    function ready(k) { return Date.now() >= cd[k] && !resting; }
    function feed() {
      if (!ready('feed')) return;
      applyDecay(Date.now());
      pet.hunger = clamp(pet.hunger + FEED_GAIN);
      cd.feed = Date.now() + COOLDOWN_MS; note = ''; bounce = reduceMotion ? 0 : 1;
      save(); refresh();
    }
    function play() {
      if (!ready('play')) return;
      if (pet.energy < PLAY_MIN_ENERGY) { note = 'Too sleepy to play — let it Rest first.'; refresh(); return; }
      applyDecay(Date.now());
      pet.happiness = clamp(pet.happiness + PLAY_HAPPY);
      pet.energy = clamp(pet.energy - PLAY_ENERGY_COST);
      cd.play = Date.now() + COOLDOWN_MS; note = ''; bounce = reduceMotion ? 0 : 1;
      save(); refresh();
    }
    function rest() {
      if (!ready('rest')) return;
      applyDecay(Date.now());
      note = '';
      var target = clamp(pet.energy + REST_ENERGY);
      if (reduceMotion) { pet.energy = target; cd.rest = Date.now() + COOLDOWN_MS; save(); refresh(); return; }
      resting = true; restStart = Date.now(); restFrom = pet.energy; restTo = target;
      refresh();
    }
    function endRestIfDue(now) {
      if (!resting) return;
      var p = (now - restStart) / REST_MS;
      if (p >= 1) { pet.energy = restTo; resting = false; cd.rest = now + COOLDOWN_MS; save(); refresh(); }
      else { pet.energy = restFrom + (restTo - restFrom) * p; }
    }

    // ---- render ----
    function rr(x, y, w, h, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    function drawFace(m, cx, ey) {
      var ink = col('--ink');
      ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      var ex = 20;
      if (m === 'sleeping' || m === 'sleepy') {
        ctx.beginPath(); ctx.arc(cx - ex, ey, 6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + ex, ey, 6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      } else if (m === 'happy') {
        ctx.beginPath(); ctx.moveTo(cx - ex - 6, ey + 2); ctx.lineTo(cx - ex, ey - 5); ctx.lineTo(cx - ex + 6, ey + 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + ex - 6, ey + 2); ctx.lineTo(cx + ex, ey - 5); ctx.lineTo(cx + ex + 6, ey + 2); ctx.stroke();
      } else {
        ctx.fillRect(cx - ex - 3, ey - 5, 6, 11);
        ctx.fillRect(cx + ex - 3, ey - 5, 6, 11);
      }
      var my = ey + 20;
      ctx.beginPath();
      if (m === 'happy') { ctx.arc(cx, my - 4, 12, 0.08 * Math.PI, 0.92 * Math.PI); ctx.stroke(); }
      else if (m === 'content') { ctx.arc(cx, my - 2, 8, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
      else if (m === 'hungry') { ctx.arc(cx, my + 9, 8, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); }
      else if (m === 'sleepy') { ctx.moveTo(cx - 5, my); ctx.lineTo(cx + 5, my); ctx.stroke(); }
      else if (m === 'sleeping') { ctx.arc(cx, my - 1, 5, 0, Math.PI * 2); ctx.stroke(); }
    }
    function drawPet() {
      if (!ctx) return;
      var m = mood(), W = 160, cx = 80;
      ctx.clearRect(0, 0, W, W);
      var breathe = reduceMotion ? 0 : Math.sin(phase) * 3;
      var hop = (bounce > 0 && !reduceMotion) ? Math.sin((1 - bounce) * Math.PI) * 22 : 0;
      var happyBob = (m === 'happy' && !reduceMotion) ? Math.abs(Math.sin(phase * 1.4)) * 7 : 0;
      var slump = (m === 'sleepy' || m === 'sleeping' || m === 'hungry') ? 8 : 0;
      var w = 104 + breathe + (slump ? 10 : 0);
      var h = 96 - breathe - slump;
      var base = 128 - hop - happyBob;
      ctx.fillStyle = 'rgba(0,0,0,.14)';
      ctx.beginPath(); ctx.ellipse(cx, 134, w * 0.5, 7, 0, 0, 6.3); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = col('--ink'); ctx.fillStyle = bodyColor(m);
      rr(cx - w / 2, base - h, w, h, Math.min(30, h / 2)); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.18)';
      rr(cx - w / 2 + 14, base - h + 10, w - 28, 12, 6); ctx.fill();
      drawFace(m, cx, base - h * 0.58);
      if (m === 'sleeping') {
        ctx.fillStyle = col('--fg-muted');
        ctx.font = "12px 'Pixelify Sans', monospace"; ctx.fillText('z', cx + w / 2 - 6, base - h + 2);
        ctx.font = "9px 'Pixelify Sans', monospace"; ctx.fillText('z', cx + w / 2 + 3, base - h - 8);
      }
    }

    // ---- UI ----
    function cacheEls() {
      els.mood = $c('#pet-mood'); els.note = $c('#pet-note');
      els.hf = $c('#pet-hunger-fill'); els.hv = $c('#pet-hunger-val');
      els.pf = $c('#pet-happy-fill'); els.pv = $c('#pet-happy-val');
      els.ef = $c('#pet-energy-fill'); els.ev = $c('#pet-energy-val');
      els.feed = $c('#pet-feed'); els.play = $c('#pet-play'); els.rest = $c('#pet-rest');
    }
    function barColor(v) { return v >= 50 ? 'var(--success)' : v >= 25 ? 'var(--warn)' : 'var(--danger)'; }
    function setBar(fill, val, v) { v = Math.round(v); if (fill) { fill.style.width = v + '%'; fill.style.background = barColor(v); } if (val) val.textContent = v; }
    // aria-disabled (not the `disabled` property) so cooldown never yanks keyboard focus out of the
    // modal; the action handlers already no-op via ready()/energy checks.
    function setBtn(btn, on) { if (!btn) return; btn.setAttribute('aria-disabled', on ? 'false' : 'true'); btn.style.opacity = on ? '1' : '.45'; btn.style.cursor = on ? 'pointer' : 'not-allowed'; }
    function refresh() {
      if (!pet) return;
      var m = mood(), now = Date.now();
      setBar(els.hf, els.hv, pet.hunger);
      setBar(els.pf, els.pv, pet.happiness);
      setBar(els.ef, els.ev, pet.energy);
      if (els.mood) {
        els.mood.textContent = m === 'happy' ? 'happy!' : m;
        els.mood.style.color = m === 'hungry' ? 'var(--warn)' : (m === 'sleepy' || m === 'sleeping') ? 'var(--fg-muted)' : 'var(--accent)';
      }
      if (els.note) els.note.textContent = note || ' ';
      setBtn(els.feed, now >= cd.feed && !resting);
      setBtn(els.play, now >= cd.play && !resting && pet.energy >= PLAY_MIN_ENERGY);
      setBtn(els.rest, now >= cd.rest && !resting);
    }

    function tick() {
      var now = Date.now();
      if (!reduceMotion) phase += 0.06;
      if (bounce > 0) bounce = Math.max(0, bounce - 0.05);
      endRestIfDue(now);
      drawPet();
      if (++uiAcc >= 12) { uiAcc = 0; refresh(); }   // ~5Hz UI refresh (cooldowns, rest energy)
      raf = requestAnimationFrame(tick);
    }
    function heartbeat() {
      // setInterval keeps firing when the tab is backgrounded (rAF pauses), so settle an in-progress
      // rest here too — otherwise a Rest started before tabbing away could stay stuck.
      var now = Date.now();
      if (resting) endRestIfDue(now); else applyDecay(now);
      save(); refresh();
    }

    function mount(container, hostApi) {
      host = hostApi; box = container;
      var loaded = Store.get('pet', null);
      var firstVisit = !loaded || typeof loaded !== 'object';
      pet = firstVisit ? fresh() : sanitize(loaded);
      var before = { hunger: pet.hunger, happiness: pet.happiness, energy: pet.energy };
      var now = Date.now();
      var elapsed = now - (pet.lastSeen || now);
      applyDecay(now);   // come-back catch-up (capped at 24h inside)
      note = firstVisit ? 'A new slime! Feed and play to keep it happy.' : comeback(before, pet, elapsed);
      resting = false; bounce = 0; phase = 0; uiAcc = 0; cd = { feed: 0, play: 0, rest: 0 };
      container.innerHTML = PET_HTML;
      canvas = $c('#pet-canvas'); ctx = canvas.getContext('2d');
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = 160 * dpr; canvas.height = 160 * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cacheEls();
      els.feed.addEventListener('click', feed);
      els.play.addEventListener('click', play);
      els.rest.addEventListener('click', rest);
      save(); refresh();
      raf = requestAnimationFrame(tick);
      timer = setInterval(heartbeat, 3000);
    }
    function destroy() {
      if (raf) cancelAnimationFrame(raf); raf = null;
      if (timer) clearInterval(timer); timer = null;
      if (pet) { resting = false; applyDecay(Date.now()); save(); }   // persist lastSeen on the way out
    }
    function reset() {
      pet = fresh(); resting = false; bounce = 0; note = 'Fresh slime!'; cd = { feed: 0, play: 0, rest: 0 };
      save(); refresh();
    }
    function onKey() { return false; }

    return {
      id: 'pet', title: '▸ POCKET SLIME',
      hint: 'feed · play · rest — keep your slime alive · ◀ ▶ switch · esc to close',
      showScore: false, mount: mount, destroy: destroy, onKey: onKey, reset: reset
    };
  }

  /* ---------- Carousel host: swaps modules in the one window ---------- */
  var GameHost = (function () {
    var Games = [createRunner(), createClicker(), createPet()];
    var idx = 0, active = null;
    var modal, slot, panel, titleEl, hintEl, scoreWrap, bestWrap, scoreEl, bestEl, opener = null;

    var api = {
      theme: null,
      setScore: function (n) { if (scoreEl) scoreEl.textContent = n; },
      setBest: function (n) { if (bestEl) bestEl.textContent = n; }
    };

    function chrome(m) {
      if (titleEl) titleEl.textContent = m.title;
      if (hintEl) hintEl.textContent = m.hint;
      if (scoreWrap) scoreWrap.hidden = !m.showScore;
      if (bestWrap) bestWrap.hidden = !m.showScore;
      if (panel) panel.setAttribute('aria-label', m.title.replace(/[^\w ]+/g, '').trim() + ' mini-game');
    }
    function mountActive() {
      active = Games[idx];
      chrome(active);
      active.mount(slot, api);
    }
    function switchTo(i) {
      if (active) active.destroy();
      if (slot) slot.innerHTML = '';
      idx = (i % Games.length + Games.length) % Games.length;
      Store.set('game-index', idx);
      mountActive();
    }
    function openWindow() {
      if (!modal) return;
      modal.hidden = false;
      if (!active) mountActive();
      if (panel && panel.focus) panel.focus();     // move focus into the dialog
    }
    function close() {
      if (active) active.destroy();
      active = null;
      if (slot) slot.innerHTML = '';
      if (modal) modal.hidden = true;
      if (opener && opener.focus) opener.focus();   // restore focus to whatever opened it
      opener = null;
    }
    function isOpen() { return !!(modal && !modal.hidden); }
    function handleKey(e) {
      if (e.code === 'Escape') { e.preventDefault(); close(); return; }
      var t = e.target, tag = (t && t.tagName ? t.tagName : '').toUpperCase();
      var role = (t && t.getAttribute) ? t.getAttribute('role') : null;
      // Never hijack typing in a field.
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
      // Let a focused button/slider/role=button handle its OWN activation keys (Space/Enter);
      // arrows still fall through so ◀ ▶ switching works no matter what's focused.
      if ((tag === 'BUTTON' || role === 'slider' || role === 'button') && (e.code === 'Space' || e.code === 'Enter')) return;
      if (active && active.onKey && active.onKey(e)) return;
      if (e.code === 'ArrowLeft') { e.preventDefault(); switchTo(idx - 1); }
      else if (e.code === 'ArrowRight') { e.preventDefault(); switchTo(idx + 1); }
    }
    function bind() {
      modal = $('#game-modal'); slot = $('#game-slot'); panel = $('#game-panel');
      titleEl = $('#game-title'); hintEl = $('#game-hint');
      scoreWrap = $('#game-score-wrap'); bestWrap = $('#game-best-wrap');
      scoreEl = $('#game-score'); bestEl = $('#game-best');
      api.theme = getComputedStyle(root);
      idx = parseInt(Store.get('game-index', 0), 10) || 0;
      if (idx < 0 || idx >= Games.length) idx = 0;
      $all('.game-open').forEach(function (b) { b.addEventListener('click', function () { opener = b; openWindow(); }); });
      if ($('#game-close')) $('#game-close').addEventListener('click', close);
      if ($('#game-reset')) $('#game-reset').addEventListener('click', function () { if (active && active.reset) active.reset(); });
      if ($('#game-prev')) $('#game-prev').addEventListener('click', function () { switchTo(idx - 1); });
      if ($('#game-next')) $('#game-next').addEventListener('click', function () { switchTo(idx + 1); });
      if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    }
    return { bind: bind, isOpen: isOpen, close: close, handleKey: handleKey };
  })();

  /* ---------- global keyboard ---------- */
  function initKeys() {
    window.addEventListener('keydown', function (e) {
      if (window.__lightboxOpen && window.__lightboxOpen()) {
        if (e.code === 'Escape') { window.__closeCert(); }
        return;
      }
      if (GameHost.isOpen()) { GameHost.handleKey(e); return; }
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
    GameHost.bind();
    initKeys();
  });
})();
