// 用法：node scripts/ai-art/gen.mjs <输出文件> "<提示词>" [宽] [高] [模型] [种子] [参考图...]
// 先在 scripts/ai-art 里跑 `npx wrangler dev --port 8799`（本机的画图小工具），再用这个脚本出图。
import { readFileSync, writeFileSync } from 'node:fs';
const [, , out, prompt, w = '1024', h = '768', model = '@cf/black-forest-labs/flux-2-klein-4b', seed, ...refs] = process.argv;
const body = { model, prompt, width: +w, height: +h, seed: seed ? +seed : undefined, images: refs.map((f) => readFileSync(f).toString('base64')) };
const t = Date.now();
const r = await fetch('http://127.0.0.1:8799', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
if (!r.ok) {
  console.error(r.status, await r.text());
  process.exit(1);
}
writeFileSync(out, Buffer.from(await r.arrayBuffer()));
console.log(`${out}  ${((Date.now() - t) / 1000).toFixed(1)} 秒`);
