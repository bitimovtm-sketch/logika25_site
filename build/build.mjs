import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, POSTS, APPS, APP_PAGES, OLD_URLS } from './data.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const write = (rel, content) => {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  if (rel.endsWith('.html') && rel !== '404.html') {
    // относительные пути: сайт открывается и с диска (file://), и на хостинге
    const up = '../'.repeat(rel.split('/').length - 1);
    content = content.replace(/\b(href|src)="(\/(?!\/)[^"]*)"/g, (m, attr, u) => {
      let [p, h = ''] = u.split(/(?=[#?])/);
      p = p.slice(1);
      if (p === '' || p.endsWith('/')) p += 'index.html';
      return `${attr}="${up}${p}${h}"`;
    });
  }
  fs.writeFileSync(f, content, 'utf8');
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtDate = (d) => { const [y, m, dd] = d.split('-'); return `${dd}.${m}.${y}`; };

/* ---------- icons (lucide-style, stroke) ---------- */
const P = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  wa: '<path d="M3 21l1.65-4.9A9 9 0 1 1 8 19.4L3 21Z"/><path d="M9 10c0 3 2 5 5 5l1.2-1.3-2-1-.8.8a3.5 3.5 0 0 1-1.7-1.7l.8-.8-1-2L9 10Z"/>',
  tg: '<path d="m21.5 3.5-19 7.4 5.2 1.8 2 6.3 3-3.7 4.8 3.7 4-15.5Z"/><path d="m7.7 12.7 9.6-6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.7 7L3 21l2-5.5A8 8 0 1 1 21 12Z"/>',
  calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01"/>',
  car: '<path d="M5 17h14M3 13l2-6h14l2 6v4H3v-4Z"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/>',
  abc: '<path d="M3 17 7 7l4 10M4.5 14h5M14 7v10M14 7h3a2.5 2.5 0 0 1 0 5h-3M14 12h3.5a2.5 2.5 0 0 1 0 5H14"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  cake: '<path d="M4 21h16v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8Z"/><path d="M4 16c2 1.5 4 1.5 6 0s4-1.5 6 0 3 1 4 0M12 11V7M12 3v1"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v9H5v-9M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.800 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  ext: '<path d="M7 17 17 7M8 7h9v9"/>',
  zap: '<path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.500v14Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M16 7l3 3"/>',
  headset: '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="2" y="14" width="5" height="7" rx="2"/><rect x="17" y="14" width="5" height="7" rx="2"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  trend: '<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
};
const ic = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[n] || ''}</svg>`;
const btnA = (label, href, cls = 'btn-primary', extra = '') => `<a class="btn ${cls}" href="${href}" ${extra}>${label}${ic('arrow')}</a>`;
const btnM = (label, source, cls = 'btn-primary', modal = 'm-form') => `<button class="btn ${cls}" type="button" data-modal="${modal}" data-source="${esc(source)}">${label}${ic('arrow')}</button>`;

/* ---------- posts urls ---------- */
for (const p of POSTS) {
  p.isCase = p.cats.includes('Кейсы');
  p.url = `/${p.isCase ? 'cases' : 'blog'}/${p.slug}.html`;
}

/* ---------- layout ---------- */
const NAV = [
  ['О нас', '/#ourcompany', 'about'],
  ['Блог', '/blog/', 'blog'],
  ['Кейсы', '/cases/', 'cases'],
  ['Приложения', '/market/', 'market'],
  ['Сопровождение', '/helpdesk/', 'helpdesk'],
  ['Контакты', '/#contacts', 'contacts'],
];

const leadFormFields = (idp, src) => `
<div class="fields">
  <input type="hidden" name="source" value="${esc(src)}">
  <div class="hp" aria-hidden="true"><label>Компания<input type="text" name="company" tabindex="-1" autocomplete="off"></label></div>
  <div class="field"><label for="${idp}-n">Ваше имя</label><input id="${idp}-n" name="name" type="text" autocomplete="name" required placeholder="Как к вам обращаться"><div class="err" role="alert">Укажите имя</div></div>
  <div class="field"><label for="${idp}-p">Телефон</label><input id="${idp}-p" name="phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="+7 (___) ___-__-__"><div class="err" role="alert">Укажите телефон полностью</div></div>
  <div class="field"><label for="${idp}-c">Комментарий <span style="font-weight:500;color:#6b7280">(необязательно)</span></label><textarea id="${idp}-c" name="comment" placeholder="Коротко о задаче"></textarea></div>
  <button class="btn btn-primary" type="submit">Отправить заявку${ic('arrow')}</button>
  <p class="form-err" style="display:none;color:#b3261e;font-weight:600;font-size:14px" role="alert">Не удалось отправить. Позвоните нам: <a href="${SITE.phoneHref}" style="text-decoration:underline">${SITE.phone}</a> или напишите в <a href="${SITE.wa}" style="text-decoration:underline">WhatsApp</a>.</p>
  <p class="consent">Нажимая кнопку «Отправить заявку», вы подтверждаете согласие на обработку персональных данных в соответствии с <a href="/policy/">Политикой конфиденциальности</a>.</p>
</div>
<div class="form-ok" role="status">Спасибо! Заявка отправлена — мы свяжемся с вами в ближайшее время.</div>`;

const modals = () => `
<div class="modal" id="m-form" role="dialog" aria-modal="true" aria-labelledby="m-form-t">
  <div class="modal-box">
    <button class="modal-x" type="button" data-close aria-label="Закрыть">${ic('x')}</button>
    <h2 id="m-form-t">Оставьте заявку</h2>
    <p>На расчёт стоимости внедрения и консультацию.</p>
    <form class="form" data-lead>${leadFormFields('mf', 'Заявка с сайта')}</form>
  </div>
</div>
<div class="modal" id="m-gift" role="dialog" aria-modal="true" aria-labelledby="m-gift-t">
  <div class="modal-box">
    <button class="modal-x" type="button" data-close aria-label="Закрыть">${ic('x')}</button>
    <span class="tag"><i></i>Для тех, у кого нет CRM</span>
    <h2 id="m-gift-t">Подарок! Посмотрите на вашу CRM-систему!</h2>
    <p>Мы при вас за час настроим CRM под вашу компанию. Вы сможете посмотреть, что это такое, как она работает, завести пару тестовых клиентов! Сможете оценить выгоды, какие она даёт. Конечно, настройки будут не полные, но это отличный вариант, чтобы вникнуть в вопрос.</p>
    <p style="margin-top:10px">Вы поймёте, что CRM может дать вашему бизнесу. И это абсолютно бесплатно и ни к чему вас не обязывает.</p>
    <form class="form" data-lead>${leadFormFields('mg', 'Подарок: настройка CRM за час')}</form>
  </div>
