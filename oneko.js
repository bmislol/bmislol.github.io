/* ============================================================
   oneko — a little pixel cat that chases the cursor, then sits
   and dozes off when you leave it alone. Self-contained, drawn
   on a canvas in the active theme's colors. Only runs when there
   is a real pointer and motion is allowed.
   ============================================================ */
(function () {
  'use strict';

  var fine = window.matchMedia('(pointer: fine)').matches;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || still) return;

  var SIZE = 32;

  // ---- feel tunables — safe to tweak without touching the logic below ----
  var CHASE_SPEED = 720;   // px/s — top chase speed. Higher = keeps pace with faster cursor moves.
  var STOP_DISTANCE = 6;   // px — within this the cat stops and rests (kills end-of-chase jitter).
  var GAIT_CADENCE = 90;   // ms per leg pose at full speed; the trot slows as the cat slows.
  var LOAF_AFTER = 2000;   // ms at rest → settle/loaf (shares the idle pose for now).
  var SLEEP_AFTER = 5000;  // ms at rest → curl up and sleep.
  // ------------------------------------------------------------------------

  var GAIT = 4;                // leg poses in the walk cycle
  var LEGA = [0, 1, 2, 1];     // front-leg lift across the 4-frame gait
  var LEGB = [2, 1, 0, 1];     // back-leg lift (opposite phase)
  var TAILY = [0, -1, -2, -1]; // tail swish, in sync with the legs

  var cat = document.createElement('canvas');
  cat.id = 'oneko-cat';
  cat.width = SIZE; cat.height = SIZE;
  cat.setAttribute('aria-hidden', 'true');
  var ctx = cat.getContext('2d');

  var vw = window.innerWidth, vh = window.innerHeight;
  var x = vw / 2, y = vh / 2;
  var tx = x, ty = y;
  var facingLeft = false;
  var frame = 0, gaitAcc = 0, restMs = 0, last = 0;

  window.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
  window.addEventListener('resize', function () { vw = window.innerWidth; vh = window.innerHeight; }, { passive: true });

  function place() { cat.style.transform = 'translate(' + (x - SIZE / 2) + 'px,' + (y - SIZE / 2) + 'px)'; }

  function colors() {
    var s = getComputedStyle(document.documentElement);
    return {
      body: (s.getPropertyValue('--fg-strong').trim() || '#46535B'),
      line: (s.getPropertyValue('--ink').trim() || '#5C6A72'),
      eye:  (s.getPropertyValue('--bg').trim() || '#FFFBEF'),
      nose: (s.getPropertyValue('--accent').trim() || '#8DA101')
    };
  }
  function rr(x0, y0, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x0 + r, y0);
    ctx.arcTo(x0 + w, y0, x0 + w, y0 + h, r);
    ctx.arcTo(x0 + w, y0 + h, x0, y0 + h, r);
    ctx.arcTo(x0, y0 + h, x0, y0, r);
    ctx.arcTo(x0, y0, x0 + w, y0, r);
    ctx.closePath();
  }

  function draw(state) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.save();
    if (facingLeft) { ctx.translate(SIZE, 0); ctx.scale(-1, 1); }
    var c = colors();
    ctx.lineWidth = 1.6; ctx.lineJoin = 'round';
    ctx.strokeStyle = c.line;

    if (state === 'sleep') {
      // curled, lying down
      ctx.fillStyle = c.body;
      rr(5, 17, 22, 9, 4.5); ctx.fill(); ctx.stroke();
      // head resting on the left
      rr(4, 13, 11, 10, 5); ctx.fill(); ctx.stroke();
      // ears
      ctx.beginPath(); ctx.moveTo(5, 14); ctx.lineTo(6, 9.5); ctx.lineTo(9.5, 13); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10.5, 12.5); ctx.lineTo(12.5, 9); ctx.lineTo(14, 13.5); ctx.closePath(); ctx.fill(); ctx.stroke();
      // closed eye
      ctx.strokeStyle = c.line; ctx.beginPath(); ctx.moveTo(7, 18.5); ctx.lineTo(10, 18.5); ctx.stroke();
      // tail curled around
      ctx.beginPath(); ctx.moveTo(26, 24); ctx.quadraticCurveTo(30, 22, 27, 18); ctx.stroke();
      // Zzz
      ctx.fillStyle = c.nose; ctx.font = '7px monospace'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('z', 20, 10); ctx.fillText('z', 24, 6);
      ctx.restore();
      return;
    }

    var run = state === 'run';
    // tail — swishes through the 4-frame gait
    ctx.strokeStyle = c.line;
    var tailUp = run ? TAILY[frame] : 0;
    ctx.beginPath();
    ctx.moveTo(6, 20);
    ctx.quadraticCurveTo(1, 17 + tailUp, 3, 13 + tailUp);
    ctx.stroke();

    // legs
    ctx.fillStyle = c.body;
    var legY = 24;
    if (run) {
      // trot: 4-frame cycle, front and back legs in opposite phase
      var a = LEGA[frame], b = LEGB[frame];
      rr(11, legY - a, 3, 4 + a, 1.4); ctx.fill(); ctx.stroke();
      rr(19, legY - b, 3, 4 + b, 1.4); ctx.fill(); ctx.stroke();
    } else {
      rr(11, legY, 3, 4, 1.4); ctx.fill(); ctx.stroke();
      rr(19, legY, 3, 4, 1.4); ctx.fill(); ctx.stroke();
    }

    // body
    ctx.fillStyle = c.body;
    rr(7, 15, 17, 11, 5.5); ctx.fill(); ctx.stroke();

    // head (front-right)
    rr(18, 9, 12, 12, 6); ctx.fill(); ctx.stroke();
    // ears
    ctx.beginPath(); ctx.moveTo(19, 10); ctx.lineTo(20, 4.5); ctx.lineTo(24, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(25, 9); ctx.lineTo(28.5, 4.5); ctx.lineTo(29.5, 10.5); ctx.closePath(); ctx.fill(); ctx.stroke();
    // eye
    ctx.fillStyle = c.eye;
    rr(24, 13, 3, 3.4, 1); ctx.fill();
    ctx.fillStyle = c.line; ctx.fillRect(25.2, 13.6, 1.2, 2.2);
    // nose
    ctx.fillStyle = c.nose;
    ctx.beginPath(); ctx.arc(29.4, 16, 1.1, 0, 6.3); ctx.fill();

    ctx.restore();
  }

  function tick(now) {
    if (!last) last = now;
    var dt = now - last; last = now;
    if (dt > 100) dt = 100;               // clamp — a backgrounded tab won't lurch on resume

    // Re-aim at the CURRENT cursor every frame, not on a slow tick.
    var dx = tx - x, dy = ty - y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= STOP_DISTANCE) {
      // At rest: hold still and run the idle → loaf → sleep timers on real time.
      restMs += dt;
      var pose = restMs >= SLEEP_AFTER ? 'sleep' : restMs >= LOAF_AFTER ? 'loaf' : 'idle';
      draw(pose);                          // 'loaf' currently falls through to the idle pose
    } else {
      restMs = 0;
      if (Math.abs(dx) > 1) facingLeft = dx < 0;   // turn instantly from the per-frame heading
      var step = CHASE_SPEED * dt / 1000;  // framerate-corrected: 30/60/144Hz all move the same
      if (step > dist) step = dist;        // clamp to the cursor — no overshoot / oscillation
      x += (dx / dist) * step;
      y += (dy / dist) * step;
      // Advance the leg gait by distance covered, so the trot tracks real speed: fast chase →
      // fast trot, creeping → slow trot, and the legs only ever cycle forward (no moon-walking).
      gaitAcc += step * 1000 / CHASE_SPEED;
      while (gaitAcc >= GAIT_CADENCE) { gaitAcc -= GAIT_CADENCE; frame = (frame + 1) % GAIT; }
      place();
      draw('run');
    }
    requestAnimationFrame(tick);
  }

  function boot() {
    document.body.appendChild(cat);
    place();
    draw('idle');
    requestAnimationFrame(tick);
  }
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
