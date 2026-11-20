import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useLang } from '../i18n.jsx';
import { useStore } from '../store.js';
import { app, preset } from '../state.js';
import { GPUS, G, fmt, f1 } from '../data/gpus.js';
import { WL, WL_ORDER, SCEN, need, fitOf } from '../data/workloads.js';
import { Ico, A, St, img } from '../ui.jsx';
import { VLLM, OLLAMA } from '../data/bench.js';
import { EXT, NVENC } from '../data/ext.js';

export function FitCell({ g, sc }) {
  const { tr, L } = useLang();
  const r = fitOf(g, sc);
  if (r.why) return <><span className="no"><Ico id="i-warn" /></span><span style={{ fontFamily: 'var(--sans)' }}>{L(r.why)}</span></>;
  return r.spare != null ? <><span className="ok"><Ico id="i-ok" /></span>{tr(`${f1(r.spare)} GB spare`, `余 ${f1(r.spare)} GB`)}</> : <><span className="no"><Ico id="i-warn" /></span>{tr(`needs ${r.gpus} GPUs`, `需要 ${r.gpus} 张卡`)}</>;
}

/* Every measured or published number we have for one GPU */
const b = (en, zh) => ({ en, zh });
const ORD = ['', b('1st', '第 1'), b('2nd', '第 2'), b('3rd', '第 3')];
function perfOf(id) {
  const out = [];
  const rank = (vals, v, lower) => [[...vals].sort((x, y) => (lower ? x - y : y - x)).indexOf(v) + 1, vals.length];
  const vk = ['qwen3-8b-fp8', 'qwen25-14b-fp16', 'qwen36-27b-fp8', 'gemma4-31b'].find((k) => VLLM[k].rows.some((r) => r[0] === id));
  if (vk) {
    const m = VLLM[vk], at = (c, col) => m.rows.filter((r) => r[1] === c);
    const one = at(1).find((r) => r[0] === id), many = at(32).find((r) => r[0] === id);
    if (one) out.push({ t: b(`${m.name} · 1 user`, `${m.name} · 1 人`), v: one[4], unit: 'tok/s', r: rank(at(1).map((r) => r[4]), one[4]), max: Math.max(...at(1).map((r) => r[4])), kind: 'dbm', tab: 'vllm', src: 'vLLM' });
    if (many) out.push({ t: b(`${m.name} · 32 users, total`, `${m.name} · 32 人合计`), v: many[5], unit: 'tok/s', r: rank(at(32).map((r) => r[5]), many[5]), max: Math.max(...at(32).map((r) => r[5])), kind: 'dbm', tab: 'vllm', src: 'vLLM' });
  }
  const ok = Object.entries(OLLAMA).find(([, m]) => m.rows.some((r) => r[0] === id));
  if (ok) { const rows = ok[1].rows, r = rows.find((x) => x[0] === id); out.push({ t: b(`${ok[0]} · Ollama`, `${ok[0]} · Ollama`), v: r[2], unit: 'tok/s', r: rank(rows.map((x) => x[2]), r[2]), max: Math.max(...rows.map((x) => x[2])), kind: 'dbm', tab: 'ollama', src: 'Ollama' }); }
  [['blender', 0, 'render'], ['steelnomad', 0, 'graphics'], ['lambda', 0, 'train'], ['amber', 0, 'md'], ['specvp', 0, 'cad'], ['deepstream', 0, null], ['isaac', 0, null]].forEach(([k, c, tab]) => {
    const s = EXT[k], row = s.rows.find((r) => r[0] === id);
    if (!row || row[c + 1] == null) return;
    const vals = s.rows.map((r) => r[c + 1]).filter((v) => v != null), col = s.cols[c];
    out.push({ t: s.cols.length > 1 ? b(`${s.name.en} · ${col.n.en}`, `${s.name.zh} · ${col.n.zh}`) : s.name, v: row[c + 1], unit: col.unit, r: rank(vals, row[c + 1], col.lower), max: Math.max(...vals), kind: 'ext', tab, src: s.src.label, url: s.src.url });
  });
  return out;
}

