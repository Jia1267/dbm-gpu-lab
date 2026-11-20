import { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useLang } from '../i18n.jsx';
import { useStore } from '../store.js';
import { app, preset } from '../state.js';
import { GPUS, G, fmt, f1 } from '../data/gpus.js';
import { WL, WL_ORDER, SCEN, need, fitOf } from '../data/workloads.js';
import { Ico, A, Ctog, St, img } from '../ui.jsx';

export function FitCell({ g, sc }) {
  const { tr, L } = useLang();
  const r = fitOf(g, sc);
  if (r.why) return <><span className="no"><Ico id="i-warn" /></span><span style={{ fontFamily: 'var(--sans)' }}>{L(r.why)}</span></>;
  return r.spare != null ? <><span className="ok"><Ico id="i-ok" /></span>{tr(`${f1(r.spare)} GB spare`, `余 ${f1(r.spare)} GB`)}</> : <><span className="no"><Ico id="i-warn" /></span>{tr(`needs ${r.gpus} GPUs`, `需要 ${r.gpus} 张卡`)}</>;
}

export default function Detail() {
  const { id } = useParams();
  const { tr, L, p } = useLang();
  const nav = useNavigate();
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
  const yn = (v) => (v === true ? tr('Yes', '有') : v === false ? tr('No', '无') : tr('Not listed', '未列出'));
  const rows = [[tr('Architecture', '架构'), g.arch], [tr('GPU memory', '显存'), g.memL + (g.ecc ? ' · ECC' : '')], [tr('Memory interface', '显存位宽'), `${fmt(g.bus)}-bit${g.dual ? tr(' per GPU', '（每颗 GPU）') : ''}`], [tr('Memory bandwidth', '显存带宽'), `${fmt(g.bw)} GB/s`], [tr('CUDA cores', 'CUDA 核心'), fmt(g.cuda)], [tr('Tensor cores', 'Tensor 核心'), g.tensor ? fmt(g.tensor) : '—'], [tr('RT cores', 'RT 核心'), g.rt ? fmt(g.rt) : '—'],
    [tr('FP32 peak', 'FP32 峰值'), g.fp32 != null ? `${g.fp32} TFLOPS` : tr('Not published', '未公布')], [tr('FP64 peak', 'FP64 峰值'), g.fp64 != null ? `${g.fp64} TFLOPS` : tr('Low (consumer / workstation ratio)', '低（消费级 / 工作站比例）')], [tr('Max power', '最大功耗'), `${g.tdp} W`], [tr('Interface', '接口'), g.pcie], [tr('Form factor', '外形'), g.slots], [tr('Cooling', '散热'), g.cool], [tr('NVENC encoder', 'NVENC 编码器'), yn(g.nvenc)], ['NVLink', yn(g.nvlink)], ['MIG', yn(g.mig)]];
  const off = g.img.startsWith('official/');
  const go = (e, sid) => { e.preventDefault(); document.getElementById(sid)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
  const subs = [['d-specs', tr('Specifications', '规格')], ['d-use', tr('Use cases', '适用场景')], ['d-fit', tr('Workload fit', '工作负载匹配')], ['d-perf', tr('Performance', '性能')], ['d-alt', tr('Alternatives', '替代型号')]];

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
          <div className="dctas"><a className="btn btn-primary" href="https://www.gpu-mart.com/" target="_blank" rel="noopener"><Ico id="i-clock" />{tr('Check DBM availability', '查询 DBM 库存')}</a><Ctog id={g.id} big /></div>
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
        <section className="dsec" id="d-perf"><div className="dgrid"><div><h2>{tr('Performance', '性能')}</h2><div style={{ marginTop: 12 }}><St t="nt" /></div></div>
          <div className="panel evid"><div><h3>{tr('Not tested yet', '尚未测试')}</h3><A to="/benchmarks" className="link" style={{ marginTop: 12 }}>{tr('How we test', '测试方法')} <Ico id="i-arrow" /></A></div>
            <div className="metrics">{[[tr('Throughput', '吞吐量'), 'tok/s'], [tr('Time to first token', '首 token 延迟'), 'ms'], [tr('Peak memory', '显存峰值'), 'GB'], [tr('Power', '功耗'), 'W']].map((m) => <div className="metric" key={m[0]}><span>{m[0]}</span><b>—</b><small>{m[1]}</small></div>)}</div></div></div></section>
        <section className="dsec" id="d-alt"><div className="dgrid"><div><h2>{tr('Alternatives', '替代型号')}</h2></div>
          <div className="alts">{alts.map((a) => (
            <div className="panel alt" key={a.id}><A className="ph" to={'/gpu/' + a.id} tabIndex={-1} aria-hidden="true"><img src={img(a.img)} alt="" /></A>
              <div><h3><A to={'/gpu/' + a.id}>{a.name}</A></h3><p className="mono" style={{ fontSize: 12.5 }}>{a.vtot} GB {a.mem} · {fmt(a.bw)} GB/s · {a.tdp} W</p>
                <div className="row"><button className="link" onClick={() => { app.set({ sel: [g.id, a.id] }); nav(p('/compare/' + g.id + ',' + a.id)); }}>{tr(`Compare with ${g.name}`, `和 ${g.name} 对比`)} <Ico id="i-arrow" /></button></div></div></div>
          ))}</div></div></section>
      </div>
    </>
  );
}
