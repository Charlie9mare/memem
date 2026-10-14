/* Unified cart: food list + blind quotation items, checkout, order submit. */
(function () {
  const { $, $$, esc } = T, C = window.TACH_CONFIG;
  const KEY = 'tach_blindcart';
  T.blindCart = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } },
    set(l) { localStorage.setItem(KEY, JSON.stringify(l)); T.updateCount(true); },
    add(p) { const l = this.get(); l.push({ uid: T.uid('w'), qty: 1, loc: 'Inside', w: '', h: '', install: false, ...p }); this.set(l); }
  };
  if (document.body.dataset.page !== 'cart') return;

  let prods = {}, delivery, unit = 'cm', photos = [], files = [], pending = null;
  const price = id => (prods[id] || {}).price || 0;
  const fee = () => delivery.fee;

  function render() {
    const f = T.foodList.get(), b = T.blindCart.get();
    $('#cartEmpty').hidden = !!(f.length || b.length);
    $('#foodBox').hidden = !f.length; $('#blindBox').hidden = !b.length;
    $('#foodRows').innerHTML = f.map((x, i) => `<div class="cat-row"><div class="e">${prods[x.id] ? T.thumb(prods[x.id]) : ''}</div>
      <div><b>${esc(x.name)}</b><small>${price(x.id) ? T.naira(price(x.id)) + ' / ' + esc(x.unit) : 'Price confirmed by us'}</small></div>
      <div class="step"><button type="button" data-fd="${i}" aria-label="Less">−</button><input type="number" min="1" value="${x.qty}" data-fq="${i}" aria-label="Quantity of ${esc(x.name)}"><button type="button" data-fi="${i}" aria-label="More">+</button></div>
      <button type="button" class="x" data-fx="${i}" aria-label="Remove ${esc(x.name)}">×</button></div>`).join('');
    $('#blindRows').innerHTML = b.map((x, i) => `<div class="card" style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(x.name)}</b><button type="button" class="x" data-bx="${i}" aria-label="Remove ${esc(x.name)}">×</button></div>
      <div class="grid2"><div class="field"><label>Fitting</label><select data-bf="${i}:loc"><option ${x.loc === 'Inside' ? 'selected' : ''}>Inside</option><option ${x.loc === 'Outside' ? 'selected' : ''}>Outside</option></select></div>
      <div class="field"><label>Quantity</label><input type="number" min="1" value="${x.qty}" data-bf="${i}:qty"></div></div>
      <div class="grid2"><div class="field"><label>Width (${unit})</label><input type="number" min="0" step="any" value="${esc(x.w)}" data-bf="${i}:w"></div>
      <div class="field"><label>Drop / height (${unit})</label><input type="number" min="0" step="any" value="${esc(x.h)}" data-bf="${i}:h"></div></div>
      <label style="display:flex;gap:8px;font-weight:600"><input type="checkbox" data-bf="${i}:install" ${x.install ? 'checked' : ''}> Include installation (quoted separately)</label></div>`).join('');
    totals();
  }
  function totals() {
    const f = T.foodList.get(), sub = f.reduce((a, x) => a + price(x.id) * x.qty, 0), unpriced = f.some(x => !price(x.id)) || T.blindCart.get().length;
    const fe = fee(), total = sub + (fe || 0);
    $('#tSub').textContent = sub ? T.naira(sub) : '—';
    $('#tFee').textContent = fe === null ? 'To be confirmed' : fe ? T.naira(fe) : 'Free';
    $('#tTot').textContent = sub ? T.naira(total) + (fe === null || unpriced ? ' + items to be confirmed' : '') : 'To be confirmed';
  }
  const fail = m => { const e = $('#cErr'); e.style.display = 'block'; $('#cErrTxt').textContent = m; e.scrollIntoView({ block: 'center', behavior: 'smooth' }); };

  function collect() {
    $('#cErr').style.display = 'none'; $$('#cForm .field[data-f]').forEach(x => x.classList.remove('bad'));
    const name = $('#kName').value.trim(), phone = $('#kPhone').value.trim(), addr = $('#kAddr').value.trim(); let bad = false;
    if (!name) { $('[data-f=name]').classList.add('bad'); bad = true; }
    if (phone.replace(/\D/g, '').length < 10) { $('[data-f=phone]').classList.add('bad'); bad = true; }
    if (delivery.id === 'deliver' && !addr) { $('[data-f=addr]').classList.add('bad'); bad = true; }
    if (bad) { $('#cForm .bad').scrollIntoView({ block: 'center', behavior: 'smooth' }); return null; }
    const b = T.blindCart.get();
    if (b.some(x => !(+x.w > 0 && +x.h > 0))) { fail('Enter the width and drop for every blind, or remove it.'); return null; }
    if (!T.foodList.get().length && !b.length && !$('#ownList').value.trim() && !photos.length && !files.length) { fail('Add items, type your own list, or attach a picture or file.'); return null; }
    return { name, phone, addr, email: $('#kEmail').value.trim(), pref: $('#kPref').value, notes: $('#kNotes').value.trim() };
  }
  function review() {
    const d = collect(); if (!d) return; pending = d;
    const f = T.foodList.get(), b = T.blindCart.get();
    $('#revBody').innerHTML = `<p><b>${esc(d.name)}</b> · ${esc(d.phone)}<br>${esc(delivery.label)}${d.addr ? ' · ' + esc(d.addr) : ''}<br>Contact by: ${esc(d.pref)}</p>
      ${f.length ? '<h3>Food</h3><ul>' + f.map(x => `<li>${x.qty} ${esc(x.unit)} ${esc(x.name)}${price(x.id) ? ' – ' + T.naira(price(x.id) * x.qty) : ''}</li>`).join('') + '</ul>' : ''}
      ${b.length ? '<h3>Blinds (quotation)</h3><ul>' + b.map(x => `<li>${x.qty} × ${esc(x.name)}, ${esc(x.loc)}, W ${esc(x.w)} × D ${esc(x.h)} ${unit}${x.install ? ', with installation' : ''}</li>`).join('') + '</ul>' : ''}
      ${$('#ownList').value.trim() ? '<h3>Your own list</h3><p style="white-space:pre-wrap">' + esc($('#ownList').value.trim()) + '</p>' : ''}
      ${photos.length || files.length ? `<p>Attachments: ${photos.length} picture(s), ${files.length} file(s)</p>` : ''}
      <p>Delivery: ${$('#tFee').textContent}<br>Total: <b>${$('#tTot').textContent}</b></p><p class="sub">No payment is taken on this website. We confirm prices with you first, and payment is made before service.</p>`;
    $('#rev').showModal();
  }
  async function send() {
    const d = pending, btn = $('#revGo'); btn.disabled = true; btn.textContent = 'Sending…';
    const f = T.foodList.get(), b = T.blindCart.get(), out = [], base = { status: 'Pending', createdAt: new Date().toISOString(), customer: { name: d.name, phone: d.phone, email: d.email, address: d.addr }, notes: d.notes };
    const dl = { id: delivery.id, label: delivery.label, fee: delivery.fee };
    if (f.length) { const id = T.uid('F'); out.push({ ...base, id, ref: 'FD-' + id.slice(1), type: 'food', images: [], details: { how: delivery.label, delivery: dl, contactPref: d.pref, subtotal: f.reduce((a, x) => a + price(x.id) * x.qty, 0), items: f.map(x => ({ name: x.name, qty: x.qty, unit: x.unit, custom: !!x.custom, unitPrice: price(x.id) || null })) } }); }
    if (b.length) { const id = T.uid('B'); out.push({ ...base, id, ref: 'BL-' + id.slice(1), type: 'blind', images: [], details: { type: [...new Set(b.map(x => x.style === 'venetian' ? 'Venetian' : 'Vertical'))].join(' + '), rail: [...new Set(b.map(x => T.colorName(x.color)))].join(', '), tape: '', otherColor: '', unit, delivery: dl, contactPref: d.pref, rows: b.map(x => ({ loc: x.loc, room: x.name, qty: +x.qty || 1, w: x.w, h: x.h, install: !!x.install })) } }); }
    const own = $('#ownList').value.trim();
    if (!out.length) { const id = T.uid('R'); out.push({ ...base, id, ref: 'RQ-' + id.slice(1), type: 'request', images: [], details: { delivery: dl, contactPref: d.pref, ownList: '' } }); }
    const mo = out.find(o => o.type === 'blind') || out[0], lo = out.find(o => o.type === 'food') || out[0];
    mo.images = photos.slice(); if (files.length) mo.files = files.slice(); if (own) lo.details.ownList = own;
    if (JSON.stringify(out).length > 950000) { btn.disabled = false; btn.textContent = 'Confirm and send'; $('#rev').close(); return fail('Your pictures and files are too large to send together. Remove some, or send the big ones on WhatsApp.'); }
    try { for (const o of out) await Store.addOrder(o); }
    catch (e) { console.error(e); btn.disabled = false; btn.textContent = 'Confirm and send'; $('#rev').close(); return fail('We could not save your order (' + (e.name === 'QuotaExceededError' ? 'photos too large' : 'connection problem') + '). Nothing was cleared. Please try again or use WhatsApp.'); }
    const msg = `Hello Tachbonest, I just placed an order.\n${out.map(o => 'Ref ' + o.ref).join(', ')}\nName: ${d.name}\nPhone: ${d.phone}\nDelivery: ${delivery.label}` + (b.length ? '\nI will send my window photos here.' : '');
    T.foodList.set([]); T.blindCart.set([]); photos = []; files = []; $('#ownList').value = ''; $('#thumbs').innerHTML = ''; $('#fileList').innerHTML = '';
    try { const m = JSON.parse(localStorage.getItem('tach_myrefs')) || []; localStorage.setItem('tach_myrefs', JSON.stringify(out.map(o => ({ ref: o.ref, type: o.type, date: o.createdAt })).concat(m).slice(0, 15))); } catch (e) {}
    $('#rev').close(); $('#refList').innerHTML = out.map(o => `<div class="refbox">${esc(o.ref)}</div>`).join(''); $('#waBtn').href = T.wa(msg);
    $('#done').showModal(); btn.disabled = false; btn.textContent = 'Confirm and send'; render();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await T.ready; delivery = C.delivery[0];
    (await Store.listProducts()).forEach(p => prods[p.id] = p);
    $('#dOpts').innerHTML = C.delivery.map((o, i) => `<option value="${i}">${esc(o.label)}${o.fee ? ' (' + T.naira(o.fee) + ')' : ''}</option>`).join('');
    $('#dOpts').onchange = e => { delivery = C.delivery[+e.target.value]; $('#addrReq').hidden = delivery.id !== 'deliver'; totals(); };
    $('#unitSel').onchange = e => { unit = e.target.value; render(); };
    render();
    document.addEventListener('click', e => {
      const g = a => e.target.closest(a), f = T.foodList.get(), b = T.blindCart.get();
      let el;
      if ((el = g('[data-fi]'))) { f[el.dataset.fi].qty++; T.foodList.set(f); render(); }
      else if ((el = g('[data-fd]'))) { f[el.dataset.fd].qty = Math.max(1, f[el.dataset.fd].qty - 1); T.foodList.set(f); render(); }
      else if ((el = g('[data-fx]'))) { f.splice(+el.dataset.fx, 1); T.foodList.set(f); render(); }
      else if ((el = g('[data-bx]'))) { b.splice(+el.dataset.bx, 1); T.blindCart.set(b); render(); }
      else if ((el = g('[data-fr]'))) { files.splice(+el.dataset.fr, 1); fl(); }
      else if ((el = g('[data-rm]'))) { photos.splice(+el.dataset.rm, 1); thumbs(); }
    });
    document.addEventListener('change', e => {
      const q = e.target.closest('[data-fq]'); if (q) { const f = T.foodList.get(); f[q.dataset.fq].qty = Math.max(1, Math.floor(+q.value) || 1); T.foodList.set(f); render(); }
    });
    document.addEventListener('input', e => {
      const t = e.target.closest('[data-bf]'); if (!t) return;
      const [i, k] = t.dataset.bf.split(':'), b = T.blindCart.get();
      b[i][k] = t.type === 'checkbox' ? t.checked : t.value; T.blindCart.set(b);
    });
    const thumbs = () => $('#thumbs').innerHTML = photos.map((s, i) => `<div class="th"><img src="${s}" alt="Window photo ${i + 1}"><button type="button" data-rm="${i}" aria-label="Remove photo">×</button></div>`).join('');
    $('#files').onchange = async e => {
      for (const f of e.target.files) { if (photos.length >= 4) { T.toast('Maximum of 4 photos'); break; } if (f.type.startsWith('image/')) try { photos.push(await T.compress(f, 900, .62)); } catch (x) { T.toast('Could not read ' + f.name); } }
      thumbs(); e.target.value = '';
    };
    const fl = () => $('#fileList').innerHTML = files.map((f, i) => `<div class="li"><b>${esc(f.name)}</b> <small>${Math.round(f.size / 1024)} KB</small><button type="button" class="x" data-fr="${i}" aria-label="Remove ${esc(f.name)}">×</button></div>`).join('');
    $('#docs').onchange = async e => {
      for (const f of e.target.files) {
        if (!/\.(pdf|docx?|xlsx?|csv|txt)$/i.test(f.name)) { T.toast(f.name + ': file type not supported'); continue; }
        if (f.size > 400000) { T.toast(f.name + ' is over 400 KB. Send it on WhatsApp instead.'); continue; }
        if (files.length >= 3) { T.toast('Maximum of 3 files'); break; }
        files.push({ name: f.name, type: f.type, size: f.size, data: await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); }) });
      }
      fl(); e.target.value = '';
    };
    $('#cForm').onsubmit = e => { e.preventDefault(); review(); };
    $('#revGo').onclick = send; $('#revX').onclick = () => $('#rev').close();
  });
})();
