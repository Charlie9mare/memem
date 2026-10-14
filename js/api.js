/* Data layer. 'local' mode uses the browser; 'firebase' mode uses a real shared database. */
(function () {
  const C = window.TACH_CONFIG, FB = C.provider === 'firebase';
  let fb = null, ready = null;
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  };
  const loadScript = src => new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = src; s.onload = res;
    s.onerror = () => rej(new Error('Could not load ' + src)); document.head.appendChild(s);
  });
  function init() {
    if (!FB) return Promise.resolve();
    if (ready) return ready;
    ready = (async () => {
      const b = 'https://www.gstatic.com/firebasejs/10.12.2/';
      await loadScript(b + 'firebase-app-compat.js');
      await Promise.all([loadScript(b + 'firebase-firestore-compat.js'), loadScript(b + 'firebase-auth-compat.js')]);
      firebase.initializeApp(C.firebase);
      fb = { db: firebase.firestore(), auth: firebase.auth() };
      await new Promise(r => { const u = fb.auth.onAuthStateChanged(() => { u(); r(); }); });
    })();
    return ready;
  }
  window.Store = {
    mode: FB ? 'firebase' : 'local',
    async addOrder(o) {
      if (FB) { await init(); const b = fb.db.batch(); b.set(fb.db.collection('orders').doc(o.id), o); b.set(fb.db.collection('tracking').doc(o.ref), { ref: o.ref, status: o.status, type: o.type, updatedAt: o.createdAt }); await b.commit(); return o; }
      const a = ls.get('tach_orders', []); a.unshift(o); ls.set('tach_orders', a); return o;
    },
    async listOrders() {
      if (FB) { await init(); const s = await fb.db.collection('orders').orderBy('createdAt', 'desc').get(); return s.docs.map(d => d.data()); }
      return ls.get('tach_orders', []);
    },
    async updateOrder(id, patch, ref) {
      if (FB) { await init(); const b = fb.db.batch(); b.update(fb.db.collection('orders').doc(id), patch); if (patch.status && ref) b.set(fb.db.collection('tracking').doc(ref), { status: patch.status, updatedAt: new Date().toISOString() }, { merge: true }); return b.commit(); }
      const a = ls.get('tach_orders', []); const i = a.findIndex(x => x.id === id);
      if (i > -1) { Object.assign(a[i], patch); ls.set('tach_orders', a); }
    },
    async deleteOrder(id, ref) {
      if (FB) { await init(); const b = fb.db.batch(); b.delete(fb.db.collection('orders').doc(id)); if (ref) b.delete(fb.db.collection('tracking').doc(ref)); return b.commit(); }
      ls.set('tach_orders', ls.get('tach_orders', []).filter(x => x.id !== id));
    },
    async track(ref) {
      ref = String(ref).trim().toUpperCase();
      if (FB) { await init(); const d = await fb.db.collection('tracking').doc(ref).get(); return d.exists ? d.data() : null; }
      const o = ls.get('tach_orders', []).find(x => x.ref === ref); return o ? { ref: o.ref, status: o.status, type: o.type, updatedAt: o.createdAt } : null;
    },
    async getSettings() {
      try { if (FB) { await init(); const d = await fb.db.collection('settings').doc('site').get(); return d.exists ? d.data() : {}; } return ls.get('tach_settings', {}); } catch (e) { return {}; }
    },
    async saveSettings(s) { if (FB) { await init(); return fb.db.collection('settings').doc('site').set(s); } ls.set('tach_settings', s); },
    async listProducts() {
      let p = null;
      try {
        if (FB) { await init(); const s = await fb.db.collection('products').get(); p = s.docs.map(d => d.data()); }
        else p = ls.get('tach_products', null);
      } catch (e) { console.warn('Products fallback:', e); }
      if (p && p.length) {
        const order = window.TACH_DEFAULT_PRODUCTS.map(x => x.id);
        return p.sort((a, b) => (order.indexOf(a.id) + 999 * (order.indexOf(a.id) < 0)) - (order.indexOf(b.id) + 999 * (order.indexOf(b.id) < 0)) || (a.created || 0) - (b.created || 0));
      }
      return window.TACH_DEFAULT_PRODUCTS.slice();
    },
    async saveProducts(list) {
      if (FB) {
        await init(); const col = fb.db.collection('products'); const old = await col.get(); const b = fb.db.batch();
        old.docs.forEach(d => b.delete(d.ref)); list.forEach(p => b.set(col.doc(p.id), p)); return b.commit();
      }
      ls.set('tach_products', list);
    },
    async resetProducts() {
      if (FB) { await init(); const col = fb.db.collection('products'); const old = await col.get(); const b = fb.db.batch(); old.docs.forEach(d => b.delete(d.ref)); return b.commit(); }
      localStorage.removeItem('tach_products');
    },
    async login(a, b) {
      if (FB) { await init(); await fb.auth.signInWithEmailAndPassword(a, b); return true; }
      throw new Error('Admin needs the shared database (Firebase)');
    },
    async logout() { if (FB) { await init(); await fb.auth.signOut(); } sessionStorage.removeItem('tach_admin'); },
    async isAdmin() { if (FB) { await init(); return !!fb.auth.currentUser; } return false; }
  };
})();

/* Email me every new order, enquiry or own list (EmailJS) */
(function () {
  const E = { serviceId: 'service_bjo7l1k', templateId: 'template_ajp30qz', publicKey: 'qAUNn2DTFpzyNwWMW' };
  if (!E.serviceId.startsWith('service_')) return;      // stays off until filled in
  if (/admin/.test(location.pathname)) return;           // never email from the admin page

  const summary = o => {
    const d = o.details || {}, t = [];
    if (o.type === 'food') (d.items || []).forEach(i => t.push(`${i.qty} ${i.unit} ${i.name}`));
    if (o.type === 'blind') {
      t.push(`Blind: ${d.type} | rail/slat: ${d.rail || '-'}`);
      (d.rows || []).forEach(r => t.push(`${r.room} (${r.loc}) x${r.qty}  W ${r.w} x D ${r.h} ${d.unit}${r.install ? ' + install' : ''}`));
    }
    if (o.type === 'enquiry') t.push('Topic: ' + d.subject);
    if (d.ownList) t.push('Own list:\n' + d.ownList);
    if (d.delivery) t.push('Delivery: ' + d.delivery.label);
    if (d.contactPref) t.push('Contact by: ' + d.contactPref);
    const p = (o.images || []).length, f = (o.files || []).length;
    if (p || f) t.push(`Attachments: ${p} picture(s), ${f} file(s). Open them in the admin page.`);
    return t.join('\n');
  };

  const original = Store.addOrder.bind(Store);
  Store.addOrder = async function (o) {
    const saved = await original(o);                     // the order is saved first
    try {
      fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: E.serviceId, template_id: E.templateId, user_id: E.publicKey,
          template_params: {
            ref: o.ref, type: o.type, date: new Date(o.createdAt).toLocaleString('en-NG'),
            name: o.customer.name, phone: o.customer.phone, email: o.customer.email || '-',
            address: o.customer.address || '-', details: summary(o), notes: o.notes || '-'
          }
        })
      }).catch(() => {});
    } catch (e) {}
    return saved;
  };
})();