</div>`;

function layout({ title, desc, path: urlPath, body, active = '', og = '/assets/logo.png', ld = '', noindex = false }) {
  const canonical = SITE.domain + urlPath;
  const links = NAV.map(([t, h, k]) => `<a href="${h}"${active === k ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  const mlinks = NAV.map(([t, h]) => `<a class="l" href="${h}">${t}</a>`).join('')
    + `<a class="l" href="${SITE.events}" rel="noopener">Мероприятия</a><a class="l" href="${SITE.partnerLk}" rel="noopener">Кабинет партнера</a><a class="l" href="${SITE.clientLk}" rel="noopener">Кабинет клиента</a>`;
  return `<!doctype html>
<html lang="ru" data-api="/api/lead.php">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#303174">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<link rel="canonical" href="${canonical}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website"><meta property="og:locale" content="ru_RU">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}"><meta property="og:image" content="${SITE.domain}${og}">
<link rel="preload" href="/assets/fonts/manrope-600.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css">
${ld}
</head>
<body>
<a class="skip" href="#main">Перейти к содержимому</a>
<header class="hdr"><div class="wrap"><div class="hdr-in">
  <a class="logo" href="/" aria-label="Логика — на главную"><img src="/assets/logo.png" alt="Логика" width="227" height="39"></a>
  <nav class="nav" aria-label="Основная навигация">${links}</nav>
  <div class="hdr-r">
    <a class="hdr-phone" href="${SITE.phoneHref}">${SITE.phone}</a>
    <a class="btn btn-ghost btn-sm" href="${SITE.clientLk}" rel="noopener">Кабинет клиента</a>
    <button class="btn btn-primary btn-sm" type="button" data-modal="m-form" data-source="Заявка (шапка)">Заявка</button>
    <button class="burger" type="button" data-menu="open" aria-label="Открыть меню" aria-expanded="false" aria-controls="mnav">${ic('menu')}</button>
  </div>
</div></div></header>
<div class="mnav" id="mnav" role="dialog" aria-modal="true" aria-label="Меню">
  <div class="mnav-top"><img src="/assets/logo.png" alt="Логика" width="199" height="34" style="height:34px;width:auto"><button class="burger" type="button" data-menu="close" aria-label="Закрыть меню" style="display:inline-flex">${ic('x')}</button></div>
  ${mlinks}
  <button class="btn btn-primary" type="button" data-modal="m-form" data-source="Заявка (меню)">Оставить заявку${ic('arrow')}</button>
  <a class="btn btn-ghost" href="${SITE.phoneHref}">${SITE.phone}</a>
</div>
<main id="main">
${body}
</main>
${footer()}
<div class="fab">
  <a class="wa" href="${SITE.wa}" target="_blank" rel="noopener" aria-label="Написать в WhatsApp">${ic('wa')}</a>
  <a class="tg" href="${SITE.tg}" target="_blank" rel="noopener" aria-label="Написать в Telegram">${ic('tg')}</a>
</div>
${modals()}
<noscript><div class="noscript-note">Для отправки заявок включите JavaScript или позвоните: ${SITE.phone}</div></noscript>
<script src="/assets/js/main.js" defer></script>
</body>
</html>`;
}

function footer() {
  return `
<footer class="ftr" id="contacts"><div class="wrap">
  <div class="ftr-in">
    <div class="lg">
      <img src="/assets/logo.png" alt="Логика">
      <p>Настройка и сопровождение CRM Битрикс24. Работаем из Владивостока по всей России.</p>
      <p class="small">${SITE.tz}</p>
    </div>
    <div>
      <h4>Контакты</h4>
      <ul>
        <li><a href="${SITE.phoneHref}">${SITE.phone}</a></li>
        <li>Телефон для связи: <a href="${SITE.phone2Href}">${SITE.phone2}</a></li>
        <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
        <li>${SITE.address}</li>
        <li><a href="${SITE.wa}" target="_blank" rel="noopener">WhatsApp</a> · <a href="${SITE.tg}" target="_blank" rel="noopener">Telegram</a></li>
      </ul>
    </div>
    <div>
      <h4>Разделы</h4>
      <ul>
        <li><a href="/cases/">Кейсы</a></li>
        <li><a href="/market/">Приложения для Битрикс24</a></li>
        <li><a href="/helpdesk/">Сопровождение</a></li>
        <li><a href="/blog/">Блог</a></li>
        <li><a href="${SITE.events}" rel="noopener">Мероприятия: Битрикс24 для логистических компаний</a></li>
        <li><a href="${SITE.partnerLk}" rel="noopener">Кабинет партнера</a></li>
        <li><a href="${SITE.clientLk}" rel="noopener">Кабинет клиента</a></li>
        <li><a href="/policy/">Политика конфиденциальности, данные о юр. лице, способ оказания услуг и возврат ДС</a></li>
      </ul>
    </div>
  </div>
  <div class="ftr-bot"><span>© ${new Date().getFullYear()} ИП Белимов Алексей Владимирович. Все права защищены.</span><a href="/policy/">Политика конфиденциальности</a></div>
</div></footer>`;
}

const pageHero = ({ crumbs, h1, lead, cta = '' }) => `
<section class="ph"><div class="wrap"><div class="ph-in rv">
  <nav class="crumbs" aria-label="Хлебные крошки">${crumbs.map(([t, h]) => h ? `<a href="${h}">${t}</a><span aria-hidden="true">/</span>` : `<span aria-current="page">${t}</span>`).join('')}</nav>
  <h1>${h1}</h1>
  ${lead ? `<p class="lead">${lead}</p>` : ''}
  ${cta ? `<div class="ph-cta">${cta}</div>` : ''}
</div></div></section>`;

const postCard = (p, withData = true) => `
<article class="post rv"${withData ? ` data-cats="${esc(['Все', ...p.cats].join('|'))}"` : ''}>
  <a class="post-img${p.cover ? ' cover' : ''}" href="${p.url}" tabindex="-1" aria-hidden="true">${p.img ? `<img src="/assets/img/${p.img}" alt="" loading="lazy">` : `<img src="/assets/logo.png" alt="" loading="lazy" style="opacity:.35">`}</a>
  <div class="post-b">
    <div class="cats">${p.cats.map(c => `<span class="cat">${esc(c)}</span>`).join('')}</div>
    <h3><a href="${p.url}">${esc(p.title)}</a></h3>
    <p>${esc(p.desc)}</p>
  </div>
</article>`;

const CATS = ['Все', 'Кейсы', 'Решения', 'B2B', 'B2C', 'Переезд с AmoCRM', 'Видео'];
const filters = () => `
<div class="filters" data-filters role="group" aria-label="Фильтр по категориям">${CATS.map((c, i) => `<button class="filter" type="button" data-cat="${c}" aria-pressed="${i === 0}">${c}</button>`).join('')}</div>
<p class="sr" id="filter-live" aria-live="polite"></p>`;