export default function Detail() {
  const { id } = useParams();
  const { tr, L, p } = useLang();
  const S = useStore(app, (s) => s.S);
  const [curSec, setCur] = useState('d-specs');
  const g = G(id);
  useEffect(() => {
    const on = () => { let c = null; document.querySelectorAll('.dsec').forEach((s) => { if (s.getBoundingClientRect().top < 170) c = s.id; }); if (c) setCur(c); };
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { if (g) document.title = g.name + ' · DBM GPU Lab'; }, [g]);
  if (!g) return <Navigate to={p('/gpus')} replace />;

  const alts = GPUS.filter((x) => x.id !== g.id && x.gfx === g.gfx).sort((a, c) => Math.abs(a.vtot - g.vtot) - Math.abs(c.vtot - g.vtot) || Math.abs(a.tier - g.tier) - Math.abs(c.tier - g.tier) || c.bw - a.bw).slice(0, 2);
  const nv = NVENC[g.id];
  const yn = (v) => (v === true ? tr('Yes', '有') : v === false ? tr('No', '无') : tr('Not listed', '未列出'));
  const rows = [[tr('Architecture', '架构'), g.arch], [tr('GPU memory', '显存'), g.memL + (g.ecc ? ' · ECC' : '')], [tr('Memory interface', '显存位宽'), `${fmt(g.bus)}-bit${g.dual ? tr(' per GPU', '（每颗 GPU）') : ''}`], [tr('Memory bandwidth', '显存带宽'), `${fmt(g.bw)} GB/s`], [tr('CUDA cores', 'CUDA 核心'), fmt(g.cuda)], [tr('Tensor cores', 'Tensor 核心'), g.tensor ? fmt(g.tensor) : '—'], [tr('RT cores', 'RT 核心'), g.rt ? fmt(g.rt) : '—'],
    [tr('FP32 peak', 'FP32 峰值'), g.fp32 != null ? `${g.fp32} TFLOPS` : tr('Not published', '未公布')], [tr('FP64 peak', 'FP64 峰值'), g.fp64 != null ? `${g.fp64} TFLOPS` : tr('Low (consumer / workstation ratio)', '低（消费级 / 工作站比例）')], [tr('Max power', '最大功耗'), `${g.tdp} W`], [tr('Interface', '接口'), g.pcie], [tr('Form factor', '外形'), g.slots], [tr('Cooling', '散热'), g.cool], [tr('NVENC encoder', 'NVENC 编码器'), nv ? (nv[0] ? `${nv[0]} × NVENC · ${nv[1] === '∞' ? tr('no session limit', '不限路数') : tr(`${nv[1]} sessions`, `${nv[1]} 路`)}${nv[2] ? ' · AV1' : ''}` : tr('None', '无')) : yn(g.nvenc)], ['NVLink', yn(g.nvlink)], ['MIG', yn(g.mig)]];
  const off = g.img.startsWith('official/');
  const go = (e, sid) => { e.preventDefault(); document.getElementById(sid)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
  const perf = perfOf(g.id);
  const subs = [['d-specs', tr('Specifications', '规格')], ['d-use', tr('Use cases', '适用场景')], ['d-fit', tr('Workload fit', '工作负载匹配')], ...(perf.length ? [['d-perf', tr('Performance', '性能')]] : []), ['d-alt', tr('Alternatives', '替代型号')]];

  return (
    <>
      <div className="dhero"><div className="wrap">
        <div><div className="crumb"><A to="/">{tr('Home', '首页')}</A> / <A to="/gpus">{tr('GPU Explorer', 'GPU 列表')}</A> / {g.name}</div>
          <div className="ph"><img src={img(g.img)} alt={g.full} /></div>
          <p className="note" style={{ marginTop: 10 }}>{off ? tr('Image: NVIDIA.', '图片：NVIDIA。') + (g.imgNoteI ? ' ' + L(g.imgNoteI) : '') : (g.imgNoteI ? L(g.imgNoteI) : tr('Illustrative render.', '示意渲染图。'))}</p></div>
        <div>
          <span className="eyebrow">{g.full} · {L(g.seriesI)}</span>
          <h1>{g.name}</h1>
          <p className="intro">{L(g.introI)}</p>
          <div className="big"><b>{g.vtot}</b><span>GB {g.dual ? '(2 × 12) ' : ''}{g.mem}</span></div>
          <div className="trio"><div><span>{tr('Bandwidth', '带宽')}</span><b>{fmt(g.bw)} GB/s</b></div><div><span>{tr('Max power', '最大功耗')}</span><b>{g.tdp} W</b></div><div><span>{tr('Architecture', '架构')}</span><b>{g.arch.replace(' Lovelace', '')}</b></div></div>
          <div className="dctas"><a className="btn btn-primary" href="https://www.gpu-mart.com/" target="_blank" rel="noopener"><Ico id="i-clock" />{tr('Check DBM availability', '查询 DBM 库存')}</a></div>
        </div>
      </div></div>
      <nav className="subnav" aria-label={tr('On this page', '本页导航')}><div className="wrap">{subs.map(([sid, t]) => <a key={sid} href={'#' + sid} className={curSec === sid ? 'cur' : ''} onClick={(e) => go(e, sid)}>{t}</a>)}</div></nav>
      <div className="wrap">
        <section className="dsec" id="d-specs"><div className="dgrid"><div><h2>{tr('Specifications', '规格')}</h2><div style={{ marginTop: 12 }}><St t="ds" /></div></div>
          <div className="panel" style={{ padding: '4px 24px' }}><table className="t"><tbody>{rows.map((r) => <tr key={r[0]}><th scope="row">{r[0]}</th><td className="m">{r[1]}</td></tr>)}</tbody></table></div></div></section>
        <section className="dsec" id="d-use"><div className="dgrid"><div><h2>{tr('Use cases', '适用场景')}</h2></div>
          <div className="panel" style={{ padding: '4px 24px' }}>{WL_ORDER.map((k) => { const why = (WL[k].req || (() => null))(g, S.a[k]), on = g.use.includes(k); return (
            <div className="fitrow" key={k}><div className="w">{L(WL[k].name)}</div>
              <div className="r">{why ? <><span className="no"><Ico id="i-warn" /></span><span style={{ fontFamily: 'var(--sans)' }}>{L(why)}</span></> : on ? <><span className="ok"><Ico id="i-ok" /></span><span style={{ fontFamily: 'var(--sans)' }}>{tr('Recommended', '推荐')}</span></> : <span style={{ fontFamily: 'var(--sans)', color: 'var(--steel)' }}>{tr('Possible', '可以用')}</span>}</div>
              <A className="link" style={{ fontSize: 13.5 }} to="/advisor/2" onClick={() => preset(k)}>{tr('Size it', '估算')} <Ico id="i-arrow" /></A></div>
          ); })}</div></div></section>
        <section className="dsec" id="d-fit"><div className="dgrid"><div><h2>{tr('Workload fit', '工作负载匹配')}</h2><div style={{ marginTop: 12 }}><St t="est" /></div></div>
          <div className="panel" style={{ padding: '4px 24px' }}>{SCEN.map((sc, i) => (
            <div className="fitrow" key={i}><div className="w">{L(sc.t)}<small>{sc.s} · {tr('needs', '需要')} {f1(need(sc.wl, sc.a).total)} GB</small></div><div className="r"><FitCell g={g} sc={sc} /></div>
              <A className="link" style={{ fontSize: 13.5 }} to="/advisor/2" onClick={() => preset(sc.wl, sc.a)}>{tr('Adjust', '调整')} <Ico id="i-arrow" /></A></div>
          ))}</div></div></section>
        {perf.length > 0 && <section className="dsec" id="d-perf"><div className="dgrid"><div><h2>{tr('Performance', '性能')}</h2><p className="pm-lede">{tr('Our tests on GPU Mart servers and published results. Rank is among the GPUs in the same test.', '我们在 GPU Mart 服务器上的实测和公开测试结果。排名是在同一测试的 GPU 中的位置。')}</p></div>
          <div className="pm-grid">{perf.map((m, i) => (
            <div className="panel pm" key={i}><div className="pm-top"><span>{L(m.t)}</span><St t={m.kind} /></div>
              <div className="pm-v"><b>{m.v.toLocaleString('en-US')}</b>{m.unit && <small>{m.unit}</small>}</div>
              <div className="pm-bar"><i style={{ width: Math.max(3, m.v / m.max * 100) + '%' }} className={m.r[0] === 1 ? 'top' : ''} /></div>
              <div className="pm-foot"><span>{m.r[0] <= 3 ? L(ORD[m.r[0]]) : '#' + m.r[0]}{tr(` of ${m.r[1]}`, ` / 共 ${m.r[1]}`)}</span>
                {m.tab ? <A className="link" to={'/benchmarks' + (m.tab === 'vllm' ? '' : '?t=' + m.tab)}>{m.src} <Ico id="i-arrow" /></A> : <a className="link" href={m.url} target="_blank" rel="noopener">{m.src} ↗</a>}</div></div>
          ))}</div></div></section>}
        <section className="dsec" id="d-alt"><div className="dgrid"><div><h2>{tr('Alternatives', '替代型号')}</h2></div>
          <div className="alts">{alts.map((a) => (
            <div className="panel alt" key={a.id}><A className="ph" to={'/gpu/' + a.id} tabIndex={-1} aria-hidden="true"><img src={img(a.img)} alt="" /></A>
              <div><h3><A to={'/gpu/' + a.id}>{a.name}</A></h3><p className="mono" style={{ fontSize: 12.5 }}>{a.vtot} GB {a.mem} · {fmt(a.bw)} GB/s · {a.tdp} W</p>
                <div className="row"><A className="link" to={'/gpu/' + a.id}>{tr('Details', '详情')} <Ico id="i-arrow" /></A></div></div></div>
          ))}</div></div></section>
      </div>
    </>
  );
}
