import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../i18n.jsx';
import { useStore } from '../store.js';
import { app } from '../state.js';
import { GPUS, fmt } from '../data/gpus.js';
import { WL, WL_ORDER } from '../data/workloads.js';
import { Ico, A, Ctog, img } from '../ui.jsx';

const b = (en, zh) => ({ en, zh });
const MEMB = [['2-8', b('2–8 GB', '2–8 GB'), (g) => g.vtot <= 8], ['12-24', b('12–24 GB', '12–24 GB'), (g) => g.vtot > 8 && g.vtot <= 24], ['32-48', b('32–48 GB', '32–48 GB'), (g) => g.vtot > 24 && g.vtot <= 48], ['80', b('80 GB +', '80 GB 以上'), (g) => g.vtot >= 80]];
const FEAT = [['tensor', b('Tensor cores', 'Tensor 核心'), (g) => g.tensor > 0], ['rt', b('RT cores', 'RT 核心'), (g) => g.rt > 0], ['ecc', b('ECC memory', 'ECC 显存'), (g) => g.ecc], ['fp64', b('High FP64', '高 FP64'), (g) => g.fp64 >= 2], ['nvlink', b('NVLink', 'NVLink'), (g) => g.nvlink], ['mig', b('MIG partitioning', 'MIG 切分'), (g) => g.mig], ['passive', b('Passive (server)', '被动散热（服务器）'), (g) => g.cool === 'Passive']];
const SER = [['Entry', b('Entry', '入门')], ['GeForce', b('GeForce', 'GeForce')], ['Professional', b('Professional', '专业')], ['Data Center', b('Data Center', '数据中心')]];
const ARCH = ['Kepler', 'Pascal', 'Volta', 'Turing', 'Ampere', 'Ada Lovelace', 'Hopper', 'Blackwell'];
const GROUPS = [
  ['series', b('Series', '系列'), SER.map(([v, l]) => [v, l, (g) => g.series === v])],
  ['mem', b('Memory', '显存'), MEMB],
  ['use', b('Workload', '工作负载'), WL_ORDER.map((k) => [k, WL[k].name, (g) => g.use.includes(k)])],
  ['arch', b('Architecture', '架构'), ARCH.map((v) => [v, v, (g) => g.arch === v])],
  ['feat', b('Features', '功能'), FEAT],
];

