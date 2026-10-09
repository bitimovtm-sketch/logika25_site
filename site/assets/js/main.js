(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- mobile menu ---------- */
  var mnav = $('#mnav');
  function toggleMenu(open) {
    if (!mnav) return;
    mnav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    var b = $('.burger'); if (b) b.setAttribute('aria-expanded', open);
  }
  $$('[data-menu]').forEach(function (b) {
    b.addEventListener('click', function () { toggleMenu(b.getAttribute('data-menu') === 'open'); });
  });
  $$('#mnav a').forEach(function (a) { a.addEventListener('click', function () { toggleMenu(false); }); });

  /* ---------- modals ---------- */
  var lastFocus = null;
  function openModal(id, source) {
    var m = document.getElementById(id); if (!m) return;
    lastFocus = document.activeElement;
    m.classList.add('open'); document.body.style.overflow = 'hidden';
    var src = $('input[name=source]', m); if (src && source) src.value = source;
    var f = $('input:not([type=hidden]):not(.hp input)', m); if (f) setTimeout(function () { f.focus(); }, 60);
  }
  function closeModals() {
    $$('.modal.open').forEach(function (m) { m.classList.remove('open'); });
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-modal]');
    if (t) { e.preventDefault(); closeModals(); toggleMenu(false); openModal(t.getAttribute('data-modal'), t.getAttribute('data-source') || t.textContent.trim()); return; }
    if (e.target.closest('[data-close]') || e.target.classList.contains('modal')) closeModals();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModals(); toggleMenu(false); } });

  /* ---------- forms -> /api/lead.php -> Bitrix24 ---------- */
  var ENDPOINT = (document.documentElement.getAttribute('data-api') || '/api/lead.php');
  function validPhone(v) { return v.replace(/\D/g, '').length >= 10; }
  $$('form[data-lead]').forEach(function (form) {
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name, phone = form.elements.phone, ok = true;
      [[name, name.value.trim().length > 1], [phone, validPhone(phone.value)]].forEach(function (p) {
        var f = p[0].closest('.field'); f.classList.toggle('bad', !p[1]); if (!p[1]) ok = false;
      });
      if (!ok) { var bad = $('.bad input', form); if (bad) bad.focus(); return; }
      if (form.elements.company && form.elements.company.value) return; // honeypot
      var btn = $('button[type=submit]', form), label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Отправляем…';
      var data = new FormData(form);
      data.append('page', location.href);
      fetch(ENDPOINT, { method: 'POST', body: data })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (j) {
            if (!r.ok || !j || j.ok !== true) throw new Error((j && j.error) || 'http ' + r.status);
            return j;
          });
        })
        .then(function () {
          form.classList.add('done');
          if (window.ym && window.YM_ID) { try { window.ym(window.YM_ID, 'reachGoal', 'lead'); } catch (x) {} }
        })
        .catch(function () {
          btn.disabled = false; btn.textContent = label;
          var n = $('.form-err', form); if (n) n.style.display = 'block';
        });
    });
  });

  /* ---------- chips accordion ---------- */
  var chips = $$('.chip');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var open = c.getAttribute('aria-expanded') === 'true';
      chips.forEach(function (x) { x.setAttribute('aria-expanded', 'false'); });
      c.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  /* ---------- filters ---------- */
  var fbar = $('[data-filters]');
  if (fbar) {
    var posts = $$('.post[data-cats]');
    var apply = function (cat) {
      $$('.filter', fbar).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cat') === cat); });
      posts.forEach(function (p) {
        var show = cat === 'Все' || p.getAttribute('data-cats').split('|').indexOf(cat) > -1;
        p.hidden = !show;
      });
      var live = $('#filter-live'); if (live) live.textContent = 'Показано материалов: ' + posts.filter(function (p) { return !p.hidden; }).length;
    };
    fbar.addEventListener('click', function (e) { var b = e.target.closest('.filter'); if (b) apply(b.getAttribute('data-cat')); });
  }

  /* ---------- reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: .12 });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- phone mask ---------- */
  $$('input[type=tel]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      var d = inp.value.replace(/\D/g, '');
      if (d[0] === '8') d = '7' + d.slice(1);
      if (d[0] !== '7') d = '7' + d;
      d = d.slice(0, 11);
      var o = '+7';
      if (d.length > 1) o += ' (' + d.slice(1, 4);
      if (d.length >= 4) o += ') ' + d.slice(4, 7);
      if (d.length >= 7) o += '-' + d.slice(7, 9);
      if (d.length >= 9) o += '-' + d.slice(9, 11);
      inp.value = o;
    });
  });

  /* ---------- carousel (Возможности) ---------- */
  (function () {
    var track = document.querySelector('.feat-track'); if (!track) return;
    var prev = document.querySelector('[data-car=prev]'), next = document.querySelector('[data-car=next]');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function step() { var c = track.querySelector('.feat-row'); return c ? c.getBoundingClientRect().width + 16 : 300; }
    function upd() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }
    function go(dir) { track.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' }); }
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', upd, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    window.addEventListener('resize', upd); upd();
  })();

  /* ---------- lightbox: клик по картинке разворачивает её ---------- */
  (function () {
    var items = $$('[data-zoom], .art-body figure img');
    if (!items.length) return;
    var box = document.createElement('div');
    box.className = 'lightbox'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Просмотр изображения'); box.hidden = true;
    box.innerHTML = '<button type="button" class="lb-close" aria-label="Закрыть"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '<button type="button" class="lb-nav lb-prev" aria-label="Предыдущее"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>' +
      '<button type="button" class="lb-nav lb-next" aria-label="Следующее"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(box);
    var img = box.querySelector('img'), cap = box.querySelector('figcaption'), cur = -1, opener = null;
    function show(i) {
      cur = (i + items.length) % items.length;
      var el = items[cur];
      img.src = el.getAttribute('data-full') || el.currentSrc || el.src;
      img.alt = el.alt || ''; cap.textContent = el.alt || '';
    }
    function open(i, from) {
      opener = from || null; show(i); box.hidden = false;
      document.body.style.overflow = 'hidden';
      box.querySelector('.lb-close').focus();
      box.classList.toggle('single', items.length < 2);
    }
    function close() { box.hidden = true; document.body.style.overflow = ''; img.removeAttribute('src'); if (opener) opener.focus(); }
    items.forEach(function (el, i) {
      el.classList.add('zoomable');
      el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button');
      el.setAttribute('aria-label', 'Увеличить: ' + (el.alt || 'изображение'));
      el.addEventListener('click', function () { open(i, el); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i, el); } });
    });
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.closest('.lb-close')) close();
      else if (e.target.closest('.lb-prev')) show(cur - 1);
      else if (e.target.closest('.lb-next')) show(cur + 1);
    });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(cur - 1);
      else if (e.key === 'ArrowRight') show(cur + 1);
      else if (e.key === 'Tab') { e.preventDefault(); box.querySelector('.lb-close').focus(); }
    });
  })();
})();