// scripts/gallery.js
async function renderGallery() {
  try {
    const res = await fetch('/static/gallery.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('static/gallery.json not found');
    const raw = await res.json();

    const items = Array.isArray(raw) ? raw : Array.isArray(raw.images) ? raw.images : [];
    const grid  = document.getElementById('gallery-grid');
    if (!grid) return;

    if (items.length === 0) {
      grid.innerHTML = `<p class="muted">No photos yet. Upload in <a href="/admin/">Admin</a>.</p>`;
      return;
    }

    grid.innerHTML = items.map((it, i) => `
      <figure class="card">
        <img data-index="${i}" src="${it.src || it.url}" alt="${it.title || 'Detailing photo'}"
             loading="lazy" class="zoomable" />
        <figcaption>
          ${it.title ? `<strong>${it.title}</strong>` : ''}
          ${(it.caption || it.desc) ? `<div>${it.caption || it.desc}</div>` : ''}
        </figcaption>
      </figure>
    `).join('');

    setupLightbox(items.map(it => ({
      src: it.src || it.url,
      title: it.title || '',
      caption: it.caption || it.desc || ''
    })));
  } catch (err) {
    console.error(err);
    const grid = document.getElementById('gallery-grid');
    if (grid) grid.innerHTML = `<p class="muted">Couldn’t load gallery.</p>`;
  }
}

function setupLightbox(items) {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  if (document.querySelector('.lb-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'lb-overlay';
  overlay.innerHTML = `
    <button class="lb-close" aria-label="Close">×</button>
    <button class="lb-prev" aria-label="Previous">‹</button>
    <button class="lb-next" aria-label="Next">›</button>
    <div class="lb-stage">
      <img class="lb-img" alt="">
      <div class="lb-meta"></div>
      <a class="lb-download" href="#" download>Download</a>
      <div class="lb-zoom">
        <button class="z-out" aria-label="Zoom out">−</button>
        <button class="z-in" aria-label="Zoom in">+</button>
        <button class="z-reset" aria-label="Reset zoom">Reset</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const imgEl = overlay.querySelector('.lb-img');
  const metaEl = overlay.querySelector('.lb-meta');
  const dlEl  = overlay.querySelector('.lb-download');
  const stage = overlay.querySelector('.lb-stage');

  let index = 0, scale = 1, originX = 50, originY = 50;

  const escapeHTML = s => (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const renderMeta = () => {
    const it = items[index];
    metaEl.innerHTML = (it.title ? `<div class="lb-title">${escapeHTML(it.title)}</div>` : '')
                     + (it.caption ? `<div class="lb-caption">${escapeHTML(it.caption)}</div>` : '');
    dlEl.href = it.src;
  };
  const preload = i => { const n = new Image(); n.src = items[(i + items.length) % items.length].src; };
  const show = i => {
    index = (i + items.length) % items.length;
    imgEl.src = items[index].src;
    resetZoom();
    renderMeta();
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    preload(index + 1);
    preload(index - 1);
  };
  const hide = () => { overlay.classList.remove('show'); document.body.style.overflow = ''; };
  const applyZoom = () => {
    imgEl.style.transformOrigin = `${originX}% ${originY}%`;
    imgEl.style.transform = `scale(${scale})`;
  };
  const resetZoom = () => { scale = 1; originX = 50; originY = 50; applyZoom(); };
  const zoomIn  = () => { scale = Math.min(scale + 0.25, 4); applyZoom(); };
  const zoomOut = () => { scale = Math.max(scale - 0.25, 1); applyZoom(); };

  grid.addEventListener('click', e => {
    const t = e.target.closest('img.zoomable');
    if (!t) return;
    const i = Number(t.dataset.index || 0);
    try { show(i); } catch { window.open(items[i]?.src, '_blank', 'noopener'); }
  });

  overlay.querySelector('.lb-close').addEventListener('click', hide);
  overlay.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
  overlay.querySelector('.lb-next').addEventListener('click', () => show(index + 1));
  overlay.addEventListener('click', e => { if (e.target === overlay) hide(); });
  stage.addEventListener('click', e => {
    const isCtl = e.target.closest('.lb-zoom, .lb-prev, .lb-next, .lb-close, .lb-download');
    if (!isCtl && !e.target.closest('.lb-img')) hide();
  });

  window.addEventListener('keydown', e => {
    if (!overlay.classList.contains('show')) return;
    if (e.key === 'Escape') hide();
    if (e.key === 'ArrowLeft')  show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === '+' || e.key === '=') zoomIn();
    if (e.key === '-')           zoomOut();
    if (e.key === '0')           resetZoom();
  });

  overlay.querySelector('.z-in').addEventListener('click', zoomIn);
  overlay.querySelector('.z-out').addEventListener('click', zoomOut);
  overlay.querySelector('.z-reset').addEventListener('click', resetZoom);

  stage.addEventListener('wheel', e => {
    e.preventDefault();
    (e.deltaY < 0 ? zoomIn : zoomOut)();
  }, { passive: false });

  stage.addEventListener('mousemove', e => {
    if (scale === 1) return;
    const rect = imgEl.getBoundingClientRect();
    originX = ((e.clientX - rect.left) / rect.width) * 100;
    originY = ((e.clientY - rect.top) / rect.height) * 100;
    applyZoom();
  });

  let startX = 0, swiping = false;
  stage.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX; swiping = true;
  }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (!swiping) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { dx < 0 ? show(index + 1) : show(index - 1); }
    swiping = false;
  }, { passive: true });
}

renderGallery();
