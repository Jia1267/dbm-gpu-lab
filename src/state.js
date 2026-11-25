import { createStore, safeGet, safeSet } from './store.js';
import { WL, WL_ORDER } from './data/workloads.js';

/* App-wide state: Advisor answers, Models filters */
const a = {};
WL_ORDER.forEach((k) => (a[k] = { ...WL[k].def }));

/* Advisor answers survive a reload; stored values that are no longer options are dropped */
const KEY = 'dbm-advisor-v2';
const saved = safeGet(KEY, null);
const S0 = { wl: 'llm', a, pri: 'bal', multi: 'no', ecc: false, mig: false, set: false };
if (saved && WL[saved.wl]) {
  WL_ORDER.forEach((k) => WL[k].fields.forEach((f) => {
    const v = saved.a?.[k]?.[f.k];
    if (f.opts.some((o) => String(o[0]) === String(v))) a[k][f.k] = v;
  }));
  Object.assign(S0, { wl: saved.wl, pri: ['cost', 'bal', 'head'].includes(saved.pri) ? saved.pri : 'bal', multi: saved.multi === 'yes' ? 'yes' : 'no', ecc: !!saved.ecc, mig: !!saved.mig, set: !!saved.set });
}

export const app = createStore({
  S: S0,
  MF: { cat: '', q: '', tier: 0, lic: '', y: 0, ret: false, open: false },
  toast: '',
});
let lastS = S0;
app.subscribe(() => { const s = app.get().S; if (s !== lastS) { lastS = s; safeSet(KEY, s); } });

let toastT;
export function flash(msg) {
  app.set({ toast: msg });
  clearTimeout(toastT);
  toastT = setTimeout(() => app.set({ toast: '' }), 2400);
}

/* `set` marks that the visitor has answered something, so the result page is not a silent default */
export const setS = (patch) => app.set((st) => ({ S: { ...st.S, ...patch, set: true } }));
export const setAns = (wl, patch) => app.set((st) => ({ S: { ...st.S, set: true, a: { ...st.S.a, [wl]: { ...st.S.a[wl], ...patch } } } }));
export const setMF = (patch) => app.set((st) => ({ MF: { ...st.MF, ...patch } }));

/* Open the Advisor on a workload (optionally with answers) */
export function preset(wl, answers) {
  setS({ wl });
  if (answers) setAns(wl, answers);
}
