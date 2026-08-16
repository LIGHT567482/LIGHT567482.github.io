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