const org = {
  '@context': 'https://schema.org', '@type': 'Organization', name: 'Логика', url: SITE.domain,
  logo: SITE.domain + '/assets/logo.png', email: SITE.email, telephone: '+74232001233',
  address: { '@type': 'PostalAddress', addressLocality: 'Владивосток', streetAddress: 'ул. Днепровская, 107, оф. 1', addressCountry: 'RU' },
};
const ldScript = (o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`;

/* =========================================================
   HOME
   ========================================================= */
function home() {
  const tools1 = ['Автоматическое поступление всех заявок в CRM', 'Звонки менеджера из карточки клиента', 'Почтовая переписка из карточки клиента', 'Виджет на сайт с прямой перепиской из CRM', 'Формирование договоров, счетов, актов из карточки сделки'];
  const tools2 = ['Сохранение переписки и звонков в карточке клиента', 'Маршрутизация обработки типовых документов между сотрудниками в электронном виде с сохранением истории изменений', 'Единая база клиентов с разбивкой по менеджерам и настройкой прав доступа', 'Структурированная информация о существующих и потенциальных продажах', 'Сквозная аналитика рекламных источников', 'Контроль поручений внутри компании'];
  const tool = (t) => `<div class="tool">${ic('check')}<span>${t}</span></div>`;
  const svcs = [
    ['Настройка', 'Подготавливаем техническое задание и описываем предстоящий объем работ. Внедряем описанные бизнес-процессы, телефонию, документооборот, шаблоны, воронки продаж, правила работы, делаем удобный интерфейс и т.д.', 's1.png'],
    ['Обучение', 'Обучаем сотрудников работать в CRM, проходим с ними типовые операции несколько раз, для лучшего запоминания и параллельно увеличиваем их желание работать в Битрикс24.', 's2.png'],
    ['Лицензия', 'Помогаем подобрать из множества предложенных Битрикс24 продукт, способный решить ваши задачи. Облачная или коробочная версия, выбор тарифов исходя из ваших потребностей.', 's3.png'],
    ['Сопровождение', 'После настройки и работы в течение нескольких недель вы увидите весь потенциал Битрикс24 и захотите дополнительные настройки, персонализированные отчеты, дополнительную оптимизацию — в чем мы вам с удовольствием поможем.', 's4.png'],
  ];
  const latest = POSTS.filter(p => p.blog).slice(0, 3);
  const partners = [
    ['Битрикс24', SITE.b24Create, 'bitrix24.png'],
    ['ChatApp', 'https://chatapp.online/ru/referral/?p=47631', 'chatapp.png'],
    ['Wazzup', 'https://wazzup24.ru/?utm_p=E7er6lt', 'wazzup.svg'],
    ['КлиентБаза', 'https://clientbase.ru/', 'clientbase.png'],
  ];

  const body = `
<section class="hero"><div class="wrap">
  <div class="hero-grid">
    <div class="hero-main rv">
      <span class="tag"><i></i>Лидер продаж на Дальнем Востоке</span>
      <h1>Настройка и сопровождение <span class="soft">CRM Битрикс24</span></h1>
      <p class="price">Внедрение от 34 990 ₽</p>
      <p class="sub">100+ внедрений в различных отраслях. 8 лет опыта работы.</p>
      <div class="hero-cta">
        ${btnM('Рассчитать стоимость', 'Рассчитать стоимость (главный экран)')}
        ${btnM('Консультация', 'Консультация (главный экран)', 'btn-ghost')}
      </div>
    </div>
    <div class="hero-side">
      <div class="hero-visual rv">
        <img class="doodle" src="/assets/img/s1.png" alt="" width="420" height="420">
        <span class="badge">Партнёр Битрикс24</span>
        <div class="big">8 лет<small>опыта внедрения CRM в различных нишах</small></div>
      </div>
      <button class="gift rv" type="button" data-modal="m-gift" data-source="Подарок (главный экран)"><span>У вас ещё нет CRM?<br>Для вас есть ПОДАРОК!</span>${ic('gift')}</button>
    </div>
  </div>
</div></section>

<section class="sec" style="padding-top:36px"><div class="wrap"><div class="stats rv">
  <div class="stat"><b>100+</b><span>внедрений в различных отраслях</span></div>
  <div class="stat"><b>8 лет</b><span>реального опыта внедрения CRM</span></div>
  <div class="stat"><b>6 лет</b><span>лидер продаж Битрикс24 по Дальнему Востоку</span></div>
  <div class="stat"><b>500+</b><span>сотрудников в компаниях федеральных внедрений</span></div>
</div></div></section>

<section class="sec" id="ourcompany" style="padding-top:16px"><div class="wrap">
  <div class="dark rv">
    <span class="eyebrow">О нас</span>
    <h2 class="h2">Компетенция, доказанная фактами</h2>
    <div class="proof-grid">
      <div class="proof"><img src="/assets/img/ic1.png" alt="" width="46" height="46"><h3>Лидер продаж на Дальнем Востоке</h3><p>Лидер продаж Битрикс24 по Дальнему Востоку в течение последних 6 лет.</p></div>
      <div class="proof"><img src="/assets/img/ic2.png" alt="" width="46" height="46"><h3>Масштабные федеральные внедрения</h3><p>Внедрение Битрикс24 в 4 компании со штатом сотрудников более 500 человек.</p></div>
      <div class="proof"><img src="/assets/img/ic3.png" alt="" width="46" height="46"><h3>8 лет реального опыта</h3><p>8 лет опыта внедрения CRM в различных нишах.</p></div>
    </div>
    <div class="dark-cta">${btnM('Внедрить CRM с лидером', 'Внедрить CRM с лидером', 'btn-light')}</div>
  </div>
</div></section>

<section class="sec"><div class="wrap"><div class="panel rv">
  <div class="split">
    <div class="split-sticky">
      <span class="eyebrow">Возможности</span>
      <h2 class="h2">CRM Битрикс24 — 15 инструментов, которые увеличат <span class="soft">эффективность каждого сотрудника</span></h2>
      <div style="margin-top:30px;display:flex;gap:12px;flex-wrap:wrap">
        ${btnM('Рассчитать стоимость', 'Рассчитать стоимость (инструменты)')}
        ${btnM('Получить подробную информацию', 'Получить подробную информацию', 'btn-ghost')}
      </div>
    </div>
    <div class="tools">
      <p class="tool-head">Сокращение времени работы с клиентом</p>
      ${tools1.map(tool).join('')}
      <p class="tool-head">100% контроль</p>
      ${tools2.map(tool).join('')}
    </div>
  </div>
</div></div></section>

<section class="sec" style="padding-top:16px"><div class="wrap"><div class="panel rv">
  <span class="eyebrow">Услуги</span>
  <h2 class="h2">Автоматизируем бизнес-процессы <span class="soft">в вашей компании</span></h2>
  <div class="svc-grid">
    ${svcs.map(([t, d, im], i) => `<article class="svc"><div><span class="no">0${i + 1}</span><h3>${t}</h3><p>${d}</p></div><img src="/assets/img/${im}" alt="" loading="lazy" width="130" height="130"></article>`).join('')}
  </div>
  <div style="margin-top:34px;display:flex;gap:12px;flex-wrap:wrap">${btnA('Подробнее', '/helpdesk/', 'btn-ghost')}${btnM('Начать проект', 'Начать проект')}</div>
</div></div></section>

<section class="sec" id="blog" style="padding-top:16px"><div class="wrap">
  <div style="display:flex;justify-content:space-between;align-items:end;gap:20px;flex-wrap:wrap" class="rv">
    <div><span class="eyebrow">Блог</span><h2 class="h2">Кейсы и решения</h2></div>
    ${btnA('Смотреть ещё', '/blog/', 'btn-ghost')}
  </div>
  <div class="filters rv" aria-label="Категории" style="margin-top:22px">${CATS.map(c => `<a class="filter" href="/blog/#${encodeURIComponent(c)}">${c}</a>`).join('')}</div>
  <div class="posts">${latest.map(p => postCard(p, false)).join('')}</div>
</div></section>

<section class="sec"><div class="wrap"><div class="panel rv">
  <div class="b24">
    <div>
      <span class="eyebrow">Платформа</span>
      <h2 class="h2">Работаем <span class="soft">с Битрикс24</span></h2>
      <p style="margin-top:22px;font-size:18px">Битрикс24 — лидер на рынке CRM-систем России. Команда Битрикс24 делает свой продукт реально крутым! Обновление 2 раза в год, куча базовых возможностей. Космический корабль, который при этом прост и надёжен.</p>
      <p style="font-size:18px">Доступны облачная и коробочная (для установки на ваш сервер) версии продукта.</p>
      <div class="b24-links">
        <a class="btn btn-ghost btn-sm" href="${SITE.b24Partner}" target="_blank" rel="noopener">Наш профиль партнера Битрикс24 ${ic('ext')}</a>
        <a class="btn btn-ghost btn-sm" href="${SITE.b24Box}" target="_blank" rel="noopener">Больше информации о коробочной версии ${ic('ext')}</a>
      </div>
      <a class="btn btn-primary" href="${SITE.b24Create}" target="_blank" rel="noopener">Создать свой Битрикс24 ${ic('arrow')}</a>
    </div>
    <div class="box"><img src="/assets/img/b24box.png" alt="Коробочная версия 1С-Битрикс24 «Корпоративный портал»" loading="lazy" width="380" height="380"></div>
  </div>
</div></div></section>

<section class="sec" style="padding-top:16px"><div class="wrap">
  <div class="cta rv">
    <div class="cta-ph"><img src="/assets/img/alexey.jpg" alt="Алексей Белимов, основатель компании «Логика»" loading="lazy" width="400" height="480"><div class="cap"><b>Алексей Белимов</b>основатель «Логика»</div></div>
    <div class="cta-b">
      <span class="eyebrow">Контакт</span>
      <h2 class="h2">Обсудим ваш проект?</h2>
      <ul>
        <li>${ic('check')}Выслушаем вас и вникнем в задачу</li>
        <li>${ic('check')}Расскажем своё видение проекта</li>
        <li>${ic('check')}Проработаем концепцию внедрения</li>
      </ul>
      <div style="display:flex;gap:12px;flex-wrap:wrap">${btnM('Обсудить проект', 'Обсудить проект')}<a class="btn btn-ghost" href="${SITE.phoneHref}">${ic('phone')} ${SITE.phone}</a></div>
    </div>
  </div>
</div></section>

<section class="sec" style="padding-top:16px"><div class="wrap">
  <div class="strip rv"><span class="t">Наши партнеры</span>
    ${partners.map(([n, h, f]) => `<a href="${h}" target="_blank" rel="noopener" aria-label="${n}"><img src="/assets/img/${f}" alt="${n}" loading="lazy"></a>`).join('')}
  </div>
</div></section>`;

  return layout({
    title: 'Настройка и сопровождение CRM Битрикс24 во Владивостоке | Логика',
    desc: 'Внедрение Битрикс24 от 34 990 ₽. 100+ внедрений, 8 лет опыта, лидер продаж Битрикс24 на Дальнем Востоке. Настройка, обучение, лицензии и сопровождение.',
    path: '/', body, ld: ldScript(org),
  });
}

/* =========================================================
   LISTS
   ========================================================= */
function casesPage() {
  const list = POSTS.filter(p => p.isCase);
  const body = pageHero({
    crumbs: [['Главная', '/'], ['Кейсы', null]],
    h1: 'Кейсы внедрения Битрикс24 от компании Логика',
    lead: 'Реальные проекты: что хотел клиент, что мы сделали и какой результат получили.',
    cta: btnM('Обсудить ваш проект', 'Кейсы: обсудить проект'),
  }) + `<section class="sec" style="padding-top:20px"><div class="wrap">${filters()}<div class="posts">${list.map(p => postCard(p)).join('')}</div></div></section>`;
  return layout({ title: 'Кейсы внедрения Битрикс24 от компании Логика', desc: 'Наши кейсы по внедрению Битрикс24: торговые, экспертные, строительные компании, учебные центры, переезд с AmoCRM.', path: '/cases/', body, active: 'cases' });
}
function blogPage() {
  const body = pageHero({
    crumbs: [['Главная', '/'], ['Блог', null]],
    h1: 'Блог: кейсы и решения для Битрикс24',
    lead: 'Новости, готовые решения и истории внедрений.',
  }) + `<section class="sec" style="padding-top:20px"><div class="wrap">${filters()}<div class="posts">${POSTS.map(p => postCard(p)).join('')}</div></div></section>
<script>(function(){var h=decodeURIComponent(location.hash.slice(1));if(h){var b=document.querySelector('.filter[data-cat="'+h+'"]');if(b)b.click();}})();</script>`;
  return layout({ title: 'Блог — кейсы и решения для Битрикс24 | Логика', desc: 'Блог компании Логика: кейсы внедрения, решения и акции Битрикс24.', path: '/blog/', body, active: 'blog' });
}

/* =========================================================
   POST
   ========================================================= */
function postPage(p, i) {
  const group = POSTS.filter(x => x.isCase === p.isCase);
  const idx = group.indexOf(p);
  const prev = group[idx + 1], next = group[idx - 1];
  const sec = p.isCase ? ['Кейсы', '/cases/'] : ['Блог', '/blog/'];
  const body = `
<section class="ph"><div class="wrap"><div class="art">
  <nav class="crumbs" aria-label="Хлебные крошки"><a href="/">Главная</a><span aria-hidden="true">/</span><a href="${sec[1]}">${sec[0]}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.title)}</span></nav>
  <h1 style="font-size:clamp(30px,4.6vw,56px)">${esc(p.title)}</h1>
  <p class="lead" style="margin-top:14px">${esc(p.desc)}</p>
  <div class="art-meta">${p.cats.map(c => `<span class="cat">${esc(c)}</span>`).join('')}</div>