export default function Explorer() {
  const { tr, L } = useLang();
  const [sp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const [F, setF] = useState(() => Object.fromEntries(GROUPS.map(([k]) => [k, new Set()])));
  const [sort, setSort] = useState('vram');
  const [layout, setLayout] = useState('grid');
  const [open, setOpen] = useState(false);
  const sel = useStore(app, (s) => s.sel);
  useEffect(() => { setQ(sp.get('q') || ''); }, [sp]);
  useEffect(() => { document.title = tr('GPU Explorer', 'GPU 列表') + ' · DBM GPU Lab'; });

  const passes = (g, skip) => {
    const qq = q.trim().toLowerCase();
    if (qq && !(g.name + ' ' + g.full + ' ' + g.arch + ' ' + g.series + ' ' + g.mem + ' ' + g.vtot + 'gb').toLowerCase().includes(qq)) return false;
    return GROUPS.every(([k, , opts]) => k === skip || !F[k].size || (k === 'feat' ? [...F[k]].every((v) => opts.find((o) => o[0] === v)[2](g)) : [...F[k]].some((v) => opts.find((o) => o[0] === v)[2](g))));
  };
  const toggle = (k, v) => setF((f) => { const s = new Set(f[k]); s.has(v) ? s.delete(v) : s.add(v); return { ...f, [k]: s }; });
  const reset = () => { setF(Object.fromEntries(GROUPS.map(([k]) => [k, new Set()]))); setQ(''); };
  const list = useMemo(() => GPUS.filter((g) => passes(g)).sort({ name: (a, c) => a.name.localeCompare(c.name), bw: (a, c) => c.bw - a.bw, tdp: (a, c) => a.tdp - c.tdp || c.vram - a.vram, vram: (a, c) => c.vtot - a.vtot || c.bw - a.bw }[sort]), [q, F, sort]);
  const label = (k, v) => { const o = GROUPS.find((x) => x[0] === k)[2].find((x) => x[0] === v); return L(o[1]); };

  return (
    <>
      <div className="page-head"><div className="wrap"><div className="crumb"><A to="/">{tr('Home', '首页')}</A> / {tr('GPU Explorer', 'GPU 列表')}</div><h1>{tr('Explore GPUs', '浏览 GPU')}</h1></div></div>
      <div className="wrap ex">
        <aside className={'filters' + (open ? ' open' : '')} id="filters" aria-label={tr('Filters', '筛选')}>
          <div className="fhead"><h3>{tr('Filters', '筛选')}</h3><button className="link" style={{ fontSize: 13 }} onClick={reset}>{tr('Reset', '重置')}</button></div>
          {GROUPS.map(([k, t, opts]) => (
            <div className="fgroup" key={k}><h4>{L(t)}</h4>{opts.map(([v, l, fn]) => { const c = GPUS.filter((g) => passes(g, k) && fn(g)).length; return (
              <label className={'fopt' + (c ? '' : ' zero')} key={v}><input type="checkbox" checked={F[k].has(v)} onChange={() => toggle(k, v)} />{L(l)}<span className="n">{c}</span></label>
            ); })}</div>
          ))}
        </aside>
        <div>
          <div className="toolbar">
            <label className="qbox"><Ico id="i-search" /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('Search by name, architecture or memory type', '按名称、架构或显存类型搜索')} aria-label={tr('Search GPUs', '搜索 GPU')} autoComplete="off" /></label>
            <button className="btn btn-line fbtn" aria-expanded={open} aria-controls="filters" onClick={() => setOpen(!open)}><Ico id="i-filter" />{tr('Filters', '筛选')}</button>
            <select className="sel" value={sort} onChange={(e) => setSort(e.target.value)} aria-label={tr('Sort', '排序')}>
              <option value="vram">{tr('Memory: high to low', '显存：从高到低')}</option><option value="bw">{tr('Bandwidth: high to low', '带宽：从高到低')}</option><option value="tdp">{tr('Power: low to high', '功耗：从低到高')}</option><option value="name">{tr('Name A–Z', '名称 A–Z')}</option>
            </select>
            <div className="seg" role="group" aria-label={tr('Layout', '布局')}>
              <button aria-pressed={layout === 'grid'} onClick={() => setLayout('grid')} aria-label={tr('Grid view', '网格')}><Ico id="i-grid" /></button>
              <button aria-pressed={layout === 'list'} onClick={() => setLayout('list')} aria-label={tr('List view', '列表')}><Ico id="i-list" /></button>
            </div>
          </div>
          <div className="resline"><span className="res" aria-live="polite">{tr(`${list.length} of ${GPUS.length} GPUs`, `${GPUS.length} 张中的 ${list.length} 张`)}</span>
            <div className="active-f">{GROUPS.flatMap(([k]) => [...F[k]].map((v) => <button key={k + v} className="fchip" onClick={() => toggle(k, v)} aria-label={tr('Remove filter ', '移除筛选 ') + label(k, v)}>{label(k, v)}<Ico id="i-x" /></button>))}</div></div>
          <div className={'ex-grid' + (layout === 'list' ? ' ex-list' : '')}>
            {list.length ? list.map((g) => (
              <article className={'gcard' + (sel.includes(g.id) ? ' sel-on' : '')} key={g.id}>
                <A className="ph" to={'/gpu/' + g.id} tabIndex={-1} aria-hidden="true"><img src={img(g.img)} alt="" loading="lazy" /></A>
                <div className="bd">
                  <div className="top"><div><h3><A to={'/gpu/' + g.id}>{g.name}</A></h3><div className="series">{L(g.seriesI)} · {g.arch}</div></div><div className="vr">{g.vtot} GB<small>{g.dual ? '2 × 12 GB ' : ''}{g.mem}</small></div></div>
                  <div className="kv"><div><span>{tr('Bandwidth GB/s', '带宽 GB/s')}</span><b>{fmt(g.bw)}</b></div><div><span>{tr('Power W', '功耗 W')}</span><b>{g.tdp}</b></div><div><span>{g.fp64 >= 2 ? 'FP64' : 'FP32'} TFLOPS</span><b>{g.fp64 >= 2 ? g.fp64 : (g.fp32 ?? 'n/p')}</b></div></div>
                  <div className="foot"><span className="avail"><Ico id="i-clock" />{tr('Check availability', '查询库存')}</span><Ctog id={g.id} /></div>
                </div>
              </article>
            )) : <div className="empty"><b>{tr('No GPUs match these filters', '没有符合条件的 GPU')}</b>{tr('Counts beside each option show what remains.', '每个选项旁的数字是剩余数量。')}<br /><button className="btn btn-line" onClick={reset}>{tr('Reset filters', '重置筛选')}</button></div>}
          </div>
        </div>
      </div>
    </>
  );
}
