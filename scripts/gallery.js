// Render gallery from /static/gallery.json
async function renderGallery(){
  try{
    const res = await fetch('static/gallery.json', { cache:'no-store' });
    if(!res.ok) throw new Error('static/gallery.json not found');
    const items = await res.json();

    const grid = document.getElementById('gallery-grid');
    if(!grid) return;

    if(!Array.isArray(items) || items.length === 0){
      grid.innerHTML = `<p class="muted">No photos yet. Upload in <a href="/admin/">Admin</a>.</p>`;
      return;
    }

    grid.innerHTML = items.map(it => `
      <figure class="card">
        <img src="${it.src}" alt="${it.title || 'Detailing photo'}" loading="lazy" />
        <figcaption>${it.title ? `<strong>${it.title}</strong>` : ''} ${it.caption ? `<div>${it.caption}</div>`:''}</figcaption>
      </figure>
    `).join('');
  }catch(err){
    console.error(err);
    const grid = document.getElementById('gallery-grid');
    if(grid) grid.innerHTML = `<p class="muted">Couldn’t load gallery.</p>`;
  }
}
renderGallery();
