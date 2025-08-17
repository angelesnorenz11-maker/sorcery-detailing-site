(async function () {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  try {
    const res = await fetch('static/gallery.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to load gallery.json');
    const data = await res.json();

    // data.images = [{title, desc, url}]
    const items = (data.images || []).map(item => {
      const el = document.createElement('article');
      el.className = 'g-item';
      el.innerHTML = `
        <img src="${item.url}" alt="${item.title || ''}">
        <div class="g-body">
          <h4>${item.title || 'Untitled'}</h4>
          ${item.desc ? `<p>${item.desc}</p>` : ''}
        </div>
      `;
      return el;
    });

    grid.replaceChildren(...items);
  } catch (err) {
    grid.textContent = 'Could not load gallery yet.';
    console.error(err);
  }
})();