</div></div></section>
<section class="sec" style="padding-top:0"><div class="wrap"><div class="art">
  <div class="art-body">${p.body}${p.cta ? `<p><a class="btn btn-primary" href="${p.cta.href}" rel="noopener">${p.cta.text}${ic('arrow')}</a></p>` : ''}</div>
  <div class="panel" style="margin-top:20px;text-align:center"><h2 style="font-size:30px">Хотите так же?</h2><p style="margin:12px 0 22px">Расскажите о задаче — предложим решение и посчитаем стоимость.</p>${btnM('Обсудить проект', 'Статья: ' + p.title)}</div>
  <div class="share-nav">
    ${prev ? `<a class="btn btn-ghost btn-sm" href="${prev.url}">← ${esc(prev.title)}</a>` : '<span></span>'}
    ${next ? `<a class="btn btn-ghost btn-sm" href="${next.url}">${esc(next.title)} →</a>` : ''}
  </div>
</div></div></section>`;
  const ld = ldScript({ '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: p.desc, datePublished: p.date, author: { '@type': 'Organization', name: 'Логика' }, publisher: org });
  return layout({ title: `${p.title} | Логика`, desc: p.desc, path: p.url, body, active: p.isCase ? 'cases' : 'blog', ld, og: p.img ? `/assets/img/${p.img}` : '/assets/logo.png' });
}

/* =========================================================
   MARKET + APPS
   ========================================================= */
function marketPage() {
  const body = pageHero({
    crumbs: [['Главная', '/'], ['Приложения', null]],
    h1: 'Наши приложения для Битрикс24',
    lead: 'Мы оказываем услуги по разработке приложений для Битрикс24 и разрабатываем собственные.',
    cta: btnM('Оставить заявку на разработку приложения', 'Разработка приложения') + `<a class="btn btn-ghost" href="${SITE.tg}" target="_blank" rel="noopener">${ic('tg')} Написать в Telegram</a>`,
  }) + `<section class="sec" style="padding-top:20px"><div class="wrap"><div class="apps">
