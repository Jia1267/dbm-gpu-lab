import { createStore, safeGet, safeSet } from './store.js';
import { G } from './data/gpus.js';
import { WL, WL_ORDER } from './data/workloads.js';

/* App-wide state: compare selection, Advisor answers, Models filters */
const a = {};
WL_ORDER.forEach((k) => (a[k] = { ...WL[k].def }));

export const app = createStore({
  sel: safeGet('gpulab.cmp', []).filter(G).slice(0, 4),
  S: { wl: 'llm', a, pri: 'bal', multi: 'no', ecc: false, mig: false },
  MF: { cat: '', q: '', tier: 0, lic: '', y: 0, ret: false, open: false },
  toast: '',
});

app.subscribe(() => safeSet('gpulab.cmp', app.get().sel));

let toastT;
export function flash(msg) {
  app.set({ toast: msg });
  clearTimeout(toastT);
  toastT = setTimeout(() => app.set({ toast: '' }), 2400);
}

export function toggleCmp(id, msg) {
  const { sel } = app.get();
  if (sel.includes(id)) app.set({ sel: sel.filter((x) => x !== id) });
  else if (sel.length < 4) app.set({ sel: [...sel, id] });
  else flash(msg);
}

export const setS = (patch) => app.set((st) => ({ S: { ...st.S, ...patch } }));
export const setAns = (wl, patch) => app.set((st) => ({ S: { ...st.S, a: { ...st.S.a, [wl]: { ...st.S.a[wl], ...patch } } } }));
export const setMF = (patch) => app.set((st) => ({ MF: { ...st.MF, ...patch } }));

/* Open the Advisor on a workload (optionally with answers) */
export function preset(wl, answers) {
  setS({ wl });
  if (answers) setAns(wl, answers);
}
