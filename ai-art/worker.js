// 收 POST { model, prompt, width, height, steps, seed, images: [base64...] }，回 PNG/JPEG 图片。
// FLUX.2 系列要用 multipart（表单）传参数和参考图；FLUX.1 schnell 用普通 JSON。
export default {
  async fetch(req, env) {
    if (req.method !== 'POST') return new Response('POST 一个 JSON', { status: 405 });
    const b = await req.json();
    const model = b.model ?? '@cf/black-forest-labs/flux-2-klein-4b';
    let out;
    try {
      if (model.includes('flux-2')) {
        const form = new FormData();
        form.append('prompt', b.prompt);
        if (b.width) form.append('width', String(b.width));
        if (b.height) form.append('height', String(b.height));
        if (b.steps) form.append('steps', String(b.steps));
        if (b.seed !== undefined) form.append('seed', String(b.seed));
        (b.images ?? []).forEach((img, i) => {
          const bytes = Uint8Array.from(atob(img), (c) => c.charCodeAt(0));
          form.append(`input_image_${i}`, new Blob([bytes], { type: 'image/png' }), `ref${i}.png`);
        });
        const r = new Response(form);
        out = await env.AI.run(model, { multipart: { body: r.body, contentType: r.headers.get('content-type') } });
      } else {
        out = await env.AI.run(model, { prompt: b.prompt, steps: b.steps ?? 8, seed: b.seed, width: b.width, height: b.height });
      }
    } catch (e) {
      return new Response(`出错：${e instanceof Error ? e.message : String(e)}`, { status: 500 });
    }
    const bytes = Uint8Array.from(atob(out.image), (c) => c.charCodeAt(0));
    return new Response(bytes, { headers: { 'content-type': 'image/png' } });
  },
};