${APPS.map(a => `<article class="app rv"><div class="app-ic">${ic(a.icon)}</div><h3>${esc(a.title)}</h3><p>${esc(a.short)}</p>${a.page ? btnA('Страница приложения', `/market/${a.slug}.html`, 'btn-ghost') : btnM('Узнать подробнее', 'Приложение: ' + a.title, 'btn-ghost')}</article>`).join('')}
</div></div></section>`;
  return layout({ title: 'Наши приложения для Битрикс24 | Логика', desc: 'Приложения для Битрикс24: коннектор WhatsApp, Telegram и MAX, калькулятор перевозок, дубли лидов, ЭДО Диадок и другие. Разработка приложений на заказ.', path: '/market/', body, active: 'market' });
}
function appPage(a) {
  const d = APP_PAGES[a.slug];
  const body = pageHero({
    crumbs: [['Главная', '/'], ['Приложения', '/market/'], [esc(a.title), null]],
    h1: d.h1, lead: d.lead,
    cta: btnM('Оставить заявку', 'Приложение: ' + a.title) + `<a class="btn btn-ghost" href="${SITE.tg}" target="_blank" rel="noopener">${ic('tg')} Написать в ТГ</a>`,
  }) + `<section class="sec" style="padding-top:20px"><div class="wrap"><div class="art"><div class="art-body">${d.body}</div>
<div class="share-nav"><a class="btn btn-ghost btn-sm" href="/market/">← Другие приложения</a></div></div></div></section>`;
  return layout({ title: `${d.h1} — приложение для Битрикс24 | Логика`, desc: d.lead, path: `/market/${a.slug}.html`, body, active: 'market' });
}

/* =========================================================
   HELPDESK
   ========================================================= */
function helpdesk() {
  const faq = [
    ['Как происходит сопровождение моего портала?', '<p>Мы создаем групповой чат в WhatsApp или Telegram, куда мы вместе с вами добавляем всех ответственных сотрудников и руководителей отделов. Они пишут в данный чат вопросы по работе с системой или сервисами, что связаны с Б24, а мы на них отвечаем. Если требуются мелкие доработки — делаем сразу, если какие-то крупные — сначала согласуем с вами и после отправляем в работу.</p><p>По необходимости устраиваем конференции в Zoom, Skype или договариваемся на встречу в офисе, где в формате демонстрации экрана более детально и наглядно обсуждаем задачи и варианты их разрешения.</p>'],
    ['Сколько стоит поддержка?', '<p>Продаем поддержку пакетами по 10 или 20 часов — стоят пакеты 35 000 и 70 000 ₽ соответственно. Когда пакет заканчивается — выставляем следующий счет. Тарификация поминутная. Это значит — сколько задача заняла времени, столько вы и заплатите. Сколько часов у вас будет уходить в месяц — зависит от количества ваших вопросов и задач. Чем больше у вас вопросов, тем быстрее заканчивается пакет.</p><p>Кому-то хватает 10 часов на год, кому-то 20 на 1 месяц. В среднем у компании из 15 человек в месяц уходит 3–4 часа.</p>'],
    ['Как происходит учет времени?', '<p>Время мы фиксируем в задаче на своем портале (таком же Битрикс24, как и у вас!). По вашей просьбе в любой момент можем предоставить вам лист учета рабочего времени, где будет отмечено, когда, от кого и какой вопрос поступил и сколько времени было потрачено на его решение. По мере выработки пакета услуг, вместе с закрывающими документами мы всегда прикладываем всю расшифровку учета времени в автоматическом формате.</p>'],
    ['Почему наша поддержка лучше поддержки от Битрикс24?', '<p>Мы точно быстрее в разы (обычно отвечаем в течение 30 минут) и качественнее. Получив вопрос, мы предлагаем варианты решения исходя из нашего опыта, а не пишем какие-то отписки.</p>'],
    ['Платежи за нашу поддержку ежемесячные?', '<p>Нет, мы выставляем счет на следующий пакет после окончания предыдущего. Это значит, если у вас мало вопросов — одного пакета может хватить на 5 месяцев и следующий счет будет через 5 месяцев. А если вопросов много — ваш пакет может закончиться и за 2 недели. При этом перед каждым выставлением следующего счета вы получаете лист учета времени, где будет учтена каждая минута предыдущего пакета.</p><p>Единственное, есть ограничение по сроку жизни пакета — 6 месяцев. Если не израсходуете пакет за это время — он сгорит. Но мы тщательно подбирали этот срок, исходя из нашего многолетнего опыта, чтобы в штатном режиме не случались ситуации, что пакет скоро сгорит, хотя работа идет активная.</p>'],
    ['Сколько стоят пакеты поддержки Битрикс24?', '<p>На данный момент наши цены:</p><ul style="margin:10px 0 0 20px"><li>Пакет поддержки 10 часов — 35 000 ₽;</li><li>Пакет поддержки 20 часов — 70 000 ₽.</li></ul>'],
    ['Что надо, чтобы начать работу?', '<p>Нужны ваши реквизиты для выставления счета, а также доступ к вашему порталу — нас можно пригласить как интеграторов. Далее мы создадим групповой чат в мессенджере и приступим к работе.</p>'],
  ];
  const cta = btnM('Оставить заявку', 'Сопровождение: заявка') + `<a class="btn btn-wa" href="${SITE.wa}" target="_blank" rel="noopener">${ic('wa')} Написать в WhatsApp</a>`;
  const body = pageHero({
    crumbs: [['Главная', '/'], ['Сопровождение', null]],
    h1: 'Удобная и качественная поддержка вашего Битрикс24',
    lead: 'Мы оказываем услуги по сопровождению Битрикс24. Берем на себя: настройки, ответы на вопросы, обучение. Работаем из Владивостока по всей России.',
    cta,
  }) + `
