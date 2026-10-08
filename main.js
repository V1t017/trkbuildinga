/* TRK Building — drobné skripty (menu, galéria, filter projektov, formuláre) */
(function () {
  'use strict';
  var me = document.currentScript;
  var ICONS = me ? me.src.replace(/main\.js.*$/, 'ikony.svg') : '/assets/img/ikony.svg';

  /* ---------- Mobilné menu ---------- */
  var menuBtn = document.querySelector('.hdr__menu');
  var nav = document.getElementById('nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.querySelector('use').setAttribute('href', ICONS + (open ? '#i-close' : '#i-menu'));
      document.body.classList.toggle('menu-open', open);
    });
  }

  /* ---------- Rozbaľovacie podmenu ---------- */
  var subBtns = document.querySelectorAll('.nav__btn');
  function closeAll(except) {
    subBtns.forEach(function (b) {
      if (b === except) return;
      b.setAttribute('aria-expanded', 'false');
      b.parentElement.classList.remove('is-open');
    });
  }
  subBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var item = btn.parentElement;
      var open = !item.classList.contains('is-open');
      closeAll(btn);
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav__item')) closeAll();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });

  /* ---------- Galéria (lightbox) ---------- */
  var lb = null, lbImg, lbCap, lbCount, items = [], idx = 0;
  function buildLightbox() {
    lb = document.createElement('dialog');
    lb.className = 'lb';
    lb.setAttribute('aria-label', 'Galéria fotiek');
    lb.innerHTML =
      '<span class="lb__count" aria-live="polite"></span>' +
      '<figure class="lb__fig"><img alt=""></figure>' +
      '<p class="lb__cap"></p>' +
      '<button class="lb__btn lb__close" type="button" aria-label="Zavrieť galériu"><svg class="ico"><use href="' + ICONS + '#i-close"/></svg></button>' +
      '<button class="lb__btn lb__prev" type="button" aria-label="Predchádzajúca fotka"><svg class="ico"><use href="' + ICONS + '#i-left"/></svg></button>' +
      '<button class="lb__btn lb__next" type="button" aria-label="Ďalšia fotka"><svg class="ico"><use href="' + ICONS + '#i-right"/></svg></button>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('img');
    lbCap = lb.querySelector('.lb__cap');
    lbCount = lb.querySelector('.lb__count');
    lb.querySelector('.lb__close').addEventListener('click', function () { lb.close(); });
    lb.querySelector('.lb__prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb__next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb__fig')) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }
  function show(i) {
    idx = (i + items.length) % items.length;
    var b = items[idx];
    lbImg.src = b.getAttribute('data-full');
    lbImg.alt = b.querySelector('img').alt;
    lbCap.textContent = b.querySelector('img').alt;
    lbCount.textContent = (idx + 1) + ' / ' + items.length;
  }
  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var btns = Array.prototype.slice.call(g.querySelectorAll('button[data-full]'));
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        if (!lb) buildLightbox();
        items = btns;
        show(i);
        if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
      });
    });
  });

  document.querySelectorAll('.gal-more button').forEach(function (b) {
    b.addEventListener('click', function () {
      var g = b.parentElement.previousElementSibling;
      g.classList.add('is-all');
      var first = g.querySelector('.more');
      b.parentElement.remove();
      if (first) first.focus();
    });
  });

  /* ---------- Filter projektov ---------- */
  var filters = document.querySelector('.filters');
  if (filters) {
    var cards = document.querySelectorAll('.proj[data-cat]');
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var cat = b.getAttribute('data-filter');
      filters.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      cards.forEach(function (c) {
        c.hidden = !(cat === 'vsetko' || (' ' + c.getAttribute('data-cat') + ' ').indexOf(' ' + cat + ' ') > -1);
      });
    });
  }


  /* ---------- Overenie obce ---------- */
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); }
  function svgIcon(id) { return '<svg class="ico" aria-hidden="true"><use href="' + ICONS + '#' + id + '"/></svg>'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  document.querySelectorAll('[data-obec-check]').forEach(function (box) {
    var input = box.querySelector('input');
    var res = box.querySelector('.oc__result');
    var msg = box.querySelector('.oc__msg');
    var cta = box.querySelector('.oc__cta');
    var base = cta.getAttribute('href').split('?')[0];
    var opts = Array.prototype.map.call(document.getElementById(input.getAttribute('list')).options, function (o) {
      return { v: o.value, n: norm(o.value), obec: o.getAttribute('data-obec'), okres: o.getAttribute('data-okres') };
    });
    function find(q) {
      var exact = opts.filter(function (o) { return o.n === q; })[0];
      if (exact) return exact;
      var pref = opts.filter(function (o) { return o.n.indexOf(q) === 0; });
      return pref.length === 1 ? pref[0] : null;
    }
    function show(final) {
      var q = norm(input.value);
      res.className = 'oc__result';
      if (q.length < 2) return;
      var hit = find(q);
      if (!hit && !final && q.length < 4) return;
      if (!hit && !final && opts.some(function (o) { return o.n.indexOf(q) === 0; })) return;
      if (hit) {
        var isPart = hit.obec !== hit.v;
        var head = isPart ? 'Áno, v lokalite ' + esc(hit.v) + ' staviame.' : 'Áno, v obci ' + esc(hit.v) + ' staviame.';
        var where = isPart ? 'Patrí pod obec ' + esc(hit.obec) + ', okres ' + esc(hit.okres) + '.' : 'Okres ' + esc(hit.okres) + '.';
        msg.innerHTML = svgIcon('i-check') + '<span><strong>' + head + '</strong>' + where +
          ' Pošlite nám dopyt a nezáväznú cenovú ponuku vám pripravíme do 48 hodín.</span>';
        cta.href = base + '?obec=' + encodeURIComponent(hit.v);
        res.className = 'oc__result is-yes';
      } else {
        msg.innerHTML = svgIcon('i-pin') + '<span><strong>Túto obec v zozname nemáme.</strong>Skontrolujte, prosím, názov. ' +
          'Ak staviate mimo Liptova a Oravy, po dohode prídeme aj k vám – napíšte nám, kde staviate.</span>';
        cta.href = base + '?obec=' + encodeURIComponent(input.value.trim());
        res.className = 'oc__result is-no';
      }
    }
    input.addEventListener('input', function () { show(false); });
    input.addEventListener('change', function () { show(true); });
    box.addEventListener('submit', function (e) { e.preventDefault(); show(true); });
  });

  /* ---------- Predvyplnenie miesta stavby z odkazu ---------- */
  var mObec = /[?&]obec=([^&]+)/.exec(location.search);
  if (mObec) {
    var place = document.querySelector('input[name="miesto_vystavby"]');
    if (place && !place.value) place.value = decodeURIComponent(mObec[1].replace(/\+/g, ' '));
  }

  /* ---------- Formuláre (Formspree) ---------- */
  document.querySelectorAll('form[data-ajax]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form__status');
      var btn = form.querySelector('button[type="submit"]');
      var label = btn.innerHTML;
      status.className = 'form__status';
      if (form.querySelector('.hp input').value) return; /* spam */
      btn.disabled = true;
      btn.textContent = 'Odosielam…';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('send');
          form.reset();
          status.textContent = 'Ďakujeme, dopyt sme prijali. Ozveme sa vám najneskôr do 48 hodín s cenovou ponukou.';
          status.classList.add('is-ok');
          if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { form_location: form.getAttribute('data-ajax') });
          if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
        })
        .catch(function () {
          status.textContent = 'Formulár sa nepodarilo odoslať. Skúste to znova alebo nám zavolajte na +421 908 113 529.';
          status.classList.add('is-err');
        })
        .then(function () {
          btn.disabled = false;
          btn.innerHTML = label;
          status.focus && status.setAttribute('tabindex', '-1');
          status.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        });
    });
  });
})();
