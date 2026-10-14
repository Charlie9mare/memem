/* Product photos. Looks for the admin-uploaded photo first, then assets/img/<product-id>.jpg.
   If neither loads, shows a neutral fallback (never a broken or blank box). */
(function () {
  const esc = T.esc;
  T.placeholder = name => 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#eef1f6"/><text x="200" y="145" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="700" fill="#3a4659">${String(name).replace(/[<&>]/g, '')}</text><text x="200" y="175" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#8d95a0">Photo coming soon</text></svg>`);
  T.imgFail = el => {
    el.onerror = null;
    el.src = el.dataset.type === 'blind' ? T.blindArt(el.dataset.style, el.dataset.color || '#8d95a0') : T.placeholder(el.alt);
  };
  T.productImg = (p, style) => {
    const src = p.image || `assets/img/${encodeURIComponent(p.id)}.jpg`;
    return `<img src="${esc(src)}" alt="${esc(p.name)}" loading="lazy" decoding="async" data-type="${esc(p.type)}" data-style="${esc(p.style || '')}" data-color="${esc(p.color || '')}" ${style ? `style="${style}"` : ''} onerror="T.imgFail(this)">`;
  };
  T.thumb = p => T.productImg(p, 'width:100%;height:100%;object-fit:cover;border-radius:inherit');
})();