<section class="sec" style="padding-top:20px"><div class="wrap"><div class="panel rv">
  <div class="callout" style="margin:0 0 30px">Если у вас есть Битрикс24 и есть вопросы, которые надо решить, настроить или доделать — это предложение для вас!</div>
  <span class="eyebrow">Наша поддержка</span>
  <h2 class="h2">Наша поддержка — это</h2>
  <div class="feat">
    <div><span class="ic">${ic('headset')}</span><h3>Вдумчивый подход</h3><p>Мы вникаем в ваши вопросы и предлагаем оптимальные решения.</p></div>
    <div><span class="ic">${ic('trend')}</span><h3>Большой и крутой опыт</h3><p>Наш опыт работы с Битрикс24 — 8 лет. Для многих задач уже есть наработанные решения, которые мы вам подсказываем.</p></div>
    <div><span class="ic">${ic('zap')}</span><h3>Скорость</h3><p>Мы оперативно отвечаем. Обычно укладываемся в 30 минут. Если срочный вопрос — можно позвонить!</p></div>
    <div><span class="ic">${ic('clock')}</span><h3>Другой часовой пояс</h3><p>Мы работаем из Владивостока. Если вы вечером по МСК задаете вопросы — к вашему утру они будут решены.</p></div>
  </div>
  <div style="margin-top:34px;display:flex;gap:12px;flex-wrap:wrap">${cta}</div>
</div></div></section>

<section class="sec" style="padding-top:16px" id="faq"><div class="wrap"><div class="panel rv">
  <span class="eyebrow">Вопросы и ответы</span>
  <h2 class="h2">Ответы на все вопросы</h2>
  <div class="faq">${faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}${ic('plus')}</summary><div class="a">${a}</div></details>`).join('')}</div>
  <div class="tariffs">
    <div class="tariff"><h3>Пакет поддержки 10 часов</h3><b>35 000 ₽</b><p>Тарификация поминутная. Срок жизни пакета — 6 месяцев.</p></div>
    <div class="tariff hot"><h3>Пакет поддержки 20 часов</h3><b>70 000 ₽</b><p>Тарификация поминутная. Срок жизни пакета — 6 месяцев.</p></div>
  </div>
  <div style="margin-top:30px;display:flex;gap:12px;flex-wrap:wrap">${cta}</div>
</div></div></section>

<section class="sec" style="padding-top:16px"><div class="wrap"><div class="panel rv">
  <span class="eyebrow">Почему мы</span>
  <h2 class="h2">С нами здорово работать!</h2>
  <p class="lead" style="margin-top:16px">Мы каждый день на связи и готовы решать вопросы ;) Мы общаемся с вами в чате — WhatsApp или Telegram. Вы и ваши сотрудники пишете туда, а мы оперативно отвечаем.</p>
  <div class="feat feat-3">
    <div><span class="ic">${ic('chat')}</span><h3>Быстро и удобно</h3><p>Если мы видим, что можно сделать лучше — обязательно предложим вам это реализовать. Работать в Битрикс24 реально становится приятнее.</p></div>
    <div><span class="ic">${ic('book')}</span><h3>Вдумчивый подход</h3><p>Подключаем всевозможные сторонние сервисы, связанные с работой вашего бизнеса, и интегрируем их в систему Битрикс24.</p></div>
    <div><span class="ic">${ic('layers' in P ? 'layers' : 'zap')}</span><h3>Настройка интеграций</h3><p>Интеграции с сервисами, телефонией, мессенджерами и учётными системами.</p></div>
  </div>
</div></div></section>

<section class="sec" style="padding-top:16px"><div class="wrap"><div class="dark rv">
  <span class="eyebrow">Об опыте</span>
  <h2 class="h2">Компетенция, доказанная фактами</h2>
  <div class="proof-grid">
    <div class="proof"><img src="/assets/img/ic1.png" alt="" width="46" height="46"><h3>Лидер продаж на Дальнем Востоке</h3><p>Лидер продаж Битрикс24 по Дальнему Востоку в течение последних 6 лет.</p></div>
    <div class="proof"><img src="/assets/img/ic2.png" alt="" width="46" height="46"><h3>Есть опыт крупных внедрений</h3><p>Внедрили Битрикс24 в 3 компании со штатом сотрудников более 500 человек.</p></div>
    <div class="proof"><img src="/assets/img/ic3.png" alt="" width="46" height="46"><h3>8 лет реального опыта</h3><p>8 лет опыта внедрения и сопровождения CRM в различных нишах.</p></div>
  </div>
  <div class="dark-cta">${btnM('Оставить заявку на личную консультацию', 'Сопровождение: личная консультация', 'btn-light')}</div>
</div></div></section>

<section class="sec" style="padding-top:16px"><div class="wrap"><div class="contacts">
  <div class="cbox rv"><span class="eyebrow">Контакты</span><h2 class="h2" style="font-size:clamp(28px,3.4vw,42px)">Оставьте заявку, и мы обязательно свяжемся с вами!</h2>
    <form class="form" data-lead>${leadFormFields('hd', 'Сопровождение: форма внизу страницы')}</form></div>
  <div class="cbox rv"><span class="eyebrow">Свяжитесь с нами</span><h2 class="h2" style="font-size:clamp(28px,3.4vw,42px)">Если остались вопросы или пожелания</h2>
    <p style="margin-top:14px">Свяжитесь с нами любым удобным для вас способом.</p>
    <dl><div><dt>Телефон</dt><dd><a href="${SITE.phone2Href}">${SITE.phone2}</a></dd></div><div><dt>Почта</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div><div><dt>Мессенджеры</dt><dd><a href="${SITE.wa}" target="_blank" rel="noopener">WhatsApp</a> · <a href="${SITE.tg}" target="_blank" rel="noopener">Telegram</a></dd></div></dl>
  </div>
</div></div></section>`;
  const ld = ldScript({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() } })) });
  return layout({ title: 'Сопровождение Битрикс24 — поддержка пакетами 10 и 20 часов | Логика', desc: 'Поддержка вашего Битрикс24: ответы в течение 30 минут, пакеты 10 часов — 35 000 ₽ и 20 часов — 70 000 ₽, поминутная тарификация.', path: '/helpdesk/', body, active: 'helpdesk', ld });
}

