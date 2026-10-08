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
})();
