// scripts/build-gallery.mjs
// Node 18+. Netlify runs this via: npm run build:gallery
import { readdir, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';

const DIR  = 'gallery';              // scan this folder (your Media Library target)
const OUT  = 'static/gallery.json';
const exts = new Set(['.jpg', '.jpeg', '.png', '.webp']);

(async () => {
  const files = await readdir(DIR).catch(() => []);
  const items = files
    .filter(f => exts.has(extname(f).toLowerCase()))
    .sort()
    .map(f => ({ src: `${DIR}/${f}`, title: '', caption: '' }));

  await writeFile(OUT, JSON.stringify(items, null, 2));
  console.log(`Wrote ${items.length} items to ${OUT}`);
})();