/* =========================================================
   POLICY
   ========================================================= */
function policy() {
  const body = pageHero({ crumbs: [['Главная', '/'], ['Политика конфиденциальности', null]], h1: 'Политика конфиденциальности', lead: 'Политика в отношении обработки персональных данных' }) + `
<section class="sec" style="padding-top:20px"><div class="wrap"><div class="art"><div class="art-body">
<h2>1. Общие положения</h2>
<p>Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006 №152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных ИП Белимов Алексей Владимирович (далее — Оператор).</p>
<p>Оператор ставит своей важнейшей целью и условием осуществления своей деятельности соблюдение прав и свобод человека и гражданина при обработке его персональных данных, в том числе защиты прав на неприкосновенность частной жизни, личную и семейную тайну.</p>
<p>Настоящая политика Оператора в отношении обработки персональных данных (далее — Политика) применяется ко всей информации, которую Оператор может получить о посетителях веб-сайта ${SITE.domain.replace('https', 'http')}.</p>
<h2>2. Основные понятия, используемые в Политике</h2>
<ul>
<li><b>Автоматизированная обработка персональных данных</b> — обработка персональных данных с помощью средств вычислительной техники;</li>
<li><b>Блокирование персональных данных</b> — временное прекращение обработки персональных данных (за исключением случаев, если обработка необходима для уточнения персональных данных);</li>
<li><b>Веб-сайт</b> — совокупность графических и информационных материалов, а также программ для ЭВМ и баз данных, обеспечивающих их доступность в сети интернет по сетевому адресу ${SITE.domain.replace('https', 'http')};</li>
<li><b>Информационная система персональных данных</b> — совокупность содержащихся в базах данных персональных данных и обеспечивающих их обработку информационных технологий и технических средств;</li>
<li><b>Обезличивание персональных данных</b> — действия, в результате которых невозможно определить без использования дополнительной информации принадлежность персональных данных конкретному Пользователю или иному субъекту персональных данных;</li>
<li><b>Обработка персональных данных</b> — любое действие (операция) или совокупность действий (операций), совершаемых с использованием средств автоматизации или без использования таких средств с персональными данными, включая сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (распространение, предоставление, доступ), обезличивание, блокирование, удаление, уничтожение персональных данных;</li>
<li><b>Оператор</b> — государственный орган, муниципальный орган, юридическое или физическое лицо, самостоятельно или совместно с другими лицами организующие и (или) осуществляющие обработку персональных данных, а также определяющие цели обработки персональных данных, состав персональных данных, подлежащих обработке, действия (операции), совершаемые с персональными данными;</li>
<li><b>Персональные данные</b> — любая информация, относящаяся прямо или косвенно к определенному или определяемому Пользователю веб-сайта;</li>
<li><b>Пользователь</b> — любой посетитель веб-сайта;</li>
<li><b>Предоставление персональных данных</b> — действия, направленные на раскрытие персональных данных определенному лицу или определенному кругу лиц;</li>
<li><b>Распространение персональных данных</b> — любые действия, направленные на раскрытие персональных данных неопределенному кругу лиц (передача персональных данных) или на ознакомление с персональными данными неограниченного круга лиц, в том числе обнародование персональных данных в средствах массовой информации, размещение в информационно-телекоммуникационных сетях или предоставление доступа к персональным данным каким-либо иным способом;</li>
<li><b>Трансграничная передача персональных данных</b> — передача персональных данных на территорию иностранного государства органу власти иностранного государства, иностранному физическому или иностранному юридическому лицу;</li>
<li><b>Уничтожение персональных данных</b> — любые действия, в результате которых персональные данные уничтожаются безвозвратно с невозможностью дальнейшего восстановления содержания персональных данных в информационной системе персональных данных и (или) в результате которых уничтожаются материальные носители персональных данных.</li>
</ul>
<h2>3. Оператор может обрабатывать следующие персональные данные Пользователя</h2>
<ul><li>Фамилия, имя, отчество;</li><li>Электронный адрес;</li><li>Номера телефонов;</li></ul>
<p>Также на сайте происходит сбор и обработка обезличенных данных о посетителях (в т.ч. файлов «cookie») с помощью сервисов интернет-статистики (Яндекс Метрика и других). Вышеперечисленные данные далее по тексту Политики объединены общим понятием Персональные данные.</p>
<h2>4. Цели обработки персональных данных</h2>
<p>Цель обработки персональных данных Пользователя — информирование Пользователя посредством отправки электронных писем. Также Оператор имеет право направлять Пользователю уведомления о новых продуктах и услугах, специальных предложениях и различных событиях. Пользователь всегда может отказаться от получения информационных сообщений, направив Оператору письмо на адрес электронной почты <a href="mailto:${SITE.email}">${SITE.email}</a> с пометкой «Отказ от уведомлениях о новых продуктах и услугах и специальных предложениях».</p>
<p>Обезличенные данные Пользователей, собираемые с помощью сервисов интернет-статистики, служат для сбора информации о действиях Пользователей на сайте, улучшения качества сайта и его содержания.</p>
<h2>5. Правовые основания обработки персональных данных</h2>
<p>Оператор обрабатывает персональные данные Пользователя только в случае их заполнения и/или отправки Пользователем самостоятельно через специальные формы, расположенные на сайте. Заполняя соответствующие формы и/или отправляя свои персональные данные Оператору, Пользователь выражает свое согласие с данной Политикой.</p>
<p>Оператор обрабатывает обезличенные данные о Пользователе в случае, если это разрешено в настройках браузера Пользователя (включено сохранение файлов «cookie» и использование технологии JavaScript).</p>
<h2>6. Порядок сбора, хранения, передачи и других видов обработки персональных данных</h2>
<p>Безопасность персональных данных, которые обрабатываются Оператором, обеспечивается путем реализации правовых, организационных и технических мер, необходимых для выполнения в полном объеме требований действующего законодательства в области защиты персональных данных.</p>
<p>Оператор обеспечивает сохранность персональных данных и принимает все возможные меры, исключающие доступ к персональным данным неуполномоченных лиц. Персональные данные Пользователя никогда, ни при каких условиях не будут переданы третьим лицам, за исключением случаев, связанных с исполнением действующего законодательства.</p>
<p>В случае выявления неточностей в персональных данных Пользователь может актуализировать их самостоятельно, путем направления Оператору уведомления на адрес электронной почты Оператора <a href="mailto:${SITE.email}">${SITE.email}</a> с пометкой «Актуализация персональных данных».</p>
<p>Срок обработки персональных данных является неограниченным. Пользователь может в любой момент отозвать свое согласие на обработку персональных данных, направив Оператору уведомление посредством электронной почты на электронный адрес Оператора <a href="mailto:${SITE.email}">${SITE.email}</a> с пометкой «Отзыв согласия на обработку персональных данных».</p>
<h2>7. Трансграничная передача персональных данных</h2>
<p>Оператор до начала осуществления трансграничной передачи персональных данных обязан убедиться в том, что иностранным государством, на территорию которого предполагается осуществлять передачу персональных данных, обеспечивается надежная защита прав субъектов персональных данных.</p>
<p>Трансграничная передача персональных данных на территории иностранных государств, не отвечающих вышеуказанным требованиям, может осуществляться только в случае наличия согласия в письменной форме субъекта персональных данных на трансграничную передачу его персональных данных и/или исполнения договора, стороной которого является субъект персональных данных.</p>
<h2>8. Заключительные положения</h2>
<p>Пользователь может получить любые разъяснения по интересующим вопросам, касающимся обработки его персональных данных, обратившись к Оператору с помощью электронной почты <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
<p>В данном документе будут отражены любые изменения политики обработки персональных данных Оператором. Политика действует бессрочно до замены ее новой версией. Актуальная версия Политики в свободном доступе расположена в сети Интернет по адресу ${SITE.domain.replace('https', 'http')}.</p>
<h2>Данные о юр. лице</h2>
<dl class="facts">
<div><dt>Наименование организации</dt><dd>ИП Белимов Алексей Владимирович</dd></div>
<div><dt>Тел. номер</dt><dd>${SITE.phone}</dd></div>
<div><dt>Почта</dt><dd>${SITE.email}</dd></div>
<div><dt>ИНН</dt><dd>250306015869</dd></div>
<div><dt>ОГРНИП</dt><dd>316250300051964</dd></div>
<div><dt>ОКПО</dt><dd>0104281324</dd></div>
<div><dt>ОКТМО</dt><dd>05706000</dd></div>
<div><dt>ОКВЭД</dt><dd>62.02</dd></div>
<div><dt>Рег. № ПФР</dt><dd>035009068443</dd></div>
<div><dt>Расчетный счет</dt><dd>40802810420050000451</dd></div>
<div><dt>Банк</dt><dd>ФИЛИАЛ «ХАБАРОВСКИЙ» АО «АЛЬФА-БАНК»</dd></div>
<div><dt>БИК</dt><dd>040813770</dd></div>
<div><dt>Корр. счет</dt><dd>30101810800000000770</dd></div>
</dl>
<h2>Сведения об оказании услуги и возврате ДС</h2>
<ol>
<li>Информация о порядке оказания услуги — услуги оказываются дистанционно, через интернет или очно.</li>
<li>Оплаты производятся через сайт на р/с исполнителя или через сервис Robokassa.</li>
<li>Для возврата денежных средств необходимо написать заявление в свободной форме на почту <a href="mailto:${SITE.email}">${SITE.email}</a>, после чего будет произведен возврат.</li>
</ol>
</div></div></div></section>`;
  return layout({ title: 'Политика конфиденциальности, данные о юр. лице | Логика', desc: 'Политика обработки персональных данных, реквизиты ИП Белимов А.В., порядок оказания услуг и возврата денежных средств.', path: '/policy/', body });
}

