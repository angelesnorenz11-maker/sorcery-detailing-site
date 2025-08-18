async function renderGallery(){
  try{
    const res = await fetch('static/gallery.json', { cache:'no-store' });
    if(!res.ok) throw new Error('static/gallery.json not found');
    let data = await res.json();

    // Accept flat array OR { images: [...] }
    const items = Array.isArray(data) ? data : Array.isArray(data.images) ? data.images : [];
    const grid = document.getElementById('gallery-grid');
    if(!grid) return;

    if(items.length === 0){
      grid.innerHTML = `<p class="muted">No photos yet. Upload in <a href="/admin/">Admin</a>.</p>`;
      return;
    }

    grid.innerHTML = items.map((it, i) => `
      <figure class="card">
        <img data-index="${i}" src="${it.src || it.url}" alt="${(it.title || 'Detailing photo')}" loading="lazy" class="zoomable"/>
        <figcaption>
          ${it.title ? `<strong>${it.title}</strong>` : ''}
          ${(it.caption || it.desc) ? `<div>${it.caption || it.desc}</div>`:''}
        </figcaption>
      </figure>
    `).join('');

    // Pass both srcs + meta for captions
    setupLightbox(items.map(it => ({
      src: it.src || it.url,
      title: it.title || '',
      caption: it.caption || it.desc || ''
    })));
  }catch(err){
    console.error(err);
    const grid = document.getElementById('gallery-grid');
    if(grid) grid.innerHTML = `<p class="muted">Couldn’t load gallery.</p>`;
  }
}

function setupLightbox(items){
  const grid = document.getElementById('gallery-grid');
  if(!grid) return;

  // Avoid double-inserting overlay
  if (document.querySelector('.lb-overlay')) return;

  // Create overlay once
  const overlay = document.createElement('div');
  overlay.className = 'lb-overlay';
  overlay.innerHTML = `
    <button class="lb-close" aria-label="Close">×</button>
    <button class="lb-prev" aria-label="Previous">‹</button>
    <button class="lb-next" aria-label="Next">›</button>
    <div class="lb-stage">
      <img class="lb-img" alt="">
      <div class="lb-meta"></div>
      <div class="lb-zoom">
        <button class="z-out" aria-label="Zoom out">−</button>
        <button class="z-in" aria-label="Zoom in">+</button>
        <button class="z-reset" aria-label="Reset zoom">Reset</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const imgEl = overlay.querySelector('.lb-img');
  const metaEl = overlay.querySelector('.lb-meta');
  let index = 0, scale = 1, originX = 50, originY = 50;

  function preload(i){
    const nxt = new Image();
    nxt.src = items[(i + items.length) % items.length].src;
  }

  function renderMeta(){
    const it = items[index];
    let html = '';
    if (it.title) html += `<div class="lb-title">${escapeHTML(it.title)}</div>`;
    if (it.caption) html += `<div class="lb-caption">${escapeHTML(it.caption)}</div>`;
    metaEl.innerHTML = html;
  }

  function show(i){
    index = (i + items.length) % items.length;
    const { src } = items[index];
    imgEl.src = src;
    resetZoom();
    renderMeta();
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    // Preload neighbors
    preload(index + 1);
    preload(index - 1);
  }

  function hide(){
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  function resetZoom(){ scale = 1; originX = 50; originY = 50; applyZoom(); }
  function applyZoom(){
    imgEl.style.transformOrigin = `${originX}% ${originY}%`;
    imgEl.style.transform = `scale(${scale})`;
  }

  // Grid click -> open
  grid.addEventListener('click', (e)=>{
    const t = e.target.closest('img.zoomable');
    if(!t) return;
    const i = Number(t.dataset.index || 0);
    show(i);
  });

  // Controls
  overlay.querySelector('.lb-close').addEventListener('click', hide);
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) hide(); });
  overlay.querySelector('.lb-prev').addEventListener('click', ()=> show(index - 1));
  overlay.querySelector('.lb-next').addEventListener('click', ()=> show(index + 1));

  // Keyboard
  window.addEventListener('keydown', (e)=>{
    if(!overlay.classList.contains('show')) return;
    const key = e.key;
    if(key === 'Escape') hide();
    if(key === 'ArrowLeft') show(index - 1);
    if(key === 'ArrowRight') show(index + 1);
    if(key === '+' || key === '=' ) zoomIn();       // plus / numpad plus
    if(key === '-' ) zoomOut();                      // minus / numpad minus
    if(key === '0') resetZoom();
  });

  // Zoom controls
  const zoomIn  = ()=>{ scale = Math.min(scale + 0.25, 4); applyZoom(); };
  const zoomOut = ()=>{ scale = Math.max(scale - 0.25, 1); applyZoom(); };
  overlay.querySelector('.z-in').addEventListener('click', zoomIn);
  overlay.querySelector('.z-out').addEventListener('click', zoomOut);
  overlay.querySelector('.z-reset').addEventListener('click', resetZoom);

  // Wheel zoom & follow cursor for origin
  const stage = overlay.querySelector('.lb-stage');
  stage.addEventListener('wheel', (e)=>{
    e.preventDefault();
    (e.deltaY < 0 ? zoomIn : zoomOut)();
  }, {passive:false});

  stage.addEventListener('mousemove', (e)=>{
    if(scale === 1) return;
    const rect = imgEl.getBoundingClientRect();
    originX = ((e.clientX - rect.left) / rect.width) * 100;
    originY = ((e.clientY - rect.top) / rect.height) * 100;
    applyZoom();
  });

  // Touch swipe (simple)
  let startX = 0, startY = 0, swiping = false;
  stage.addEventListener('touchstart', (e)=>{
    if(!overlay.classList.contains('show')) return;
    if(e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    swiping = true;
  }, {passive:true});

  stage.addEventListener('touchmove', (e)=>{
    if(!swiping) return;
    // allow normal scroll vertically if needed
  }, {passive:true});

  stage.addEventListener('touchend', (e)=>{
    if(!swiping) return;
    const endX = e.changedTouches[0].clientX;
    const dx = endX - startX;
    if(Math.abs(dx) > 40){ // threshold
      dx < 0 ? show(index + 1) : show(index - 1);
    }
    swiping = false;
  });

  function escapeHTML(s){
    return (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
}

renderGallery();
