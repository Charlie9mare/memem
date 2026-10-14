(function () {
  const { $, $$, esc } = T;
  const MAX_IMG = 4;
  let images = [];
  const sel = { rail: null, tape: null };

  function swatches(id, key) {
    const box = $('#' + id + 'Sw');
    box.innerHTML = T.COLORS.map(c => `<button type="button" class="sw" style="--c:${c.h}" data-h="${c.h}" aria-label="${c.n}" title="${c.n}"></button>`).join('');
    box.addEventListener('click', e => {
      const b = e.target.closest('.sw'); if (!b) return;
      const on = b.classList.contains('on');
      $$('.sw', box).forEach(s => s.classList.remove('on'));
      sel[key] = on ? null : b.dataset.h;
      if (!on) b.classList.add('on');
      $('#' + id + 'Name').textContent = sel[key] ? T.colorName(sel[key]) : '';
      summary();
    });
  }
  function nearest(hex) {
    const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const a = rgb(hex); let best = null, bd = 1e9;
    T.COLORS.forEach(c => { const b = rgb(c.h); const d = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2; if (d < bd) { bd = d; best = c.h; } });
    return best;
  }
  function pick(key, hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex || '')) return;
    const box = $('#' + key + 'Sw'); const b = $(`.sw[data-h="${nearest(hex)}"]`, box);
    if (b) b.click();
  }

  function addRow(v = {}) {
    const d = document.createElement('div'); d.className = 'row';
    d.innerHTML = `
      <select class="cell r-loc" aria-label="Fitting"><option>Inside</option><option>Outside</option></select>
      <input class="cell r-room" placeholder="e.g. Living room" aria-label="Room">
      <input class="cell r-qty" type="number" min="1" value="1" aria-label="Quantity">
      <input class="cell r-w" type="number" min="0" step="any" placeholder="Width" aria-label="Width">
      <input class="cell r-h" type="number" min="0" step="any" placeholder="Drop" aria-label="Drop (height)">
      <button type="button" class="x" aria-label="Remove window">×</button>`;
    if (v.loc) $('.r-loc', d).value = v.loc;
    $('#rows').appendChild(d);
  }
  const rows = () => $$('#rows .row').map(r => ({
    loc: $('.r-loc', r).value, room: $('.r-room', r).value.trim(), qty: +$('.r-qty', r).value || 1,
    w: $('.r-w', r).value, h: $('.r-h', r).value
  }));
  const filledRows = () => rows().filter(r => r.w && r.h);

  function summary() {
    $('#sType').textContent = $('input[name=btype]:checked').value;
    $('#sRail').textContent = sel.rail ? T.colorName(sel.rail) : 'Not chosen';
    $('#sTape').textContent = sel.tape ? T.colorName(sel.tape) : 'Not chosen';
    $('#sWin').textContent = filledRows().reduce((a, r) => a + r.qty, 0) + ' pcs';
    $('#sImg').textContent = images.length;
  }

  function thumbs() {
    $('#thumbs').innerHTML = images.map((s, i) => `<div class="th"><img src="${s}" alt="Window photo ${i + 1}"><button type="button" data-rm="${i}" aria-label="Remove photo">×</button></div>`).join('');
    summary();
  }
  async function addFiles(files) {
    for (const f of files) {
      if (images.length >= MAX_IMG) { T.toast('Maximum of ' + MAX_IMG + ' photos'); break; }
      if (!f.type.startsWith('image/')) continue;
      try { images.push(await T.compress(f, 900, .62)); } catch (e) { T.toast('Could not read ' + f.name); }
    }
    thumbs();
  }

  function waText(o) {
    const lines = o.details.rows.map((r, i) => `${i + 1}) ${r.room || 'Window'} - ${r.loc} - ${r.qty} pc - W ${r.w} x D ${r.h} ${o.details.unit}`);
    return `Hello Tachbonest, I just placed a blind order (Ref ${o.ref}).\nName: ${o.customer.name}\nPhone: ${o.customer.phone}\nBlind: ${o.details.type}\nRail/slat colour: ${o.details.rail || '-'}\nTape colour: ${o.details.tape || '-'}\nWindows:\n${lines.join('\n') || '(sizes to follow)'}\nI will send my window photos here.`;
  }

  function fail(msg) { const b = $('#formErr'); b.style.display = 'block'; $('#formErrTxt').textContent = msg; b.scrollIntoView({ block: 'center', behavior: 'smooth' }); }

  async function submit(e) {
    e.preventDefault();
    $('#formErr').style.display = 'none';
    const name = $('#cName').value.trim(), phone = $('#cPhone').value.trim();
    $$('.field[data-f]').forEach(f => f.classList.remove('bad'));
    let bad = false;
    if (!name) { $('[data-f=name]').classList.add('bad'); bad = true; }
    if (phone.replace(/\D/g, '').length < 10) { $('[data-f=phone]').classList.add('bad'); bad = true; }
    if (bad) { $('.field.bad').scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    const fr = filledRows();
    if (!fr.length && !images.length) return fail('Add at least one window size, or upload a photo of the window.');

    const id = T.uid('B'); const btn = $('#bSubmit'); btn.disabled = true; btn.textContent = 'Sending…';
    const o = {
      id, ref: 'BL-' + id.slice(1), type: 'blind', status: 'Pending', createdAt: new Date().toISOString(),
      customer: { name, phone, email: $('#cEmail').value.trim(), address: $('#cAddr').value.trim() },
      details: { type: $('input[name=btype]:checked').value, rail: sel.rail ? T.colorName(sel.rail) : '', tape: sel.tape ? T.colorName(sel.tape) : '', otherColor: $('#otherColor').value.trim(), unit: $('#unit').value, rows: fr },
      images, notes: $('#notes').value.trim()
    };
    try {
      await Store.addOrder(o);
    } catch (err) {
      btn.disabled = false; btn.textContent = 'Send my order request';
      console.error(err);
      return fail('We could not save your request here (' + (err.name === 'QuotaExceededError' ? 'photos are too large for this browser' : 'connection problem') + '). Please send it on WhatsApp instead.');
    }
    $('#refNo').textContent = o.ref;
    $('#waBtn').href = T.wa(waText(o));
    $('#done').showModal();
    btn.disabled = false; btn.textContent = 'Send my order request';
  }

  document.addEventListener('DOMContentLoaded', () => {
    swatches('rail', 'rail'); swatches('tape', 'tape'); addRow();
    const p = new URLSearchParams(location.search);
    if (['Vertical', 'Venetian'].includes(p.get('type'))) $(`input[name=btype][value=${p.get('type')}]`).checked = true;
    if (p.get('color')) pick('rail', p.get('color'));
    summary();
    $('#addRow').onclick = () => { addRow(); summary(); };
    $('#rows').addEventListener('click', e => { const x = e.target.closest('.x'); if (x) { if ($$('#rows .row').length > 1) x.parentElement.remove(); else $$('input', x.parentElement).forEach(i => i.value = i.classList.contains('r-qty') ? 1 : ''); summary(); } });
    $('#rows').addEventListener('input', summary);
    $$('input[name=btype]').forEach(i => i.addEventListener('change', summary));
    const files = $('#files'), drop = $('#drop');
    files.addEventListener('change', () => { addFiles([...files.files]); files.value = ''; });
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', e => addFiles([...e.dataTransfer.files]));
    $('#thumbs').addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) { images.splice(+b.dataset.rm, 1); thumbs(); } });
    $('#bForm').addEventListener('submit', submit);
  });
})();
