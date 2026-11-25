/* GitHub Pages has no SPA rewrite: an unknown path is served by 404.html with status 404.
   After `vite build`, write a copy of index.html for every real route (e.g. dist/zh/gpu/rtx-5090.html),
   which Pages serves with status 200. Routes come from the data files, so new GPUs and guides are covered.
   Unknown paths still fall through to 404.html. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

const gpus = [...read('src/data/gpus.js').matchAll(/\{id:'([\w-]+)'/g)].map((m) => m[1]);
const guides = [...read('src/data/scenarios.js').matchAll(/^\s{4}id: '([\w-]+)', img:/gm), ...read('src/data/scenarios2.js').matchAll(/^\s{4}id: '([\w-]+)', img:/gm)].map((m) => m[1]);
if (!gpus.length || !guides.length) throw new Error(`route discovery failed: ${gpus.length} GPUs, ${guides.length} guides`);

const pages = ['workloads', 'gpus', 'advisor', 'advisor/1', 'advisor/2', 'advisor/3', 'advisor/4', 'models', 'benchmarks', 'scenarios',
  ...gpus.map((id) => 'gpu/' + id), ...guides.map((id) => 'scenarios/' + id)];
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
let n = 0;
for (const r of ['zh', ...pages, ...pages.map((p) => 'zh/' + p)]) {
  /* both /x (served from x.html) and /x/ (served from x/index.html), since zh/, advisor/ and scenarios/ are also folders */
  for (const f of [path.join(dist, r + '.html'), path.join(dist, r, 'index.html')]) {
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, html);
  }
  n++;
}
console.log(`prerender-routes: wrote ${n} routes as x.html and x/index.html (${gpus.length} GPUs, ${guides.length} guides, 2 languages)`);
