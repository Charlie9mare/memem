(function () {
  const { $, $$, esc } = T;
  let foods = [];
  const st = { q: '', cat: 'all' };
  const att = { photos: [], files: [] };

  const get = () => T.foodList.get();
  const qtyOf = id => (get().find(x => x.id === id) || {}).qty || 0;
  function setQty(id, qty, meta) {
    const l = get(); const i = l.findIndex(x => x.id === id);
    if (qty <= 0) { if (i > -1) l.splice(i, 1); }
    else if (i > -1) l[i].qty = qty; else l.push({ id, qty, ...meta });
    T.foodList.set(l); render();
  }

  function catalog() {
    const cats = [...new Set(foods.map(p => p.cat))];
    $('#fcats').innerHTML = [`<button class="chip ${st.cat === 'all' ? 'on' : ''}" data-cat="all">All</button>`].concat(cats.map(c => `<button class="chip ${st.cat === c ? 'on' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`)).join('');
    const q = st.q.toLowerCase();
    const list = foods.filter(p => (st.cat === 'all' || p.cat === st.cat) && (!q || (p.name + p.cat).toLowerCase().includes(q)));
    $('#fitems').innerHTML = list.length ? list.map(p => {
      const n = qtyOf(p.id);
      return `<div class="cat-row">
        <div class="e" style="--t:${T.tint(p.cat)}">${T.thumb(p)}</div>
        <div><b>${esc(p.name)}</b><small>${p.price ? T.naira(p.price) + ' / ' + esc(p.unit) : 'per ' + esc(p.unit || 'unit')}</small></div>
        ${n ? `<div class="step"><button type="button" data-dec="${esc(p.id)}" aria-label="Less">−</button><input type="number" min="0" value="${n}" data-qty="${esc(p.id)}" aria-label="Quantity of ${esc(p.name)}"><button type="button" data-inc="${esc(p.id)}" aria-label="More">+</button></div>`
          : (p.stock === 'out' ? '<button type="button" class="btn sm" disabled>Out of stock</button>' : `<button type="button" class="btn sm" data-inc="${esc(p.id)}">Add</button>`)}
      </div>`;
    }).join('') : '<div class="empty">No items match. Add it yourself in “My list” on the right.</div>';
  }

  function mylist() {
    const l = get();
    $('#lcount').textContent = l.length ? `(${l.length})` : '';
    const units = window.TACH_UNITS;
    $('#mylist').innerHTML = l.length ? l.map((x, i) => `
      <div class="li"><b>${esc(x.name)}${x.custom ? ' <small style="color:var(--muted)">(your item)</small>' : ''}</b>
        <button class="x" data-del="${i}" aria-label="Remove ${esc(x.name)}">×</button>
        <div class="ctl"><div class="step sm"><button type="button" data-ldec="${i}" aria-label="Less">−</button><input type="number" min="1" value="${x.qty}" data-lqty="${i}" aria-label="Quantity"><button type="button" data-linc="${i}" aria-label="More">+</button></div>
        <select class="u" data-lunit="${i}" aria-label="Unit">${[...new Set([x.unit, ...units])].map(u => `<option ${u === x.unit ? 'selected' : ''}>${esc(u)}</option>`).join('')}</select></div>
      </div>`).join('') : '<div class="emptylist">Your list is empty.<br>Add items from the shelf, or type your own below.</div>';
    $('#fSubmit').disabled = !l.length && !att.photos.length && !att.files.length;
  }
  function render() { catalog(); mylist(); }

  function lineText(x) { return `${x.qty} ${x.unit} ${x.name}`; }
  function fail(m) { const b = $('#fErr'); b.style.display = 'block'; $('#fErrTxt').textContent = m; }

  async function submit(e) {
    e.preventDefault(); $('#fErr').style.display = 'none';
    $$('.field[data-f]', $('#fForm')).forEach(f => f.classList.remove('bad'));
    const name = $('#fName').value.trim(), phone = $('#fPhone').value.trim(); let bad = false;
    if (!name) { $('#fForm [data-f=name]').classList.add('bad'); bad = true; }
    if (phone.replace(/\D/g, '').length < 10) { $('#fForm [data-f=phone]').classList.add('bad'); bad = true; }
    const items = get();
    if (!items.length && !att.photos.length && !att.files.length) return fail('Your list is empty. Add an item, or drop your list file or photo.');
    if (bad) return;
    const id = T.uid('F'); const btn = $('#fSubmit'); btn.disabled = true; btn.textContent = 'Sending…';
    const o = {
      id, ref: 'FD-' + id.slice(1), type: 'food', status: 'Pending', createdAt: new Date().toISOString(),
      customer: { name, phone, email: '', address: $('#fAddr').value.trim() },
      details: { how: $('#fHow').value, items: items.map(x => ({ name: x.name, qty: x.qty, unit: x.unit, custom: !!x.custom })) },
      images: att.photos.slice(), ...(att.files.length ? { files: att.files.slice() } : {}), notes: $('#fNotes').value.trim()
    };
    if (JSON.stringify(o).length > 950000) { btn.disabled = false; btn.textContent = 'Send my food list'; return fail('Your pictures and files are too large to send together. Remove some, or send the big ones on WhatsApp.'); }
    try { await Store.addOrder(o); }
    catch (err) { console.error(err); btn.disabled = false; btn.textContent = 'Send my food list'; return fail('We could not save your list here. Please send it on WhatsApp instead.'); }
    const msg = `Hello Tachbonest, I just sent a food list (Ref ${o.ref}).\nName: ${name}\nPhone: ${phone}\nCollection: ${o.details.how}\n\n${items.map((x, i) => `${i + 1}) ${lineText(x)}`).join('\n')}${att.photos.length || att.files.length ? '\n\nI attached my list (' + att.photos.length + ' picture(s), ' + att.files.length + ' file(s)) on the website.' : ''}${o.notes ? '\n\nNotes: ' + o.notes : ''}`;
    $('#refNo').textContent = o.ref; $('#waBtn').href = T.wa(msg);
    try { const m = JSON.parse(localStorage.getItem('tach_myrefs')) || []; localStorage.setItem('tach_myrefs', JSON.stringify([{ ref: o.ref, type: 'food', date: o.createdAt }].concat(m).slice(0, 15))); } catch (e) {}
    att.photos = []; att.files = []; drawAtt();
    T.foodList.set([]); render();
    $('#done').showModal(); btn.textContent = 'Send my food list';
  }

  function drawAtt() {
    $('#fThumbs').innerHTML = att.photos.map((s, i) => `<div class="th"><img src="${s}" alt="Picture ${i + 1}"><button type="button" data-ap="${i}" aria-label="Remove picture">×</button></div>`).join('');
    $('#fFileList').innerHTML = att.files.map((f, i) => `<div class="li"><b>${esc(f.name)}</b> <small>${Math.round(f.size / 1024)} KB</small><button type="button" class="x" data-af="${i}" aria-label="Remove ${esc(f.name)}">×</button></div>`).join('');
    mylist();
  }
  async function addAtt(list) {
    for (const f of list) {
      if (f.type.startsWith('image/')) {
        if (att.photos.length >= 4) { T.toast('Maximum of 4 pictures'); continue; }
        try { att.photos.push(await T.compress(f, 900, .62)); } catch (e) { T.toast('Could not read ' + f.name); }
      } else if (/\.(pdf|docx?|xlsx?|csv|txt)$/i.test(f.name)) {
        if (f.size > 400000) { T.toast(f.name + ' is over 400 KB. Send it on WhatsApp instead.'); continue; }
        if (att.files.length >= 3) { T.toast('Maximum of 3 files'); continue; }
        att.files.push({ name: f.name, type: f.type, size: f.size, data: await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); }) });
      } else T.toast(f.name + ': file type not supported');
    }
    drawAtt();
  }
  document.addEventListener('DOMContentLoaded', async () => {
    const inp = $('#fFiles'), drop = $('#fdrop');
    inp.addEventListener('change', () => { addAtt([...inp.files]); inp.value = ''; });
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', e => addAtt([...e.dataTransfer.files]));
    document.addEventListener('click', e => {
      const p = e.target.closest('[data-ap]'); if (p) { att.photos.splice(+p.dataset.ap, 1); drawAtt(); return; }
      const f = e.target.closest('[data-af]'); if (f) { att.files.splice(+f.dataset.af, 1); drawAtt(); }
    });
    $('#cUnit').innerHTML = window.TACH_UNITS.map(u => `<option>${u}</option>`).join('');
    foods = (await Store.listProducts()).filter(p => p.type === 'food' && p.active !== false);
    render();
    $('#fq').addEventListener('input', e => { st.q = e.target.value; catalog(); });
    document.addEventListener('click', e => {
      const c = e.target.closest('[data-cat]'); if (c) { st.cat = c.dataset.cat; catalog(); return; }
      const inc = e.target.closest('[data-inc]'); if (inc) { const p = foods.find(x => x.id === inc.dataset.inc); setQty(p.id, qtyOf(p.id) + 1, { name: p.name, unit: p.unit || 'piece' }); return; }
      const dec = e.target.closest('[data-dec]'); if (dec) { setQty(dec.dataset.dec, qtyOf(dec.dataset.dec) - 1); return; }
      const li = e.target.closest('[data-linc]'); if (li) { const l = get(); l[li.dataset.linc].qty++; T.foodList.set(l); render(); return; }
      const ld = e.target.closest('[data-ldec]'); if (ld) { const l = get(); l[ld.dataset.ldec].qty = Math.max(1, l[ld.dataset.ldec].qty - 1); T.foodList.set(l); render(); return; }
      const del = e.target.closest('[data-del]'); if (del) { const l = get(); l.splice(+del.dataset.del, 1); T.foodList.set(l); render(); }
    });
    document.addEventListener('change', e => {
      const q = e.target.closest('[data-qty]'); if (q) { const p = foods.find(x => x.id === q.dataset.qty); setQty(p.id, Math.floor(+q.value) || 0, { name: p.name, unit: p.unit || 'piece' }); return; }
      const lq = e.target.closest('[data-lqty]'); if (lq) { const l = get(); l[lq.dataset.lqty].qty = Math.max(1, Math.floor(+lq.value) || 1); T.foodList.set(l); render(); return; }
      const lu = e.target.closest('[data-lunit]'); if (lu) { const l = get(); l[lu.dataset.lunit].unit = lu.value; T.foodList.set(l); render(); }
    });
    $('#cAdd').onclick = () => {
      const name = $('#cName').value.trim(); if (!name) { $('#cName').focus(); return; }
      const l = get(); l.push({ id: T.uid('c-'), name, qty: Math.max(1, Math.floor(+$('#cQty').value) || 1), unit: $('#cUnit').value, custom: true });
      T.foodList.set(l); $('#cName').value = ''; $('#cQty').value = 1; render(); T.toast(name + ' added');
    };
    $('#cName').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#cAdd').click(); } });
    $('#fForm').addEventListener('submit', submit);
  });
})();
