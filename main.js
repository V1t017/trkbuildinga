/* TRK Building — drobné skripty (menu, galéria, filter projektov, formuláre) */
(function () {
  'use strict';
  var me = document.currentScript;
  var ICONS = me ? me.src.replace(/main\.js.*$/, 'ikony.svg') : '/assets/img/ikony.svg';

  /* ---------- Súhlas s cookies a meranie ---------- */
  var CFG = window.TRK || {};
  var KEY = 'trk_consent', VER = 1, MAX_AGE = 365 * 24 * 3600 * 1000;
  var loaded = {};
  function readConsent() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY));
      if (c && c.v === VER && Date.now() - c.t < MAX_AGE) return c;
    } catch (e) { }
    return null;
  }
  function addScript(src) {
    var s = document.createElement('script');
    s.async = true; s.src = src;
    document.head.appendChild(s);
  }
  function clearCookies() {
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (/^(_ga|_gid|_gcl|_cl|_fbp|CLID|MUID)/.test(name)) {
        ['', '; domain=' + host, '; domain=.' + host, '; domain=' + location.hostname].forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  }
  function loadMaps() {
    document.querySelectorAll('[data-map-src]').forEach(function (m) {
      if (m.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.src = m.getAttribute('data-map-src');
      f.title = m.getAttribute('data-map-title') || 'Mapa';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      m.innerHTML = '';
      m.appendChild(f);
    });
  }
  function applyConsent(c) {
    var g = function (v) { return v ? 'granted' : 'denied'; };
    window.gtag('consent', 'update', { analytics_storage: g(c.a), ad_storage: g(c.m), ad_user_data: g(c.m), ad_personalization: g(c.m) });
    if ((c.a && CFG.ga4) || (c.m && CFG.ads)) {
      if (!loaded.gtag) { loaded.gtag = 1; addScript('https://www.googletagmanager.com/gtag/js?id=' + (CFG.ga4 || CFG.ads)); window.gtag('js', new Date()); }
      if (c.a && CFG.ga4 && !loaded.ga4) { loaded.ga4 = 1; window.gtag('config', CFG.ga4, { cookie_expires: 34128000 }); }
      if (c.m && CFG.ads && !loaded.ads) { loaded.ads = 1; window.gtag('config', CFG.ads); }
    }
    if (c.a && CFG.clarity && !loaded.clarity) {
      loaded.clarity = 1;
      window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
      addScript('https://www.clarity.ms/tag/' + CFG.clarity);
    }
    if (loaded.clarity) window.clarity('consentv2', { ad_Storage: g(c.m), analytics_Storage: g(c.a) });
    if (c.m && CFG.pixel && !loaded.pixel) {
      loaded.pixel = 1;
      var n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!window._fbq) window._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      addScript('https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', CFG.pixel); window.fbq('track', 'PageView');
    }
    if (c.m) loadMaps();
  }
  function saveConsent(a, m) {
    var prev = readConsent();
    var c = { v: VER, a: !!a, m: !!m, t: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { }
    if (prev && ((prev.a && !c.a) || (prev.m && !c.m))) { clearCookies(); location.reload(); return; }
    applyConsent(c);
  }
  window.trkTrack = function (name, params) {
    if (loaded.ga4 || loaded.ads) window.gtag('event', name, params || {});
    if (loaded.clarity) window.clarity('event', name);
  };

  var cc = null;
  function privacyHref() {
    var a = document.querySelector('a[href*="ochrana-osobnych-udajov"]');
    return a ? a.getAttribute('href') : '/ochrana-osobnych-udajov';
  }
  function closeBanner() { if (cc) { cc.remove(); cc = null; } }
  function openBanner(settings) {
    closeBanner();
    var c = readConsent() || { a: false, m: false };
    cc = document.createElement('section');
    cc.className = 'cc';
    cc.setAttribute('role', 'dialog');
    cc.setAttribute('aria-labelledby', 'cc-h');
    cc.innerHTML =
      '<h2 id="cc-h">Cookies na tomto webe</h2>' +
      '<p>Nevyhnutné cookies potrebujeme na fungovanie webu. S vaším súhlasom použijeme aj analytické – aby sme vedeli, ktoré stránky vás zaujímajú a čo na webe zlepšiť – a marketingové na meranie reklám a zobrazenie mapy. <a href="' + privacyHref() + '#cookies">Viac o cookies</a></p>' +
      '<div class="cc__opts"' + (settings ? '' : ' hidden') + '>' +
        '<label class="cc__opt"><input type="checkbox" checked disabled><span><strong>Nevyhnutné</strong>Zabezpečujú fungovanie webu a zapamätanie vašej voľby. Sú vždy zapnuté.</span></label>' +
        '<label class="cc__opt"><input type="checkbox" name="a"' + (c.a ? ' checked' : '') + '><span><strong>Analytické</strong>Google Analytics a Microsoft Clarity – štatistiky návštevnosti, mapy kliknutí a anonymizované nahrávky návštev.</span></label>' +
        '<label class="cc__opt"><input type="checkbox" name="m"' + (c.m ? ' checked' : '') + '><span><strong>Marketingové a obsah tretích strán</strong>Meranie reklám (Google Ads, Meta) a mapa Google Maps.</span></label>' +
      '</div>' +
      '<div class="cc__btns">' +
        '<button class="btn btn--red" type="button" data-cc="all">Prijať všetko</button>' +
        '<button class="btn btn--ink" type="button" data-cc="none">Odmietnuť</button>' +
        (settings ? '<button class="btn btn--ghost cc__wide" type="button" data-cc="save">Uložiť môj výber</button>'
                  : '<button class="cc__more" type="button" data-cc="settings">Nastaviť podrobne</button>') +
      '</div>';
    document.body.appendChild(cc);
    cc.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cc]');
      if (!b) return;
      var act = b.getAttribute('data-cc');
      if (act === 'settings') { openBanner(true); return; }
      if (act === 'all') saveConsent(true, true);
      if (act === 'none') saveConsent(false, false);
      if (act === 'save') saveConsent(cc.querySelector('[name=a]').checked, cc.querySelector('[name=m]').checked);
      closeBanner();
    });
    var first = cc.querySelector(settings ? '[name=a]' : '[data-cc=all]');
    if (first && settings) first.focus();
  }
  var current = readConsent();
  if (current) applyConsent(current); else openBanner(false);
  document.addEventListener('click', function (e) {
    if (e.target.closest('.cc-open')) { e.preventDefault(); openBanner(true); }
    var ml = e.target.closest('[data-map-load]');
    if (ml) { e.preventDefault(); loadMaps(); }
    var a = e.target.closest('a, button');
    if (!a || a.closest('.cc')) return;
    var href = a.getAttribute('href') || '';
    var label = (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    if (href.indexOf('tel:') === 0) window.trkTrack('click_phone', { link_text: label });
    else if (href.indexOf('mailto:') === 0) window.trkTrack('click_email', { link_text: label });
    else if (a.classList.contains('btn--red')) window.trkTrack('click_cta', { link_text: label, link_url: href });
  });

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
        window.trkTrack('gallery_open', { image_index: i + 1 });
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
    input.addEventListener('change', function () { show(true); window.trkTrack('obec_check', { obec: input.value.trim(), found: /is-yes/.test(res.className) }); });
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
          window.trkTrack('generate_lead', { form_location: form.getAttribute('data-ajax') });
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
