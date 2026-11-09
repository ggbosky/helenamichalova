/* Beauty13 by Hell — menu, galerie, rezervační formulář */
(function () {
  'use strict';

  // Mobilní menu
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Galerie s lightboxem
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  if (links.length) {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Fotogalerie');
    box.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Zavřít">&times;</button>' +
      '<button class="lightbox__prev" type="button" aria-label="Předchozí">&#8249;</button>' +
      '<img alt="">' +
      '<button class="lightbox__next" type="button" aria-label="Další">&#8250;</button>' +
      '<div class="lightbox__count"></div>';
    document.body.appendChild(box);
    var img = box.querySelector('img');
    var count = box.querySelector('.lightbox__count');
    var current = 0;
    var lastFocus = null;

    var show = function (i) {
      current = (i + links.length) % links.length;
      img.src = links[current].getAttribute('href');
      img.alt = links[current].querySelector('img').alt;
      count.textContent = (current + 1) + ' / ' + links.length;
    };
    var close = function () {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        lastFocus = a;
        show(i);
        box.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        box.querySelector('.lightbox__close').focus();
      });
    });
    box.querySelector('.lightbox__close').addEventListener('click', close);
    box.querySelector('.lightbox__prev').addEventListener('click', function () { show(current - 1); });
    box.querySelector('.lightbox__next').addEventListener('click', function () { show(current + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    var startX = null;
    box.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }

  // Rezervační formulář
  document.querySelectorAll('form[data-booking]').forEach(function (form) {
    var next = form.querySelector('input[name="_next"]');
    if (next) next.value = window.location.origin + '/rezervacni-system/?odeslano=1';
    var date = form.querySelector('input[type="date"]');
    if (date) date.min = new Date().toISOString().slice(0, 10);
  });
  if (/[?&]odeslano=1/.test(window.location.search)) {
    var ok = document.getElementById('rezervace-odeslana');
    if (ok) { ok.hidden = false; ok.scrollIntoView({ block: 'center' }); }
  }

  // Rok v patičce
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
