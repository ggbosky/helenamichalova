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

  // ===== Rezervace termínu =====
  // Nastavení otevírací doby a blokovaných termínů (dovolená, obsazené časy)
  var BOOKING = {
    days: [1, 2, 3, 4, 5],        // dny v týdnu (1 = pondělí … 5 = pátek)
    open: '9:00',                 // první možný začátek
    lastStart: '18:00',           // poslední možný začátek
    step: 30,                     // interval v minutách
    minNoticeMin: 60,             // dnes lze rezervovat nejdříve za X minut
    weeksAhead: 8,                // kolik týdnů dopředu lze rezervovat
    closed: [],                   // celé zavřené dny, např. ['2026-12-23', '2026-12-31']
    blocked: {}                   // obsazené časy, např. { '2026-11-20': ['10:00', '10:30'] }
  };

  var DOW = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
  var DOW_SHORT = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
  var MON = ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'];

  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var toMin = function (t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; };
  var fmtMin = function (m) { return Math.floor(m / 60) + ':' + pad(m % 60); };
  var addDays = function (d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; };
  var fullDate = function (d) { return DOW[d.getDay()] + ' ' + d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.getFullYear(); };

  // České státní svátky (včetně Velkého pátku a Velikonočního pondělí)
  var holidayCache = {};
  var holidays = function (y) {
    if (holidayCache[y]) return holidayCache[y];
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
      f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
      i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
      month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
    var easter = new Date(y, month - 1, day);
    var list = ['01-01', '05-01', '05-08', '07-05', '07-06', '09-28', '10-28', '11-17', '12-24', '12-25', '12-26']
      .map(function (md) { return y + '-' + md; });
    list.push(iso(addDays(easter, -2)), iso(addDays(easter, 1)));
    return (holidayCache[y] = list);
  };

  var dayStatus = function (d, now) {
    var key = iso(d);
    if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate())) return 'past';
    if (BOOKING.days.indexOf(d.getDay()) === -1) return 'closed';
    if (holidays(d.getFullYear()).indexOf(key) !== -1) return 'holiday';
    if (BOOKING.closed.indexOf(key) !== -1) return 'closed';
    return slotsFor(d, now).some(function (s) { return s.ok; }) ? 'open' : 'full';
  };

  var slotsFor = function (d, now) {
    var key = iso(d), out = [], blocked = BOOKING.blocked[key] || [];
    var isToday = key === iso(now), nowMin = now.getHours() * 60 + now.getMinutes() + BOOKING.minNoticeMin;
    for (var m = toMin(BOOKING.open); m <= toMin(BOOKING.lastStart); m += BOOKING.step) {
      var t = fmtMin(m);
      out.push({ time: t, min: m, ok: !(isToday && m < nowMin) && blocked.indexOf(t) === -1 });
    }
    return out;
  };

  document.querySelectorAll('[data-booker]').forEach(function (root) {
    var form = root.querySelector('form[data-booking]');
    var weekEl = root.querySelector('[data-week]');
    var weekLabel = root.querySelector('[data-week-label]');
    var prevBtn = root.querySelector('[data-week-prev]');
    var nextBtn = root.querySelector('[data-week-next]');
    var dayLabel = root.querySelector('[data-day-label]');
    var timesEl = root.querySelector('[data-times]');
    var picked = root.querySelector('[data-picked]');
    var fDate = root.querySelector('[data-field-date]');
    var fTime = root.querySelector('[data-field-time]');
    var now = new Date();
    var monday = function (d) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
    var firstWeek = monday(now);
    var weekOffset = 0, selDay = null, selTime = null;

    // první den s volným časem
    for (var i = 0; i < BOOKING.weeksAhead * 7 && !selDay; i++) {
      var cand = addDays(now, i);
      if (dayStatus(cand, now) === 'open') selDay = new Date(cand.getFullYear(), cand.getMonth(), cand.getDate());
    }
    if (selDay) weekOffset = Math.round((monday(selDay) - firstWeek) / 6048e5);

    var renderWeek = function () {
      var start = addDays(firstWeek, weekOffset * 7), end = addDays(start, 4);
      weekLabel.textContent = start.getDate() + '. ' + (start.getMonth() + 1) + '. – ' + end.getDate() + '. ' + (end.getMonth() + 1) + '. ' + end.getFullYear();
      prevBtn.disabled = weekOffset <= 0;
      nextBtn.disabled = weekOffset >= BOOKING.weeksAhead - 1;
      weekEl.innerHTML = '';
      for (var i = 0; i < 5; i++) {
        var d = addDays(start, i), st = dayStatus(d, now);
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'day';
        b.disabled = st !== 'open';
        b.setAttribute('aria-pressed', selDay && iso(d) === iso(selDay) ? 'true' : 'false');
        var note = { past: '—', holiday: 'Svátek', closed: 'Zavřeno', full: 'Obsazeno', open: iso(d) === iso(now) ? 'Dnes' : '' }[st];
        b.innerHTML = '<span class="day__dow">' + DOW_SHORT[d.getDay()] + '</span><span class="day__num">' + d.getDate() +
          '</span><span class="day__mon">' + MON[d.getMonth()] + '</span>' + (note ? '<span class="day__free">' + note + '</span>' : '');
        b.setAttribute('aria-label', fullDate(d) + (st !== 'open' ? ' – ' + note : ''));
        (function (day) { b.addEventListener('click', function () { selDay = day; selTime = null; update(); }); })(d);
        weekEl.appendChild(b);
      }
    };

    var renderTimes = function () {
      timesEl.innerHTML = '';
      if (!selDay) {
        dayLabel.textContent = 'Vyberte den';
        timesEl.innerHTML = '<p class="slots__empty">V tomto týdnu nejsou volné termíny. Zkuste další týden nebo nám zavolejte.</p>';
        return;
      }
      dayLabel.textContent = (iso(selDay) === iso(now) ? 'Dnes – ' : '') + fullDate(selDay);
      var slots = slotsFor(selDay, now);
      [['Dopoledne', function (s) { return s.min < 720; }], ['Odpoledne', function (s) { return s.min >= 720; }]].forEach(function (g) {
        var list = slots.filter(g[1]).filter(function (s) { return s.ok; });
        if (!list.length) return;
        var wrap = document.createElement('div');
        wrap.className = 'times-group';
        wrap.innerHTML = '<h4>' + g[0] + '</h4><div class="times"></div>';
        var grid = wrap.querySelector('.times');
        list.forEach(function (s) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'time';
          b.textContent = s.time;
          b.setAttribute('aria-pressed', selTime === s.time ? 'true' : 'false');
          b.setAttribute('aria-label', 'Rezervovat ' + fullDate(selDay) + ' v ' + s.time);
          b.addEventListener('click', function () { selTime = s.time; update(); openForm(); });
          grid.appendChild(b);
        });
        timesEl.appendChild(wrap);
      });
    };

    var openForm = function () {
      form.classList.add('is-active');
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(function () { var n = form.querySelector('#f-jmeno'); if (n) n.focus({ preventScroll: true }); }, 450);
    };

    var update = function () {
      renderWeek();
      renderTimes();
      if (selDay && selTime) {
        var label = fullDate(selDay) + ' v ' + selTime;
        picked.textContent = label;
        fDate.value = fullDate(selDay);
        fTime.value = selTime;
      } else {
        form.classList.remove('is-active');
        fDate.value = fTime.value = '';
      }
    };

    prevBtn.addEventListener('click', function () { weekOffset--; selDay = null; selTime = null; autoPick(); update(); });
    nextBtn.addEventListener('click', function () { weekOffset++; selDay = null; selTime = null; autoPick(); update(); });
    var autoPick = function () {
      var start = addDays(firstWeek, weekOffset * 7);
      for (var i = 0; i < 5; i++) { if (dayStatus(addDays(start, i), now) === 'open') { selDay = addDays(start, i); return; } }
    };
    root.querySelector('[data-change]').addEventListener('click', function () {
      selTime = null; update(); root.querySelector('.slots').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    form.addEventListener('submit', function (e) {
      if (!fDate.value || !fTime.value) { e.preventDefault(); root.querySelector('.slots').scrollIntoView({ behavior: 'smooth' }); return; }
      var name = form.querySelector('#f-jmeno').value.trim();
      form.querySelector('input[name="_subject"]').value = 'Rezervace: ' + fDate.value + ' v ' + fTime.value + (name ? ' – ' + name : '');
    });

    var next = form.querySelector('input[name="_next"]');
    if (next) next.value = new URL((form.getAttribute('data-root') || '/') + 'rezervacni-system/?odeslano=1', window.location.href).href;

    update();
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
