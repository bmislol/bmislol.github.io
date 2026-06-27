/* ============================================================
   Charbel Ghanem — portfolio interactions
   Everything here is progressive enhancement: the page is fully
   readable and usable with this file removed.
   ============================================================ */
(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    /* ---- remove boot splash from the DOM once it has faded ---- */
    function killBoot() {
        var boot = document.getElementById('boot');
        if (!boot) return;
        var remove = function () { if (boot && boot.parentNode) boot.parentNode.removeChild(boot); };
        if (reduceMotion) { remove(); return; }
        setTimeout(remove, 2000);
    }

    /* ---- theme toggle (persisted) ---- */
    function initTheme() {
        var btn = document.getElementById('theme-toggle');
        if (!btn) return;
        var icon = btn.querySelector('i');

        function paintIcon() {
            var dark = root.getAttribute('data-theme') === 'dark';
            if (icon) icon.className = dark ? 'fas fa-sun' : 'fas fa-moon';
            btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        }
        paintIcon();

        btn.addEventListener('click', function () {
            var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) {}
            paintIcon();
        });
    }

    /* ---- CRT toggle (persisted) ---- */
    function initCRT() {
        var btn = document.getElementById('crt-toggle');
        if (!btn) return;

        function sync() {
            var on = root.getAttribute('data-crt') === 'on';
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        }
        sync();

        btn.addEventListener('click', function () {
            var on = root.getAttribute('data-crt') === 'on';
            if (on) { root.removeAttribute('data-crt'); }
            else { root.setAttribute('data-crt', 'on'); }
            try { localStorage.setItem('crt', on ? 'off' : 'on'); } catch (e) {}
            sync();
        });
    }

    /* ---- career tabs ---- */
    function initTabs() {
        var btns = document.querySelectorAll('.tab-btn');
        if (!btns.length) return;

        btns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var target = btn.getAttribute('data-tab');

                btns.forEach(function (b) {
                    var active = b === btn;
                    b.classList.toggle('active', active);
                    b.setAttribute('aria-selected', active ? 'true' : 'false');
                });

                document.querySelectorAll('.tab-panel').forEach(function (panel) {
                    var show = panel.id === target;
                    panel.classList.toggle('active', show);
                    if (show) panel.removeAttribute('hidden');
                    else panel.setAttribute('hidden', '');
                });
            });
        });
    }

    /* ---- mobile menu ---- */
    function initMenu() {
        var burger = document.getElementById('hamburger');
        var nav = document.querySelector('.nav-container');
        if (!burger || !nav) return;
        var icon = burger.querySelector('i');

        function setOpen(open) {
            nav.classList.toggle('open', open);
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
            burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            if (icon) icon.className = open ? 'fas fa-times' : 'fas fa-bars';
        }

        burger.addEventListener('click', function () {
            setOpen(!nav.classList.contains('open'));
        });

        nav.querySelectorAll('.nav-links a').forEach(function (link) {
            link.addEventListener('click', function () { setOpen(false); });
        });
    }

    /* ---- animate XP bars from 0 when scrolled into view ---- */
    function initXP() {
        var fills = document.querySelectorAll('.xp-fill');
        if (!fills.length) return;

        if (reduceMotion || !('IntersectionObserver' in window)) {
            return; /* CSS already shows them at their target width */
        }

        fills.forEach(function (fill) {
            fill.style.transition = 'none';
            fill.style.width = '0%';
        });
        /* force reflow so the 0% sticks before we animate */
        void document.body.offsetHeight;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var fill = entry.target;
                fill.style.transition = '';
                fill.style.width = '';   /* revert to CSS width: var(--xp) */
                io.unobserve(fill);
            });
        }, { threshold: 0.4 });

        fills.forEach(function (fill) { io.observe(fill); });
    }

    /* ---- highlight the nav link for the section in view ---- */
    function initActiveNav() {
        if (!('IntersectionObserver' in window)) return;
        var links = {};
        document.querySelectorAll('.nav-links a').forEach(function (a) {
            var id = a.getAttribute('href');
            if (id && id.charAt(0) === '#') links[id.slice(1)] = a;
        });
        var sections = document.querySelectorAll('main section[id], footer[id]');
        if (!sections.length) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                Object.keys(links).forEach(function (k) { links[k].classList.remove('current'); });
                var a = links[entry.target.id];
                if (a) a.classList.add('current');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach(function (s) { io.observe(s); });
    }

    /* ---- load a few more repos from GitHub ---- */
    function initRepos() {
        var strip = document.getElementById('repo-strip');
        if (!strip) return;

        var USER = 'bmislol';
        /* repos we don't want in the strip (profile repo + already featured) */
        var SKIP = ['bmislol.github.io', 'bmislol'];

        fetch('https://api.github.com/users/' + USER + '/repos?sort=pushed&per_page=100')
            .then(function (res) {
                if (!res.ok) throw new Error('status ' + res.status);
                return res.json();
            })
            .then(function (repos) {
                if (!Array.isArray(repos)) throw new Error('bad payload');

                var list = repos.filter(function (r) {
                    return !r.fork && SKIP.indexOf(r.name) === -1;
                }).slice(0, 6);

                strip.innerHTML = '';

                if (!list.length) {
                    renderError(strip, 'No public repos to show yet — they live on GitHub.');
                    return;
                }

                list.forEach(function (r) {
                    var card = document.createElement('a');
                    card.className = 'repo-card';
                    card.href = r.html_url;
                    card.target = '_blank';
                    card.rel = 'noopener noreferrer';

                    var h4 = document.createElement('h4');
                    h4.textContent = r.name.replace(/[-_]/g, ' ');

                    var p = document.createElement('p');
                    p.textContent = r.description || 'No description provided.';

                    var meta = document.createElement('div');
                    meta.className = 'repo-meta';
                    var lang = document.createElement('span');
                    lang.className = 'lang';
                    lang.textContent = r.language || '—';
                    var stars = document.createElement('span');
                    stars.textContent = '★ ' + (r.stargazers_count || 0);
                    meta.appendChild(lang);
                    meta.appendChild(stars);

                    card.appendChild(h4);
                    card.appendChild(p);
                    card.appendChild(meta);
                    strip.appendChild(card);
                });
            })
            .catch(function () {
                renderError(strip, 'Couldn\u2019t reach GitHub right now — see the full list on my profile.');
            });
    }

    function renderError(strip, msg) {
        strip.innerHTML = '';
        var p = document.createElement('p');
        p.className = 'repo-error';
        p.textContent = msg;
        strip.appendChild(p);
    }

    ready(function () {
        killBoot();
        initTheme();
        initCRT();
        initTabs();
        initMenu();
        initXP();
        initActiveNav();
        initRepos();
    });
})();
