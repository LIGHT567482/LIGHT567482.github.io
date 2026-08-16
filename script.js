/* ═══════════════════════════════════════════════════════
   Semucyo Joshua — Portfolio behaviour
   No dependencies. Everything degrades gracefully.
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- theme toggle ----------
     Dark is the default. The <head> script has already applied any saved
     choice, so this only has to handle switching and persistence. */
  var root = document.documentElement;
  var themeBtn = document.getElementById('themeToggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    var light = theme === 'light';
    if (light) root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');

    themeBtn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    if (themeMeta) themeMeta.setAttribute('content', light ? '#F7F3EC' : '#0F0E12');
  }

  // sync the label with whatever the head script decided
  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
    applyTheme(next);
  });

  /* ---------- current year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- sticky nav border ---------- */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    nav.classList.toggle('is-stuck', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }

  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      burger.focus();
    }
  });
  // menu is desktop-irrelevant — close it if the viewport grows
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900 && burger.getAttribute('aria-expanded') === 'true') setMenu(false);
  });

  /* ---------- hero grid follows the pointer ---------- */
  var hero = document.querySelector('.hero');
  var heroGrid = document.querySelector('.hero__grid');

  if (hero && heroGrid && window.matchMedia('(hover: hover)').matches) {
    var queued = false, px = 0, py = 0;

    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      // one write per frame — pointermove fires far faster than the screen repaints
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        heroGrid.style.setProperty('--mx', px + 'px');
        heroGrid.style.setProperty('--my', py + 'px');
        queued = false;
      });
    }, { passive: true });
  }

  /* ---------- typewriter for the hero blurb ----------
     Types through the existing markup rather than a plain string, so the
     <strong> stays intact and the final DOM matches what was authored. */
  var blurb = document.querySelector('.hero__blurb');

  if (blurb && !reduceMotion) {
    typeOut(blurb, 500);
  }

  function typeOut(el, startDelay) {
    // flatten children into [{ el: <clone or null>, text: "…" }]
    var parts = [];
    Array.prototype.forEach.call(el.childNodes, function (n) {
      if (n.nodeType === 3) parts.push({ el: null, text: n.nodeValue });
      else if (n.nodeType === 1) parts.push({ el: n.cloneNode(false), text: n.textContent });
    });
    if (!parts.length) return;

    // pin the finished height before emptying, so the hero can't reflow mid-type
    el.style.minHeight = el.getBoundingClientRect().height + 'px';
    el.textContent = '';

    var caret = document.createElement('span');
    caret.className = 'caret';
    caret.setAttribute('aria-hidden', 'true');
    el.appendChild(caret);

    var pi = 0, ci = 0, container = null;

    function step() {
      if (pi >= parts.length) {                     // done
        setTimeout(function () {
          if (caret.parentNode) caret.parentNode.removeChild(caret);
          el.style.minHeight = '';
        }, 1200);
        return;
      }

      var part = parts[pi];
      if (ci === 0) {
        container = part.el || null;
        if (container) el.insertBefore(container, caret);
      }

      var ch = part.text.charAt(ci);
      var node = document.createTextNode(ch);
      if (container) container.appendChild(node);
      else el.insertBefore(node, caret);

      ci++;
      if (ci >= part.text.length) { pi++; ci = 0; }

      // vary the cadence, and rest on punctuation, so it reads as hands not a metronome
      var delay = 5 + Math.random() * 7;
      if (ch === ',' || ch === '—') delay = 90;
      else if (ch === '.') delay = 170;
      setTimeout(step, delay);
    }

    setTimeout(step, startDelay);
  }

  /* ---------- profile photo lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var avatarBtn = document.getElementById('avatarBtn');
  var lbClose = document.getElementById('lightboxClose');
  var lastFocused = null;

  function openLightbox() {
    // Safari doesn't focus a button on click, so activeElement can be <body>;
    // fall back to the avatar so focus has somewhere real to return to.
    var active = document.activeElement;
    lastFocused = (active && active !== document.body) ? active : avatarBtn;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();               // so Esc and Enter land somewhere sensible
  }

  function closeLightbox() {
    lightbox.hidden = true;
    // the mobile menu may still be holding the scroll lock — only release if it isn't
    if (burger.getAttribute('aria-expanded') !== 'true') document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  avatarBtn.addEventListener('click', openLightbox);
  lbClose.addEventListener('click', closeLightbox);

  // backdrop click closes; clicks on the figure itself must not
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });

  /* ---------- reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        // small stagger so grouped items cascade instead of popping together
        setTimeout(function () { entry.target.classList.add('is-in'); }, i * 70);
        revealer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(function (el) { revealer.observe(el); });
  }

  /* ---------- stat count-up ---------- */
  var stats = document.querySelectorAll('.stat b[data-count]');

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var counter = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUp(entry.target, parseInt(entry.target.dataset.count, 10));
        counter.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    stats.forEach(function (el) { el.textContent = '0'; counter.observe(el); });
  }

  function countUp(el, target) {
    var duration = 900;
    var start = performance.now();
    (function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  /* ---------- scroll spy ---------- */
  var sections = ['work', 'skills', 'path', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var navLinks = document.querySelectorAll('.nav__links a');

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- contact form ---------- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  var submitBtn = document.getElementById('submitBtn');
  var EMAIL = 'joshuasemucyo@gmail.com';

  function say(msg, kind) {
    status.textContent = msg;
    status.className = 'form__status' + (kind ? ' ' + kind : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (form.elements._gotcha.value) return; // bot

    var data = new FormData(form);
    var configured = form.action.indexOf('YOUR_FORM_ID') === -1;

    // No Formspree endpoint set yet — hand off to the visitor's mail client
    // so the form is never a dead end.
    if (!configured) {
      var body = 'From: ' + data.get('name') + ' <' + data.get('email') + '>\n\n' + data.get('message');
      window.location.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent('Portfolio enquiry from ' + data.get('name')) +
        '&body=' + encodeURIComponent(body);
      say('Opening your email app — send the message from there.', 'ok');
      return;
    }

    submitBtn.disabled = true;
    say('Sending…');

    fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        say('Message sent. I\'ll get back to you soon.', 'ok');
      })
      .catch(function () {
        say('Something went wrong — email me directly at ' + EMAIL, 'err');
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });
})();
