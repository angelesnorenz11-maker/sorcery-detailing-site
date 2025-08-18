// Node 18+. Run via: npm run build:gallery
import { readdir, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';

const GALLERY_DIR = 'gallery';
const OUT = 'static/gallery.json';
const allowed = new Set(['.jpg','.jpeg','.png','.webp']);

(async () => {
  const files = await readdir(GALLERY_DIR).catch(() => []);
  const items = files
    .filter(f => allowed.has(extname(f).toLowerCase()))
    .sort()
    .map(f => ({ src: `${GALLERY_DIR}/${f}`, title: '', caption: '' }));

  await writeFile(OUT, JSON.stringify(items, null, 2));
  console.log(`Wrote ${items.length} items to ${OUT}`);
})();
