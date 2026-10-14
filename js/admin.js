(function () {
  const { $, $$, esc } = T;
  const B = TACH_CONFIG.business;
  const STATUSES = ['Pending', 'Quoted', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Rejected', 'Cancelled'];
  const LABEL = { blind: 'Blind order', food: 'Food list', request: 'Own list / files', enquiry: 'Enquiry' };
  let sLogo = '';
  let orders = [], products = [], editing = null, pImage = '';
  const filt = { blind: { s: '', f: '' }, food: { s: '', f: '' }, request: { s: '', f: '' }, enquiry: { s: '', f: '' } };

  /* ---------- sign in ---------- */
  async function boot() {
    const fbm = Store.mode === 'firebase';
    if (!fbm) { $('#login').hidden = false; $('#loginForm').innerHTML = '<h1>Admin setup needed</h1><p>The admin area only works with the Firebase database, so no password is ever stored in the website code. Follow Step 3 in README.md, then reload this page.</p><p><a href="index.html">← Back to website</a></p>'; return; }
    $('#emailF').hidden = !fbm; $('#loginHint').textContent = fbm ? 'Sign in with your admin email and password.' : 'Enter the admin password.';
    if (await Store.isAdmin()) enter(); else $('#login').hidden = false;
  }
  let enter = async function () {
    $('#login').hidden = true; $('#app').hidden = false;
    $('#modePill').textContent = Store.mode === 'firebase' ? 'Shared database' : 'Test mode (this browser only)';
    $('#modePill').className = 'pill ' + (Store.mode === 'firebase' ? 'fb' : 'loc');
    $('#localNote').hidden = Store.mode === 'firebase';
    $('#clearCard').hidden = Store.mode === 'firebase';
    await load();
  };
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault(); const err = $('#loginErr'); err.style.display = 'none';
    try { await Store.login(Store.mode === 'firebase' ? $('#aEmail').value.trim() : $('#aPass').value, $('#aPass').value); enter(); }
    catch (ex) { err.textContent = Store.mode === 'firebase' ? 'Could not sign in. Check your email and password.' : 'Wrong password.'; err.style.display = 'block'; }
  });
  $('#logout').onclick = async () => { await Store.logout(); location.reload(); };

  /* ---------- load ---------- */
  async function load() {
    try { [orders, products] = await Promise.all([Store.listOrders(), Store.listProducts()]); }
    catch (e) { console.error(e); T.toast('Could not load data. Check your Firebase settings.'); }
    renderAll();
  }
  $('#refresh').onclick = async () => { await load(); T.toast('Refreshed'); };

  /* ---------- tabs ---------- */
  const titles = { overview: 'Overview', blind: 'Blind orders', food: 'Food lists', request: 'Own lists & files', enquiry: 'Enquiries', products: 'Products', settings: 'Settings', data: 'Backup & export' };
  $$('.side .tab[data-tab]').forEach(b => b.onclick = () => {
    $$('.side .tab').forEach(x => x.classList.remove('on')); b.classList.add('on');
    $$('main section').forEach(s => s.hidden = s.id !== 'tab-' + b.dataset.tab);
    $('#tabTitle').textContent = titles[b.dataset.tab]; scrollTo(0, 0);
  });

  /* ---------- helpers ---------- */
  const attach = o => (o.files || []).length ? ` · ${o.files.length} file${o.files.length === 1 ? '' : 's'}` : '';
  const summaryOf = o => (o.type === 'blind'
    ? `${esc(o.details.type)} · ${o.details.rows.reduce((a, r) => a + (+r.qty || 0), 0)} pcs · ${o.images.length} photo${o.images.length === 1 ? '' : 's'}`
    : o.type === 'food' ? `${o.details.items.length} item${o.details.items.length === 1 ? '' : 's'}${o.details.ownList ? ' + own list' : ''}${o.images.length ? ` · ${o.images.length} picture${o.images.length === 1 ? '' : 's'}` : ''}`
    : o.type === 'enquiry' ? esc(o.details.subject || 'Enquiry') : `Own list${o.images.length ? ` · ${o.images.length} picture${o.images.length === 1 ? '' : 's'}` : ''}`) + attach(o);
  const statusSel = o => `<select class="st ${esc(o.status)}" data-st="${esc(o.id)}" aria-label="Status">${(STATUSES.includes(o.status) ? STATUSES : [o.status, ...STATUSES]).map(s => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select>`;

  function orderTable(list) {
    if (!list.length) return '<tbody><tr><td style="padding:30px;text-align:center;color:var(--muted)">No orders yet.</td></tr></tbody>';
    return `<thead><tr><th>Ref</th><th>Date</th><th>Customer</th><th>Phone</th><th>Details</th><th>Status</th><th></th></tr></thead><tbody>${list.map(o => `
      <tr><td><b>${esc(o.ref)}</b></td><td>${T.fmtDate(o.createdAt)}</td><td>${esc(o.customer.name)}</td><td><a href="tel:${esc(o.customer.phone)}">${esc(o.customer.phone)}</a></td>
      <td>${summaryOf(o)}</td><td>${statusSel(o)}</td><td><button class="btn sm" data-view="${esc(o.id)}">View</button></td></tr>`).join('')}</tbody>`;
  }

  function renderAll() {
    const val = orders.filter(o => o.type === 'food' && !['Cancelled', 'Rejected'].includes(o.status)).reduce((a, o) => a + (+o.details.subtotal || 0), 0);
    $('#stats').innerHTML = [['Total orders', orders.filter(o => o.type !== 'enquiry').length], ['Pending', orders.filter(o => o.status === 'Pending').length], ['Delivered', orders.filter(o => o.status === 'Delivered').length], ['Enquiries', orders.filter(o => o.type === 'enquiry').length], ['Food value (priced items)', val ? T.naira(val) : '—'], ['Products', products.length]]
      .map(s => `<div class="stat"><b>${s[1]}</b><span>${s[0]}</span></div>`).join('');
    $('#recent').innerHTML = orderTable(orders.slice(0, 6));
    ['blind', 'food', 'request', 'enquiry'].forEach(t => {
      const f = filt[t], q = f.s.toLowerCase();
      const list = orders.filter(o => o.type === t && (!f.f || o.status === f.f) && (!q || (o.ref + o.customer.name + o.customer.phone).toLowerCase().includes(q)));
      $('#tbl-' + t).innerHTML = orderTable(list);
    });
    $('#tbl-prod').innerHTML = `<thead><tr><th></th><th>Name</th><th>Type</th><th>Category</th><th>Price</th><th>Stock</th><th>Shown</th><th></th></tr></thead><tbody>${products.filter(p => !$('#pFilter').value || p.type === $('#pFilter').value).map(p => `
      <tr><td><div class="thumb">${p.image ? `<img src="${p.image}" alt="">` : p.type === 'blind' ? `<img src="${T.blindArt(p.style, p.color)}" alt="">` : (p.emoji || '🛒')}</div></td>
      <td><b>${esc(p.name)}</b></td><td>${p.type === 'blind' ? 'Blind' : 'Food'}</td><td>${esc(p.cat)}</td><td>${p.price ? T.naira(p.price) + (p.unit ? ' / ' + esc(p.unit) : '') : '<span style="color:var(--muted)">On request</span>'}</td>
      <td>${p.stock === 'out' ? 'Out' : p.stock === 'low' ? 'Low' : 'In stock'}</td><td>${p.active === false ? 'Hidden' : 'Yes'}</td><td style="white-space:nowrap"><button class="btn sm" data-edit="${esc(p.id)}">Edit</button> <button class="btn sm danger" data-delp="${esc(p.id)}">Delete</button></td></tr>`).join('')}</tbody>`;
    $('#catList').innerHTML = [...new Set(products.map(p => p.cat))].map(c => `<option value="${esc(c)}">`).join('');
  }

  $('#pFilter').onchange = () => renderAll();
  document.addEventListener('input', e => { const s = e.target.closest('.fi'); if (s) { filt[s.dataset.s].s = s.value; renderAll(); } });
  document.addEventListener('change', async e => {
    const f = e.target.closest('[data-sf]'); if (f) { filt[f.dataset.sf].f = f.value; renderAll(); return; }
    const st = e.target.closest('[data-st]');
    if (st) { const o = orders.find(x => x.id === st.dataset.st); await Store.updateOrder(o.id, { status: st.value }, o.ref); o.status = st.value; renderAll(); T.toast('Status updated'); }
  });

  /* ---------- order detail ---------- */
  function detail(o) {
    const d = o.details;
    const kv = (k, v) => v ? `<dt>${k}</dt><dd>${esc(v)}</dd>` : '';
    let items = '';
    if (o.type === 'blind') items = `<dl class="kv"><dt>Blind type</dt><dd>${esc(d.type)}</dd><dt>Rail / slat</dt><dd>${esc(d.rail || '-')}</dd><dt>Tape</dt><dd>${esc(d.tape || '-')}</dd>${kv('Other colour', d.otherColor)}</dl>
         <table class="mini"><tr><th>Fitting</th><th>Room</th><th>Qty</th><th>Width (${esc(d.unit)})</th><th>Drop (${esc(d.unit)})</th><th>Install</th></tr>${d.rows.map(r => `<tr><td>${esc(r.loc)}</td><td>${esc(r.room)}</td><td>${r.qty}</td><td>${esc(r.w)}</td><td>${esc(r.h)}</td><td>${r.install ? 'Yes' : ''}</td></tr>`).join('') || '<tr><td colspan="6">No sizes given</td></tr>'}</table>`;
    else if (o.type === 'food') items = `<dl class="kv">${kv('Collection', d.how)}</dl>
         <table class="mini"><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Listed price</th></tr>${d.items.map(i => `<tr><td>${esc(i.name)}${i.custom ? ' *' : ''}</td><td>${i.qty}</td><td>${esc(i.unit)}</td><td>${i.unitPrice ? T.naira(i.unitPrice) : ''}</td></tr>`).join('')}</table><small style="color:var(--muted)">* typed in by the customer</small>`;
    else if (o.type === 'enquiry') items = `<dl class="kv">${kv('Topic', d.subject)}</dl>`;
    items += `<dl class="kv">${kv('Delivery', d.delivery && d.delivery.label)}${kv('Contact by', d.contactPref)}</dl>`;
    if (d.ownList) items += `<div class="lbl">Customer's own list</div><p style="white-space:pre-wrap">${esc(d.ownList)}</p>`;
    if ((o.files || []).length) items += `<div class="lbl">Files (open with care)</div>` + o.files.map(f => `<p><a href="${esc(f.data)}" download="${esc(f.name)}">${esc(f.name)}</a> <small>${Math.round(f.size / 1024)} KB</small></p>`).join('');
    $('#dlgBody').innerHTML = `
      <h2>${esc(o.ref)}</h2><p style="color:var(--muted)">${T.fmtDate(o.createdAt)} · ${LABEL[o.type] || o.type}</p>
      <dl class="kv"><dt>Name</dt><dd>${esc(o.customer.name)}</dd><dt>Phone</dt><dd><a href="tel:${esc(o.customer.phone)}">${esc(o.customer.phone)}</a></dd>
      ${o.customer.email ? `<dt>Email</dt><dd>${esc(o.customer.email)}</dd>` : ''}${o.customer.address ? `<dt>Address</dt><dd>${esc(o.customer.address)}</dd>` : ''}${o.notes ? `<dt>Notes</dt><dd>${esc(o.notes)}</dd>` : ''}<dt>Status</dt><dd>${statusSel(o)}</dd></dl>
      ${items}
      ${(o.images || []).length ? `<div class="lbl">Pictures</div><div class="gal">${o.images.map((s, i) => `<img src="${s}" alt="Photo ${i + 1}" data-zoom="${i}">`).join('')}</div>` : ''}
      <div class="acts">${o.type === 'blind' || o.type === 'food' ? `<button class="btn" data-print="${esc(o.id)}">Print quotation sheet</button>` : ''}
      <a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/${T.phoneIntl(o.customer.phone)}?text=${encodeURIComponent('Hello ' + o.customer.name + ', this is Tachbonest Classic Ventures about your order ' + o.ref + '.')}">WhatsApp customer</a>
      <button class="btn danger" data-delo="${esc(o.id)}">Delete</button></div>`;
    $('#dlg').showModal();
  }
  $('#dlgX').onclick = () => $('#dlg').close();

  /* ---------- print quotation (mirrors the paper pad) ---------- */
  function printSheet(o) {
    if (o.type !== 'blind' && o.type !== 'food') return;
    const logo = new URL('assets/logo.svg', location.href).href, d = o.details;
    const blank = n => '<td></td>'.repeat(n);
    const body = o.type === 'blind'
      ? `<table><tr><th>Location</th><th>Qty</th><th>Width</th><th>Drop (height)</th><th>Rail/Slat</th><th>Tape</th><th>Unit price</th><th>Amount (₦)</th></tr>
         ${d.rows.map(r => `<tr><td>${esc(r.room || '')} (${esc(r.loc)})</td><td>${r.qty}</td><td>${esc(r.w)} ${esc(d.unit)}</td><td>${esc(r.h)} ${esc(d.unit)}</td><td>${esc(d.rail || '')}</td><td>${esc(d.tape || '')}</td>${blank(2)}</tr>`).join('')}</table>`
      : `<table><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Unit price</th><th>Amount (₦)</th></tr>${d.items.map(i => `<tr><td>${esc(i.name)}</td><td>${i.qty}</td><td>${esc(i.unit)}</td>${blank(2)}</tr>`).join('')}</table>`;
    const w = open('', '_blank'); if (!w) { T.toast('Allow pop-ups to print'); return; }
    w.document.write(`<!doctype html><title>Quotation ${esc(o.ref)}</title><style>
      body{font:14px/1.5 Arial,sans-serif;color:#222;margin:28px}.h{display:flex;align-items:center;gap:14px;border-bottom:3px solid #d6453d;padding-bottom:10px;margin-bottom:14px}
      .h img{width:56px}.h b{font-size:20px;color:#d6453d}.h i{display:block;font-family:cursive;font-size:20px;color:#3a4659}.h small{color:#555}
      h2{margin:0 0 6px;font-size:16px;letter-spacing:.08em}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #555;padding:7px 8px;text-align:left;height:26px}th{background:#eee;font-size:12px}
      .t{width:260px;margin-left:auto}.t div{display:flex;justify-content:space-between;border:1px solid #555;padding:7px 10px;margin-top:-1px}.c{margin-top:18px;font-size:12px}.s{display:flex;justify-content:space-between;margin-top:50px}.s div{border-top:1px solid #333;padding-top:4px;width:40%;font-size:12px}
    </style><div class="h"><img src="${logo}"><div><b>TACHBONEST CLASSIC</b><i>Ventures</i><small>${esc(B.address)} · Tel: ${B.phones.join(', ')} · ${esc(B.bn)}</small></div></div>
    <h2>QUOTATION &nbsp; № ${esc(o.ref)}</h2><div>Date: ${new Date(o.createdAt).toLocaleDateString('en-NG')}<br>Customer: <b>${esc(o.customer.name)}</b> · ${esc(o.customer.phone)}${o.customer.address ? '<br>Address: ' + esc(o.customer.address) : ''}</div>
    ${body}<div class="t"><div><span>Sub total</span><span></span></div><div><span>Freight</span><span></span></div><div><span>Installation charge</span><span></span></div><div><b>TOTAL ₦</b><span></span></div></div>
    <div class="c"><b>Condition of service</b><br>Prices are subject to change without notice. Payment before service. Job to be completed within ........... days/weeks. I/we agree with all the particulars on this quotation.</div>
    <div class="s"><div>Client's signature</div><div>for: Tachbonest Classic Ventures</div></div><script>onload=()=>setTimeout(()=>print(),300)<\/script>`);
    w.document.close();
  }

  /* ---------- clicks ---------- */
  document.addEventListener('click', async e => {
    const v = e.target.closest('[data-view]'); if (v) return detail(orders.find(o => o.id === v.dataset.view));
    const z = e.target.closest('[data-zoom]'); if (z) { const w = open(); w.document.write(`<img src="${z.src}" style="max-width:100%">`); return; }
    const pr = e.target.closest('[data-print]'); if (pr) return printSheet(orders.find(o => o.id === pr.dataset.print));
    const dl = e.target.closest('[data-delo]');
    if (dl && confirm('Delete this order permanently?')) { await Store.deleteOrder(dl.dataset.delo, (orders.find(o => o.id === dl.dataset.delo) || {}).ref); orders = orders.filter(o => o.id !== dl.dataset.delo); $('#dlg').close(); renderAll(); T.toast('Order deleted'); return; }
    const ed = e.target.closest('[data-edit]'); if (ed) return openProd(products.find(p => p.id === ed.dataset.edit));
    const dp = e.target.closest('[data-delp]');
    if (dp && confirm('Delete this product?')) { products = products.filter(p => p.id !== dp.dataset.delp); await Store.saveProducts(products); renderAll(); T.toast('Product deleted'); }
  });

  /* ---------- products ---------- */
  function openProd(p) {
    editing = p || null; pImage = p?.image || '';
    $('#pTitle').textContent = p ? 'Edit product' : 'Add product';
    $('#pType').value = p?.type || 'food'; $('#pCat').value = p?.cat || ''; $('#pName').value = p?.name || ''; $('#pPrice').value = p?.price || '';
    $('#pUnit').value = p?.unit || ''; $('#pEmoji').value = p?.emoji || ''; $('#pBadge').value = p?.badge || ''; $('#pStyle').value = p?.style || 'vertical';
    $('#pColor').value = p?.color || '#8d95a0'; $('#pDesc').value = p?.desc || ''; $('#pActive').checked = p?.active !== false; $('#pStock').value = p?.stock || 'in';
    $('#pPrev').innerHTML = pImage ? `<img src="${pImage}" alt="" style="width:90px;border-radius:10px">` : ''; $('#pImg').value = '';
    $('#pdlg').showModal();
  }
  $('#newProd').onclick = () => openProd(null);
  $('#pdlgX').onclick = $('#pCancel').onclick = () => $('#pdlg').close();
  $('#pImg').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return; pImage = await T.compress(f, 600, .7);
    $('#pPrev').innerHTML = `<img src="${pImage}" alt="" style="width:90px;border-radius:10px">`;
  });
  $('#pForm').addEventListener('submit', async e => {
    e.preventDefault();
    const p = {
      id: editing?.id || T.uid('p-').toLowerCase(), created: editing?.created || Date.now(), type: $('#pType').value, cat: $('#pCat').value.trim(), name: $('#pName').value.trim(),
      price: +$('#pPrice').value || null, unit: $('#pUnit').value.trim(), emoji: $('#pEmoji').value.trim(), badge: $('#pBadge').value.trim(), style: $('#pStyle').value,
      color: $('#pColor').value, desc: $('#pDesc').value.trim(), image: pImage, stock: $('#pStock').value, active: $('#pActive').checked
    };
    if (editing) products = products.map(x => x.id === editing.id ? p : x); else products.push(p);
    try { await Store.saveProducts(products); } catch (err) { console.error(err); T.toast('Could not save. Photo may be too large.'); return; }
    $('#pdlg').close(); renderAll(); T.toast('Product saved');
  });
  $('#resetProd').onclick = async () => { if (!confirm('Replace all products with the default catalogue? Your changes will be lost.')) return; await Store.resetProducts(); products = await Store.listProducts(); renderAll(); T.toast('Catalogue reset'); };

  /* ---------- export / import ---------- */
  const dl = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); };
  $('#expCsv').onclick = () => {
    const cell = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const rows = [['Ref', 'Date', 'Type', 'Status', 'Name', 'Phone', 'Email', 'Address', 'Details', 'Notes']].concat(orders.map(o => [o.ref, o.createdAt, o.type, o.status, o.customer.name, o.customer.phone, o.customer.email, o.customer.address,
      o.type === 'enquiry' ? (o.details.subject || '') : o.type === 'request' ? (o.details.ownList || '') : o.type === 'blind' ? o.details.type + '; ' + o.details.rows.map(r => `${r.room} ${r.loc} x${r.qty} ${r.w}x${r.h}${o.details.unit}`).join(' | ') : o.details.items.map(i => `${i.qty} ${i.unit} ${i.name}`).join(' | '), o.notes]));
    dl('tachbonest-orders.csv', '\ufeff' + rows.map(r => r.map(cell).join(',')).join('\n'), 'text/csv');
  };
  $('#expJson').onclick = () => dl('tachbonest-backup.json', JSON.stringify({ orders, products }), 'application/json');
  $('#impFile').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const j = JSON.parse(await f.text()); const have = new Set(orders.map(o => o.id)); let n = 0;
      for (const o of j.orders || []) if (!have.has(o.id)) { await Store.addOrder(o); n++; }
      if (j.products?.length) await Store.saveProducts(j.products);
      await load(); T.toast(n + ' orders restored');
    } catch (err) { console.error(err); T.toast('That file could not be read'); }
    e.target.value = '';
  });
  $('#clearAll').onclick = async () => { if (!confirm('Delete ALL orders saved in this browser?')) return; localStorage.removeItem('tach_orders'); await load(); T.toast('Cleared'); };

  /* ---------- settings ---------- */
  async function fillSettings() {
    await T.ready; const b = TACH_CONFIG.business, sc = TACH_CONFIG.social || {}, dv = (TACH_CONFIG.delivery.find(x => x.id === 'deliver') || {}).fee;
    $('#sName').value = b.name || ''; $('#sBn').value = b.bn || ''; $('#sAddr').value = b.address || ''; $('#sPh1').value = (b.phones || [])[0] || ''; $('#sPh2').value = (b.phones || [])[1] || '';
    $('#sWa').value = b.whatsapp || ''; $('#sEmail').value = b.email || ''; $('#sDesc').value = b.description || ''; $('#sFb').value = sc.facebook || ''; $('#sIg').value = sc.instagram || ''; $('#sTt').value = sc.tiktok || '';
    $('#sFee').value = dv == null ? '' : dv; sLogo = b.logo || '';
  }
  $('#sLogo').addEventListener('change', async e => { const f = e.target.files[0]; if (f) sLogo = await T.compress(f, 300, .9); });
  $('#sForm').addEventListener('submit', async e => {
    e.preventDefault(); const wa = $('#sWa').value.replace(/\D/g, '');
    if (wa.length < 10) return T.toast('Enter the WhatsApp number in international format, e.g. 2348035613703');
    const s = {
      business: { name: $('#sName').value.trim(), bn: $('#sBn').value.trim(), address: $('#sAddr').value.trim(), phones: [$('#sPh1').value.trim(), $('#sPh2').value.trim()].filter(Boolean), whatsapp: wa, email: $('#sEmail').value.trim(), description: $('#sDesc').value.trim(), logo: sLogo },
      social: { facebook: $('#sFb').value.trim(), instagram: $('#sIg').value.trim(), tiktok: $('#sTt').value.trim() },
      delivery: [{ id: 'pickup', label: 'I will pick up / collect', fee: 0 }, { id: 'deliver', label: 'Deliver to my address', fee: $('#sFee').value === '' ? null : +$('#sFee').value }]
    };
    try { await Store.saveSettings(s); T.toast('Settings saved'); } catch (err) { console.error(err); T.toast('Could not save settings'); }
  });
  const _enter = enter; enter = async () => { await _enter(); fillSettings(); };

  boot();
})();
