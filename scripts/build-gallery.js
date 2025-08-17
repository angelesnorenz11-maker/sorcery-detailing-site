// scans static/uploads and writes gallery.json
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(process.cwd(), 'static', 'uploads');
const OUT_FILE = path.join(process.cwd(), 'gallery.json');
const exts = new Set(['.jpg','.jpeg','.png','.webp','.gif','.avif']);

function humanize(name){
  return name
    .replace(/\.[^/.]+$/, '')     // remove extension
    .replace(/[_-]+/g, ' ')       // _ or - to space
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function walk(dir){
  let files=[];
  for(const item of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,item.name);
    if(item.isDirectory()) files=files.concat(walk(p));
    else files.push(p);
  }
  return files;
}

function main(){
  if(!fs.existsSync(UPLOADS_DIR)){
    console.log('No uploads folder yet:', UPLOADS_DIR);
    fs.writeFileSync(OUT_FILE, JSON.stringify({ items: [] }, null, 2));
    return;
  }

  const all = walk(UPLOADS_DIR).filter(f => exts.has(path.extname(f).toLowerCase()));
  const items = all.map(f => {
    const rel = '/' + path.posix.join('static','uploads', path.relative(UPLOADS_DIR, f).split(path.sep).join('/'));
    const stat = fs.statSync(f);
    const fileName = path.basename(f);
    return {
      title: humanize(fileName),
      service: '',
      image: rel,
      alt: humanize(fileName),
      mtimeMs: stat.mtimeMs
    };
  }).sort((a,b)=> b.mtimeMs - a.mtimeMs) // newest first
    .map(({mtimeMs, ...rest}) => rest);  // strip mtime from output

  const out = { generatedAt: new Date().toISOString(), items };
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));
  console.log(`Generated gallery.json with ${items.length} items`);
}

main();