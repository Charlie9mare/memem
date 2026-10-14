/* Shared helpers + header/footer + loading screen */
(function () {
  const C = window.TACH_CONFIG, B = C.business;
  const T = (window.T = {});
  T.logo = 'assets/logo.svg';
  T.ready = new Promise(r => (T._ready = r));
  T.$ = (s, r = document) => r.querySelector(s);
  T.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  T.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  T.uid = p => p + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2, 4).toUpperCase();
  T.phoneIntl = p => { let d = String(p).replace(/\D/g, ''); if (d.startsWith('0')) d = '234' + d.slice(1); return d; };
  T.wa = text => `https://wa.me/${B.whatsapp}?text=${encodeURIComponent(text)}`;
  T.naira = n => '₦' + Number(n).toLocaleString('en-NG');
  T.fmtDate = iso => new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  T.COLORS = [
    { n: 'White', h: '#f4f4f2' }, { n: 'Ivory', h: '#ece6d6' }, { n: 'Beige', h: '#cdb99a' }, { n: 'Grey', h: '#8d95a0' },
    { n: 'Charcoal', h: '#3c4350' }, { n: 'Black', h: '#1d1f24' }, { n: 'Brown', h: '#6b4a35' }, { n: 'Navy', h: '#2b3a55' },
    { n: 'Sage green', h: '#9cae9a' }, { n: 'Gold', h: '#c9a24a' }, { n: 'Red', h: '#c94b44' }, { n: 'Wine', h: '#6e2a35' }
  ];
  T.colorName = h => (T.COLORS.find(c => c.h.toLowerCase() === String(h).toLowerCase()) || {}).n || h;

  const ICON = {
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.500-.7-1.700-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.700 6.700 0 0 1-3.300-2.900c-.2-.4.2-.4.700-1.300.1-.2 0-.3 0-.5l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.300 3 3 0 0 0-.9 2.200 5.200 5.200 0 0 0 1.100 2.800 11.800 11.800 0 0 0 4.500 4c1.700.7 2.300.8 3.200.7a2.700 2.700 0 0 0 1.800-1.300 2.200 2.200 0 0 0 .2-1.300c-.1-.1-.3-.2-.5-.3z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.500 4.500L19 7.500"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/><path d="M12 15V4m0 0L7.500 8.500M12 4l4.500 4.500"/></svg>',
    ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="8" rx="1.500"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></svg>',
    tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.500 6.500a4 4 0 0 0-5 5L3 18l3 3 6.500-6.500a4 4 0 0 0 5-5l-2.500 2.500-2.500-.5-.5-2.500z"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.500 11h10l2-8H6.500"/><circle cx="9" cy="19.500" r="1.200"/><circle cx="17" cy="19.500" r="1.200"/></svg>'
  };
  T.ICON = ICON;

  /* ---------- Blind illustration (used when a product has no photo) ---------- */
  T.blindArt = (style, hex) => {
    let s = '';
    if (style === 'vertical') {
      for (let i = 0; i < 14; i++) s += `<rect x="${(i * 28.6).toFixed(1)}" y="14" width="26" height="276" rx="2" fill="${hex}"/><rect x="${(i * 28.6).toFixed(1)}" y="14" width="9" height="276" fill="#fff" opacity=".2"/><rect x="${(i * 28.6 + 20).toFixed(1)}" y="14" width="6" height="276" fill="#000" opacity=".08"/>`;
      s += '<rect width="400" height="16" fill="#2a3242"/>';
    } else {
      for (let i = 0; i < 17; i++) s += `<rect x="14" y="${22 + i * 16}" width="372" height="12" rx="3" fill="${hex}"/><rect x="14" y="${22 + i * 16}" width="372" height="4" rx="2" fill="#fff" opacity=".25"/>`;
      s += '<rect x="8" y="6" width="384" height="14" rx="3" fill="#2a3242"/><rect x="8" y="292" width="384" height="6" rx="3" fill="#2a3242"/>';
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9eef5"/><stop offset="1" stop-color="#cfd9e6"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/>${s}</svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  };
  T.productImg = p => {
    if (p.image) return `<img src="${p.image}" alt="${T.esc(p.name)}" loading="lazy">`;
    if (p.type === 'blind') return `<img src="${T.blindArt(p.style, p.color || '#8d95a0')}" alt="${T.esc(p.name)}" loading="lazy">`;
    return `<span class="emo" aria-hidden="true">${p.emoji || '🛒'}</span>`;
  };
  T.tint = cat => (window.TACH_CAT_TINT || {})[cat] || '#eef1f6';

  /* ---------- Image compression (keeps uploads small) ---------- */
  T.compress = (file, max = 900, q = 0.65) => new Promise((res, rej) => {
    const r = new FileReader(); r.onerror = rej;
    r.onload = () => {
      const im = new Image(); im.onerror = rej;
      im.onload = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', q));
      };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  });

  /* ---------- Toast ---------- */
  T.toast = msg => {
    let t = T.$('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(T._t); T._t = setTimeout(() => t.classList.remove('show'), 2200);
  };

  /* ---------- Food list (shared across pages) ---------- */
  T.foodList = {
    get() { try { return JSON.parse(localStorage.getItem('tach_foodlist')) || []; } catch (e) { return []; } },
    set(l) { localStorage.setItem('tach_foodlist', JSON.stringify(l)); T.updateCount(true); },
    add(item) {
      const l = this.get(); const i = l.findIndex(x => x.id === item.id);
      if (i > -1) l[i].qty += item.qty || 1; else l.push({ qty: 1, ...item });
      this.set(l);
    }
  };
  T.updateCount = bump => {
    const n = T.foodList.get().length + (T.blindCart ? T.blindCart.get().length : 0);
    T.$$('[data-list-count]').forEach(b => { b.textContent = n; b.hidden = !n; if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } });
  };

  /* ---------- Header + footer ---------- */
  const page = document.body.dataset.page || '';
  const nav = [['home', 'index.html', 'Home'], ['food', 'order-food.html', 'Food Items'], ['blinds', 'order-blinds.html', 'Window Blinds'], ['about', 'about.html', 'About Us'], ['contact', 'contact.html', 'Contact'], ['orders', 'my-orders.html', 'My Orders'], ['cart', 'cart.html', 'Cart']];
  function chrome() {
    const h = T.$('#site-header'), f = T.$('#site-footer');
    const ph = B.phones.map(p => `<a href="tel:${p}">${p}</a>`).join(' / ');
    if (h) h.innerHTML = `
      <div class="topbar"><div class="wrap">
        <div class="tb-l"><span>${ICON.pin}${T.esc(B.address)}</span></div>
        <div class="tb-r"><span>${ICON.phone}${ph}</span><a href="${T.wa('Hello Tachbonest, I need some help.')}" target="_blank" rel="noopener">${ICON.wa.replace('<svg', '<svg style="color:#4ade80"')}Chat on WhatsApp</a></div>
      </div></div>
      <header class="site-head" id="head">
        <div class="wrap head-row">
          <a class="brand" href="index.html" aria-label="${T.esc(B.name)} home"><img src="${T.logo}" alt=""><span class="brand-text"><b>TACHBONEST CLASSIC</b><i>Ventures</i></span></a>
          <form class="search" id="siteSearch" role="search">
            <label class="sr" for="sq">Search</label>
            <select id="searchCat" aria-label="Category"><option value="all">All</option><option value="blind">Blinds</option><option value="food">Food items</option></select>
            <input id="sq" type="search" placeholder="Search blinds or food items…" autocomplete="off">
            <button type="submit">Search</button>
          </form>
          <a class="head-act" href="cart.html" aria-label="My cart"><span class="cnt">${ICON.cart}<b data-list-count hidden>0</b></span><span class="t">My cart</span></a>
        </div>
        <button class="burger" id="burger" aria-label="Menu" aria-expanded="false"><span></span></button>
        <nav class="main-nav" id="mainNav" aria-label="Main"><div class="wrap">
          ${nav.map(n => `<a href="${n[1]}" class="${page === n[0] ? 'on' : ''}">${n[2]}</a>`).join('')}
          <a class="push" href="tel:${B.phones[0]}">Call ${B.phones[0]}</a>
        </div></nav>
      </header>`;
    if (f) f.innerHTML = `
      <footer class="foot" id="contact"><div class="wrap">
        <div class="foot-grid">
          <div><a class="brand" href="index.html"><img src="${T.logo}" alt="" style="filter:brightness(0) invert(1)"><span class="brand-text"><b>TACHBONEST CLASSIC</b><i>Ventures</i></span></a>
            <p style="margin-top:14px;max-width:340px">${T.esc(B.description || 'Vertical and Venetian window blinds, plus a food shopping service from your list.')} ${T.esc(B.bn)}.</p></div>
          <div><h4>Quick links</h4><ul>${nav.map(n => `<li><a href="${n[1]}">${n[2]}</a></li>`).join('')}<li><a href="admin.html">Staff login</a></li></ul></div>
          <div><h4>Find us</h4><ul>
            <li>${T.esc(B.address)}</li>
            <li>${ph}</li>
            ${B.email ? `<li><a href="mailto:${B.email}">${T.esc(B.email)}</a></li>` : ''}
            <li><a href="${T.wa('Hello Tachbonest, I need some help.')}" target="_blank" rel="noopener">WhatsApp us</a></li></ul></div>
        </div>
        <div class="foot-bottom"><span>© ${new Date().getFullYear()} ${T.esc(B.name)}. All rights reserved.</span><span>Prices are subject to change without notice.</span></div>
      </div></footer>
      <a class="wa-float" href="${T.wa('Hello Tachbonest, I need some help.')}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${ICON.wa}</a>`;
    const bg = T.$('#burger'); if (bg) bg.onclick = () => { const o = T.$('#mainNav').classList.toggle('open'); bg.setAttribute('aria-expanded', o); };
    const so = Object.entries(C.social || {}).filter(e => e[1]);
    if (so.length) T.$('.foot-grid > div:last-child ul').insertAdjacentHTML('beforeend', so.map(e => `<li><a href="${T.esc(e[1])}" target="_blank" rel="noopener">${e[0][0].toUpperCase() + e[0].slice(1)}</a></li>`).join(''));
    T.updateCount();
    const head = T.$('#head'); if (head) addEventListener('scroll', () => head.classList.toggle('stuck', scrollY > 10), { passive: true });
    const form = T.$('#siteSearch');
    if (form) form.addEventListener('submit', e => {
      e.preventDefault();
      const q = T.$('#sq').value.trim(), t = T.$('#searchCat').value;
      if (page === 'home') { document.dispatchEvent(new CustomEvent('tach:search', { detail: { q, t } })); T.$('#shop').scrollIntoView(); }
      else location.href = `index.html?q=${encodeURIComponent(q)}&t=${t}#shop`;
    });
  }

  /* ---------- Loading screen ---------- */
  function loader() {
    const ld = T.$('#loader'); if (!ld) { document.body.classList.add('ready'); return; }
    const seen = sessionStorage.getItem('tach_seen');
    const min = seen ? 650 : 2300;
    ld.style.setProperty('--dur', min - 200 + 'ms');
    if (seen) ld.querySelector('.ld-note').textContent = '';
    let fired = false;
    const fin = () => {
      if (fired) return; fired = true;
      ld.classList.add('done'); document.body.classList.add('ready'); sessionStorage.setItem('tach_seen', '1');
      setTimeout(() => ld.remove(), 1500);
    };
    const go = () => setTimeout(fin, Math.max(0, min - performance.now()));
    if (document.readyState === 'complete') go(); else addEventListener('load', go);
    setTimeout(fin, 5000);
  }

  /* ---------- Scroll reveal ---------- */
  function reveal() {
    const els = T.$$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
    els.forEach((e, i) => { e.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(e); });
  }
  T.reveal = reveal;

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const s = await Promise.race([Store.getSettings(), new Promise(r => setTimeout(() => r({}), 2500))]);
      if (s.business) { Object.assign(B, s.business); T.logo = s.business.logo || T.logo; }
      if (s.social) C.social = s.social;
      if (Array.isArray(s.delivery) && s.delivery.length) C.delivery = s.delivery;
    } catch (e) { console.warn(e); }
    T._ready(); chrome(); loader(); reveal();
  });
})();
