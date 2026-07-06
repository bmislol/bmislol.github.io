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
  var STEP = 100;      // ms per logical tick (classic oneko cadence)
  var SPEED = 12;      // px moved toward the cursor per tick
  var NEAR = 20;       // "arrived" distance
  var SIT_AFTER = 5;   // ticks idle → sit
  var SLEEP_AFTER = 18;// ticks idle → sleep

  var cat = document.createElement('canvas');
  cat.id = 'oneko-cat';
  cat.width = SIZE; cat.height = SIZE;
  cat.setAttribute('aria-hidden', 'true');
  var ctx = cat.getContext('2d');

  var vw = window.innerWidth, vh = window.innerHeight;
  var x = vw / 2, y = vh / 2;
  var tx = x, ty = y;
  var facingLeft = false;
  var idle = 0, frame = 0, acc = 0, last = 0;

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
    // tail
    ctx.strokeStyle = c.line;
    ctx.beginPath();
    ctx.moveTo(6, 20);
    if (run && frame === 1) ctx.quadraticCurveTo(1, 15, 3, 11);
    else ctx.quadraticCurveTo(1, 17, 3, 13);
    ctx.stroke();

    // legs
    ctx.fillStyle = c.body;
    var legY = 24;
    if (run) {
      // trot: alternate front/back leg lift
      var a = frame === 0 ? 0 : 2, b = frame === 0 ? 2 : 0;
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
    acc += now - last; last = now;

    while (acc >= STEP) {
      acc -= STEP;
      var dx = tx - x, dy = ty - y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < NEAR) {
        idle++;
        draw(idle >= SLEEP_AFTER ? 'sleep' : 'idle');
      } else {
        idle = 0;
        if (Math.abs(dx) > 2) facingLeft = dx < 0;
        var s = Math.min(SPEED, dist);
        x += (dx / dist) * s;
        y += (dy / dist) * s;
        frame ^= 1;
        place();
        draw('run');
      }
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