function notFound() {
  const body = `<section class="ph"><div class="wrap"><div class="ph-in"><h1>404 — страница не найдена</h1><p class="lead">Возможно, она была перемещена, или вы неправильно указали адрес страницы.</p><div class="ph-cta">${btnA('На главную', '/')}</div></div></div></section>`;
  return layout({ title: 'Страница не найдена | Логика', desc: 'Страница не найдена', path: '/404.html', body, noindex: true });
}

/* =========================================================
   BUILD
   ========================================================= */
write('index.html', home());
write('cases/index.html', casesPage());
write('blog/index.html', blogPage());
POSTS.forEach((p, i) => write(p.url.slice(1), postPage(p, i)));
write('market/index.html', marketPage());
APPS.filter(a => a.page).forEach(a => write(`market/${a.slug}.html`, appPage(a)));
write('helpdesk/index.html', helpdesk());
write('policy/index.html', policy());
write('404.html', notFound());

write('assets/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#303174"/><path d="M8 22 24 22 16 8Z" fill="none" stroke="#2fc6f6" stroke-width="2.4" stroke-linejoin="round"/><path d="M12.500 19h7L16 13Z" fill="#ff8562"/></svg>`);

/* sitemap / robots / htaccess */
const urls = ['/', '/cases/', '/blog/', '/market/', '/helpdesk/', '/policy/', ...POSTS.map(p => p.url), ...APPS.filter(a => a.page).map(a => `/market/${a.slug}.html`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE.domain}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE.domain}/sitemap.xml\n`);
const redirects = Object.entries(OLD_URLS).map(([o, slug]) => { const p = POSTS.find(x => x.slug === slug); return `Redirect 301 ${o} ${p.url}`; }).join('\n');
write('.htaccess', `# Apache (если на хостинге Nginx — см. README.md)
ErrorDocument 404 /404.html
DirectoryIndex index.html
Options -Indexes

<IfModule mod_rewrite.c>
RewriteEngine On
# https
RewriteCond %{HTTPS} off
RewriteCond %{HTTP:X-Forwarded-Proto} !https
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Старые адреса сайта на Tilda → новые страницы
${redirects}
RedirectMatch 301 ^/cases$ /cases/
RedirectMatch 301 ^/helpdesk$ /helpdesk/
RedirectMatch 301 ^/market$ /market/
RedirectMatch 301 ^/policy$ /policy/
RedirectMatch 301 ^/calculator$ /market/calculator.html
RedirectMatch 301 ^/translit$ /market/translit.html
RedirectMatch 301 ^/tasks$ /market/tasks.html
RedirectMatch 301 ^/bd$ /market/bd.html
RedirectMatch 301 ^/antileads$ /market/antileads.html
RedirectMatch 301 ^/diadoc$ /market/diadoc.html
RedirectMatch 301 ^/max$ /market/
RedirectMatch 301 ^/avtoinport$ /market/

<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml application/json
</IfModule>
<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType image/png "access plus 1 year"
ExpiresByType image/jpeg "access plus 1 year"
ExpiresByType image/svg+xml "access plus 1 year"
ExpiresByType font/ttf "access plus 1 year"
ExpiresByType text/css "access plus 1 month"
ExpiresByType application/javascript "access plus 1 month"
</IfModule>
`);
console.log('Built', urls.length, 'pages');




