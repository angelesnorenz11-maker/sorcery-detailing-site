async function renderGallery(){
  try{
    const res = await fetch('static/gallery.json', { cache:'no-store' });
    if(!res.ok) throw new Error('static/gallery.json not found');
    let data = await res.json();
    const items = Array.isArray(data) ? data : Array.isArray(data.images) ? data.images : [];

    const grid = document.getElementById('gallery-grid');
    if(!grid) return;

    if(items.length === 0){
      grid.innerHTML = `<p class="muted">No photos yet. Upload in <a href="/admin/">Admin</a>.</p>`;
      return;
    }

    grid.innerHTML = items.map((it, i) => `
      <figure class="card">
        <img data-index="${i}" src="${it.src || it.url}" alt="${it.title || 'Detailing photo'}" loading="lazy" class="zoomable"/>
        <figcaption>
          ${it.title ? `<strong>${it.title}</strong>` : ''}
          ${(it.caption || it.desc) ? `<div>${it.caption || it.desc}</div>`:''}
        </figcaption>
      </figure>
    `).join('');

    setupLightbox(items.map(it => it.src || it.url));
  }catch(err){
    console.error(err);
    const grid = document.getElementById('gallery-grid');
    if(grid) grid.innerHTML = `<p class="muted">Couldn’t load gallery.</p>`;
  }
}

function setupLightbox(srcs){
  const grid = document.getElementById('gallery-grid');
  if(!grid) return;

  // Create overlay once
  const overlay = document.createElement('div');
  overlay.className = 'lb-overlay';
  overlay.innerHTML = `
    <button class="lb-close" aria-label="Close">×</button>
    <button class="lb-prev" aria-label="Previous">‹</button>
    <button class="lb-next" aria-label="Next">›</button>
    <div class="lb-stage">
      <img class="lb-img" alt="">
      <div class="lb-zoom">
        <button class="z-out" aria-label="Zoom out">−</button>
        <button class="z-in" aria-label="Zoom in">+</button>
        <button class="z-reset" aria-label="Reset zoom">Reset</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const imgEl = overlay.querySelector('.lb-img');
  let index = 0, scale = 1, originX = 0, originY = 0;

  function show(i){
    index = (i + srcs.length) % srcs.length;
    imgEl.src = srcs[index];
    resetZoom();
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function hide(){
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
  function resetZoom(){
    scale = 1; originX = 50; originY = 50;
    applyZoom();
  }
  function applyZoom(){
    imgEl.style.transformOrigin = `${originX}% ${originY}%`;
    imgEl.style.transform = `scale(${scale})`;
  }

  grid.addEventListener('click', (e)=>{
    const t = e.target.closest('img.zoomable');
    if(!t) return;
    const i = Number(t.dataset.index || 0);
    show(i);
  });

  overlay.querySelector('.lb-close').addEventListener('click', hide);
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) hide(); });
  overlay.querySelector('.lb-prev').addEventListener('click', ()=> show(index - 1));
  overlay.querySelector('.lb-next').addEventListener('click', ()=> show(index + 1));

  // keyboard
  window.addEventListener('keydown', (e)=>{
    if(!overlay.classList.contains('show')) return;
    if(e.key === 'Escape') hide();
    if(e.key === 'ArrowLeft') show(index - 1);
    if(e.key === 'ArrowRight') show(index + 1);
    if(e.key === '+') zoomIn();
    if(e.key === '-') zoomOut();
    if(e.key.toLowerCase() === '0') resetZoom();
  });

  // zoom controls
  const zoomIn = ()=>{ scale = Math.min(scale + 0.25, 4); applyZoom(); };
  const zoomOut = ()=>{ scale = Math.max(scale - 0.25, 1); applyZoom(); };
  overlay.querySelector('.z-in').addEventListener('click', zoomIn);
  overlay.querySelector('.z-out').addEventListener('click', zoomOut);
  overlay.querySelector('.z-reset').addEventListener('click', resetZoom);

  // wheel zoom and drag to set origin (simple UX)
  overlay.querySelector('.lb-stage').addEventListener('wheel', (e)=>{
    e.preventDefault();
    (e.deltaY < 0 ? zoomIn : zoomOut)();
  }, {passive:false});

  overlay.querySelector('.lb-stage').addEventListener('mousemove', (e)=>{
    if(scale === 1) return;
    const rect = imgEl.getBoundingClientRect();
    originX = ((e.clientX - rect.left) / rect.width) * 100;
    originY = ((e.clientY - rect.top) / rect.height) * 100;
    applyZoom();
  });
}

renderGallery();
