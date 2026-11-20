# DBM GPU Lab

React + Vite site for choosing GPUs: GPU explorer, compare, sizing Advisor, open-model list, benchmarks and scenario guides (LLM inference, GPU virtualization, live streaming). English at `/`, Chinese at `/zh/`.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static files in dist/
```

## Deploy

`dist/` is a static site. Because it uses real URLs (`/gpus`, `/zh/scenarios/llm`), the web server must send `index.html` for any path that is not a file (SPA fallback), for example `try_files $uri /index.html;` in nginx.

## Where things live

- `src/data/` — GPUs, workloads and sizing rules, open models, benchmarks, scenario content. Every user-facing string is `{ en, zh }`.
- `src/pages/` — one component per page.
- `public/img/` — images.
- `legacy/index.html` — the earlier single-file version, kept for reference only.
