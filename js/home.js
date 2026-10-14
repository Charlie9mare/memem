(function () {
  const { $, $$, esc } = T;
  const state = { t: 'all', cat: 'all', q: '' };
  let products = [];

  /* Hero: try-a-colour swatches */
  document.addEventListener('DOMContentLoaded', () => {
    const win = $('#win'), box = $('#heroSw');
    const picks = ['#3c4350', '#c94b44', '#2b3a55', '#cdb99a', '#9cae9a'];
    box.innerHTML = picks.map((h, i) => `<button class="dot ${i ? '' : 'on'}" style="--c:${h}" data-c="${h}" aria-label="${T.colorName(h)}"></button>`).join('');
    box.addEventListener('click', e => {
      const b = e.target.closest('.dot'); if (!b) return;
      $$('.dot', box).forEach(d => d.classList.remove('on')); b.classList.add('on');
      win.style.setProperty('--slat', b.dataset.c);
    });
    $('#grid').innerHTML = '<div class="skel"></div>'.repeat(8);
  });

  const TILES = [
    { l: 'Vertical blinds', f: { t: 'blind', cat: 'Vertical blinds' }, art: ['vertical', '#cfc8ba'] },
    { l: 'Venetian blinds', f: { t: 'blind', cat: 'Venetian blinds' }, art: ['venetian', '#8a6444'] },
    { l: 'Rice & grains', f: { t: 'food', cat: 'Rice & grains' }, e: '🍚' },
    { l: 'Garri & flour', f: { t: 'food', cat: 'Garri & flour' }, e: '🌾' },
    { l: 'Oils', f: { t: 'food', cat: 'Oils' }, e: '🛢️' },
    { l: 'Tubers & produce', f: { t: 'food', cat: 'Tubers & produce' }, e: '🍠' },
    { l: 'Spices', f: { t: 'food', cat: 'Spices & seasoning' }, e: '🌶️' },
    { l: 'Fish & protein', f: { t: 'food', cat: 'Fish & protein' }, e: '🐟' },
    { l: 'Pantry', f: { t: 'food', cat: 'Pantry' }, e: '🥫' }
  ];

  function tiles() {
    $('#tiles').innerHTML = TILES.map((x, i) => `
      <a class="tile" href="#shop" data-i="${i}">
        <div class="ico" style="--t:${T.tint(x.f.cat)}">${x.art ? `<img src="${T.blindArt(x.art[0], x.art[1])}" alt="">` : x.e}</div>${esc(x.l)}</a>`).join('');
    $('#tiles').addEventListener('click', e => {
      const a = e.target.closest('.tile'); if (!a) return;
      const f = TILES[a.dataset.i].f; state.t = f.t; state.cat = f.cat; state.q = ''; render();
    });
  }

  function controls() {
    const tabs = [['all', 'All'], ['blind', 'Window blinds'], ['food', 'Food items']];
    $('#typeTabs').innerHTML = tabs.map(t => `<button class="chip ${state.t === t[0] ? 'on' : ''}" data-t="${t[0]}">${t[1]}</button>`).join('');
    const cats = [...new Set(products.filter(p => state.t === 'all' || p.type === state.t).map(p => p.cat))];
    $('#catChips').innerHTML = cats.length > 1 ? [`<button class="chip ${state.cat === 'all' ? 'on' : ''}" data-cat="all">All categories</button>`]
      .concat(cats.map(c => `<button class="chip ${state.cat === c ? 'on' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`)).join('') : '';
  }

  function card(p) {
    const blind = p.type === 'blind';
    const price = blind ? '<span class="price q">Quotation on request</span>'
      : p.price ? `<span class="price">${T.naira(p.price)} <small>/ ${esc(p.unit || 'unit')}</small></span>` : '<span class="price q">Price on request</span>';
    const btn = blind
      ? `<a class="btn red sm" href="order-blinds.html?type=${p.style === 'venetian' ? 'Venetian' : 'Vertical'}&color=${encodeURIComponent(p.color || '')}">Quote this</a> <button class="btn ghost sm" data-addb="${esc(p.id)}">Add to cart</button>`
      : `<button class="btn sm" data-add="${esc(p.id)}">Add to list</button>`;
    return `<article class="pcard">
      <div class="pimg" style="--t:${T.tint(p.cat)}">${T.productImg(p)}${p.stock === 'out' ? '<span class="badge">Out of stock</span>' : p.stock === 'low' ? '<span class="badge">Low stock</span>' : p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}</div>
      <div class="pbody"><span class="pcat">${esc(p.cat)}</span><h3>${esc(p.name)}</h3><p class="pdesc">${esc(p.desc || '')}</p>
      <div class="pfoot">${price}${p.stock === 'out' ? '<button class="btn sm" disabled>Out of stock</button>' : btn}</div></div></article>`;
  }

  function render() {
    controls();
    const q = state.q.toLowerCase();
    const list = products.filter(p => (state.t === 'all' || p.type === state.t) && (state.cat === 'all' || p.cat === state.cat) &&
      (!q || (p.name + ' ' + p.cat + ' ' + (p.desc || '')).toLowerCase().includes(q)));
    $('#grid').innerHTML = list.length ? list.map(card).join('') : `<div class="empty"><b>Nothing matches “${esc(state.q)}”.</b><br>Try another word, or <a href="order-food.html" style="color:var(--red);font-weight:700">type your item into a food list</a>.</div>`;
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-t]'); if (t && t.closest('#typeTabs')) { state.t = t.dataset.t; state.cat = 'all'; render(); return; }
    const c = e.target.closest('[data-cat]'); if (c && c.closest('#catChips')) { state.cat = c.dataset.cat; render(); return; }
    const ab = e.target.closest('[data-addb]');
    if (ab) { const p = products.find(x => x.id === ab.dataset.addb); if (p) { T.blindCart.add({ id: p.id, name: p.name, style: p.style, color: p.color }); T.toast(p.name + ' added to your cart'); } return; }
    const a = e.target.closest('[data-add]');
    if (a) {
      const p = products.find(x => x.id === a.dataset.add); if (!p) return;
      T.foodList.add({ id: p.id, name: p.name, unit: p.unit || 'piece', qty: 1 });
      a.textContent = 'Added ✓'; a.classList.add('red'); T.toast(p.name + ' added to your food list');
      setTimeout(() => { a.textContent = 'Add to list'; a.classList.remove('red'); }, 1400);
    }
  });
  document.addEventListener('tach:search', e => { state.q = e.detail.q; state.t = e.detail.t; state.cat = 'all'; render(); });

  (async function () {
    const params = new URLSearchParams(location.search);
    if (params.get('q')) state.q = params.get('q');
    if (['blind', 'food'].includes(params.get('t'))) state.t = params.get('t');
    products = (await Store.listProducts()).filter(p => p.active !== false);
    const fill = () => {
      const f = products.filter(p => p.badge === 'Popular').slice(0, 4), n = products.filter(p => p.badge === 'New').slice(0, 4);
      [['feat', 'featured', f], ['new', 'newest', n]].forEach(([k, g, l]) => { $('#' + k + 'Sec').hidden = !l.length; $('#' + g).innerHTML = l.map(card).join(''); });
      const rv = TACH_CONFIG.reviews || []; $('#revSec').hidden = !rv.length;
      $('#revBox').innerHTML = rv.map(r => `<div class="feat"><p>“${esc(r.text)}”</p><h3>${esc(r.name)}</h3><p>${esc(r.place || '')}</p></div>`).join('');
    };
    const go = () => { tiles(); render(); fill(); if (state.q) { const i = $('#sq'); if (i) i.value = state.q; } T.reveal(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  })();
})();
