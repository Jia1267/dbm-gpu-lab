import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useLang } from '../i18n.jsx';
import { useStore } from '../store.js';
import { app, setS, setAns } from '../state.js';
import { fmt, f1 } from '../data/gpus.js';
import { WL, WL_ORDER, MIG, need, recommend, reasonsFor } from '../data/workloads.js';
import { SPEC, shortTerm } from '../data/scenarios2.js';
import { WL_GUIDE } from '../data/scenarios.js';
import { Ico, A, St, img } from '../ui.jsx';
import Select from '../Select.jsx';

export default function Advisor() {
  const { step: st } = useParams();
  const step = Math.min(4, Math.max(1, +st || 1));
  const { tr, L } = useLang();
  const S = useStore(app, (s) => s.S);
  const w = WL[S.wl], a = S.a[S.wl], n = need(S.wl, a);
  const last = useRef(0);
  useEffect(() => { document.title = tr('GPU Advisor', '选卡向导') + ' · DBM GPU Lab'; last.current = step; });
  const anim = step !== last.current ? 'step-in' : '';

  const steps = [tr('Workload', '工作负载'), tr('Requirements', '需求'), tr('Priorities', '优先级'), tr('Recommendation', '推荐')];
  const optLabel = (f, v) => L((f.opts.find((o) => String(o[0]) === String(v)) || ['', ''])[1]).replace(/ \(.*\)|（.*）/, '');
  const val = (f) => (a[f.k] === '?' ? tr('Not sure → ', '不确定 → ') + optLabel(f, f.ns) : optLabel(f, a[f.k]));
  const og = (k, v, t, s) => <button key={v} className="opt" role="radio" aria-checked={S[k] === v} onClick={() => setS({ [k]: v })}><span><b>{t}</b><span>{s}</span></span><span className="rd" /></button>;

  let main;
  if (step === 1) {
    main = <><span className="eyebrow">{tr('Step 1 of 4', '第 1 步，共 4 步')}</span><h1>{tr('What are you building?', '你要做什么？')}</h1>
      <div className="opts" role="radiogroup" aria-label={tr('Workload', '工作负载')}>{WL_ORDER.map((k) => (
        <button key={k} className="opt" role="radio" aria-checked={S.wl === k} onClick={() => setS({ wl: k })}><span className="ph"><img src={img(WL[k].img)} alt="" /></span><span><b>{L(WL[k].name)}</b><span>{L(WL[k].q)}</span></span><span className="rd" /></button>
      ))}</div>
      <div className="adv-nav"><A className="btn btn-primary" to="/advisor/2">{tr('Continue', '继续')} <Ico id="i-arrow" /></A></div></>;
  }
  if (step === 2) {
    const T = n.total, scale = Math.max(T * 1.12, 90), cols = ['#141E28', '#245AE8', '#8794A1', '#C3CBD3'];
    main = <><span className="eyebrow">{tr('Step 2 of 4', '第 2 步，共 4 步')} · {L(w.name)}</span><h1>{tr('Define the workload.', '描述你的工作。')}</h1>
      <div className="fields">{w.fields.map((f) => (
        <div className="field" key={f.k}><label htmlFor={'f-' + f.k}>{L(f.label)}</label>
          <Select id={'f-' + f.k} label={L(f.label)} value={a[f.k]} onChange={(v) => setAns(S.wl, { [f.k]: f.opts.find((o) => String(o[0]) === String(v))[0] })} options={f.opts.map(([v, t]) => [v, L(t)])} /></div>
      ))}</div>
      <div className="panel estimate" aria-live="polite">
        <div className="hd"><div><span className="eyebrow">{tr('Estimated memory target', '估算显存需求')}</span><div className="tot">{f1(T)}<small>GB</small></div></div><St t="est" /></div>
        <div className="stack" role="img" aria-label={n.parts.map((pp) => L(pp[0]) + ' ' + f1(pp[1]) + ' GB').join(', ')}>{n.parts.map((pp, i) => <i key={i} style={{ width: pp[1] / scale * 100 + '%', background: cols[i] }} />)}</div>
        <div className="stack-scale">{[24, 32, 48, 80].filter((v) => v < scale).map((v) => <span key={v} className="mk" style={{ left: v / scale * 100 + '%' }}>{v} GB</span>)}</div>
        <div className="parts">{n.parts.map((pp, i) => <span key={i}><span className="sw" style={{ background: cols[i] }} />{L(pp[0])} <b>{f1(pp[1])} GB</b></span>)}</div>
        <details className="basis-d"><summary>{tr("How it's calculated", '计算方法')}</summary><p className="basis">{L(n.basis)}</p></details>
      </div>
      <div className="adv-nav"><A className="btn btn-line" to="/advisor/1"><Ico id="i-back" />{tr('Back', '上一步')}</A><A className="btn btn-primary" to="/advisor/3">{tr('Continue', '继续')} <Ico id="i-arrow" /></A></div></>;
  }
  if (step === 3) {
    main = <><span className="eyebrow">{tr('Step 3 of 4', '第 3 步，共 4 步')}</span><h1>{tr('Set your priorities.', '设定优先级。')}</h1>
      <span className="qlabel">{tr('Priority', '优先级')}</span>
      <div className="opts" style={{ marginTop: 0, gridTemplateColumns: 'repeat(3,1fr)' }} role="radiogroup" aria-label={tr('Priority', '优先级')}>
        {og('pri', 'cost', tr('Lowest cost', '最低成本'), tr('Smallest product class that fits', '装得下的最低一档'))}{og('pri', 'bal', tr('Balanced', '均衡'), tr('Fits with at least 15% headroom', '至少留 15% 余量'))}{og('pri', 'head', tr('Most headroom', '最大余量'), tr('Largest memory pool', '显存最大'))}</div>
      <span className="qlabel">{tr('GPU count', 'GPU 数量')}</span>
      <div className="opts" style={{ marginTop: 0 }} role="radiogroup" aria-label={tr('GPU count', 'GPU 数量')}>{og('multi', 'no', tr('Single GPU', '单卡'), tr('Simplest to deploy and run', '部署和运维最简单'))}{og('multi', 'yes', tr('Multi-GPU is fine', '可以多卡'), tr('Split across up to 8 GPUs', '最多分到 8 张卡'))}</div>
      <span className="qlabel">{tr('Requirements', '硬性要求')}</span>
      <label className="fopt" style={{ fontSize: 15 }}><input type="checkbox" checked={S.ecc} onChange={(e) => setS({ ecc: e.target.checked })} />{tr('ECC memory required (production, 24/7)', '必须有 ECC 显存（生产环境，7×24）')}</label>
      <label className="fopt" style={{ fontSize: 15 }}><input type="checkbox" checked={S.mig} onChange={(e) => setS({ mig: e.target.checked })} />{tr('Split into isolated slices for several users (MIG)', '切成互相隔离的几份给多人用（MIG）')}</label>
      <p style={{ fontSize: 13.5, color: 'var(--steel)', margin: '4px 0 0 28px', maxWidth: '60ch' }}>{tr('Sharing one GPU across virtual machines instead? That is vGPU. ', '要让多台虚拟机共用一张卡？那是 vGPU。')}<A className="link" to="/scenarios/vgpu">{tr('GPU virtualization guide', 'GPU 虚拟化方案')}</A></p>
      <div className="adv-nav"><A className="btn btn-line" to="/advisor/2"><Ico id="i-back" />{tr('Back', '上一步')}</A><A className="btn btn-primary" to="/advisor/4">{tr('See recommendation', '查看推荐')} <Ico id="i-arrow" /></A></div></>;
  }
  if (step === 4) {
    const { fit } = recommend(S);
    if (!S.set) {
      main = <><span className="eyebrow">{tr('Step 4 of 4', '第 4 步，共 4 步')}</span><h1>{tr('Answer the questions first.', '先回答前面的问题。')}</h1><p className="lede">{tr('The recommendation depends on what you want to run.', '推荐取决于你要跑什么。')}</p>
        <div className="adv-nav"><A className="btn btn-primary" to="/advisor/1">{tr('Start', '开始')} <Ico id="i-arrow" /></A></div></>;
    } else if (!fit.length) {
      main = <><span className="eyebrow">{tr('Step 4 of 4', '第 4 步，共 4 步')}</span><h1>{tr('Nothing fits on a single GPU.', '单张卡装不下。')}</h1><p className="lede">{tr(`The estimate is ${f1(n.total)} GB. Ways forward:`, `估算 ${f1(n.total)} GB。可以这样调整：`)}</p>
        <div className="panel" style={{ padding: '4px 24px', marginTop: 24 }}>
          <div className="fitrow"><div className="w">{tr('Allow multi-GPU', '允许多卡')}<small>{tr('Split the model across several cards', '把模型分到几张卡上')}</small></div><span /><button className="btn btn-primary btn-sm" onClick={() => setS({ multi: 'yes' })}>{tr('Allow', '允许')}</button></div>
          {S.wl === 'llm' && a.prec !== 'int4' && <div className="fitrow"><div className="w">{tr('Use INT4 weights', '改用 INT4 权重')}<small>{tr('About a quarter of FP16 weight memory', '约为 FP16 权重的四分之一')}</small></div><span /><button className="btn btn-line btn-sm" onClick={() => setAns('llm', { prec: 'int4' })}>{tr('Switch to INT4', '切换到 INT4')}</button></div>}
          <div className="fitrow"><div className="w">{tr('Adjust requirements', '调整需求')}<small>{tr('Smaller model, shorter context or fewer users', '更小的模型、更短的上下文或更少用户')}</small></div><span /><A className="btn btn-line btn-sm" to="/advisor/2">{tr('Adjust', '调整')}</A></div>
        </div></>;
    } else {
      const top = fit[0], { R, L: Lim } = reasonsFor(top, n, S), plan = SPEC[top.g.id], guide = WL_GUIDE[S.wl];
      main = <><span className="eyebrow">{tr('Step 4 of 4 · Recommendation', '第 4 步 · 推荐')}</span><h1>{top.count > 1 ? top.count + ' × ' : ''}{top.g.name}</h1><p className="lede">{tr('For ', '用于 ')}{n.label}.</p>
        <div className="panel pick-card"><div className="ph"><img src={img(top.g.img)} alt="" /></div><div className="bd">
          <span className="eyebrow">{L(top.g.seriesI)} · {top.g.arch}</span><h2>{top.g.vram} GB {top.g.mem}{top.count > 1 && <span className="note mono"> × {top.count} = {top.cap} GB</span>}</h2>
          <div className="headroom"><div className="stack" style={{ margin: '8px 0 6px' }} role="img" aria-label={`${f1(n.total)} / ${top.cap} GB`}><i style={{ width: Math.min(100, n.total / top.cap * 100) + '%', background: 'var(--graphite)' }} /></div>
            <div className="parts"><span>{tr('Estimate', '估算')} <b>{f1(n.total)} GB</b></span><span>{tr('Capacity', '容量')} <b>{top.cap} GB</b></span><span>{tr('Headroom', '余量')} <b>{f1(top.head)} GB</b></span></div></div>
          <ul className="reasons">{R.map((r, i) => <li key={'r' + i}><span className="ok"><Ico id="i-ok" /></span><span>{L(r)}</span></li>)}{Lim.map((r, i) => <li key={'l' + i} className="lim"><span style={{ color: 'var(--amber)', display: 'inline-flex' }}><Ico id="i-warn" /></span><span>{L(r)}</span></li>)}</ul>
          <div className="evi"><St t="ds" /><span className="note">{tr('specs', '规格')}</span><St t="est" /><span className="note">{tr('memory fit', '显存匹配')}</span><St t="nt" /><span className="note">{tr('throughput', '吞吐量')}</span></div>
          {S.wl === 'llm' && a.prec !== 'int4' && (() => { const n4 = need('llm', { ...a, prec: 'int4' }); return <p className="plan-line note">{tr(`At 4-bit the estimate drops to ${f1(n4.total)} GB, which opens smaller, cheaper cards. `, `改用 4-bit，估算降到 ${f1(n4.total)} GB，可以选更小、更便宜的卡。`)}<button className="link" style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }} onClick={() => setAns('llm', { prec: 'int4' })}>{tr('Switch to 4-bit', '切换到 4-bit')}</button></p>; })()}
          {plan ? <p className="plan-line"><b>{tr(`GPU Mart ${L(plan[0])} from $${plan[1]}/mo`, `GPU Mart ${L(plan[0])}，$${plan[1]}/月起`)}</b>{top.count > 1 && tr(` per GPU · ${top.count} needed`, `（每张卡，需要 ${top.count} 张）`)}<br /><span className="note">{L(shortTerm(top.g.id))} · {L(plan[2])} · {tr('list price, Nov 2026', '2026 年 11 月标价')}</span></p>
            : <p className="plan-line note">{tr('No public plan price for this GPU. Ask GPU Mart sales for availability.', '这张卡没有公开套餐价格，请向 GPU Mart 销售询问。')}</p>}
          <div className="adv-nav" style={{ marginTop: 22 }}>{guide && <A className="btn btn-primary" to={'/scenarios/' + guide + '#pick'}>{tr('See plans and prices', '看套餐和价格')} <Ico id="i-arrow" /></A>}<A className={'btn ' + (guide ? 'btn-line' : 'btn-primary')} to={'/gpu/' + top.g.id}>{tr('View this GPU', '查看这张卡')}</A></div>
        </div></div>
        {fit.length > 1 && <><h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 40 }}>{tr('Also fits', '也装得下')}</h2><div>{fit.slice(1, 5).map((x) => (
          <div className="altrow" key={x.g.id}><span className="nm"><span className="sw" style={{ background: '#5C6B79' }} />{x.count > 1 ? x.count + ' × ' : ''}{x.g.name}</span><span className="why"><span className="mono">{x.g.vram} GB · {fmt(x.g.bw)} GB/s · {x.g.tdp} W</span></span><span className="r">{tr(`${f1(x.head)} GB spare`, `余 ${f1(x.head)} GB`)}</span><A className="link" to={'/gpu/' + x.g.id}>{tr('View', '查看')}</A></div>
        ))}</div></>}
        <div className="adv-nav"><A className="btn btn-line" to="/advisor/3"><Ico id="i-back" />{tr('Adjust priorities', '调整优先级')}</A><A className="link" to="/advisor/1">{tr('Start over', '重新开始')}</A></div></>;
    }
  }
  const side = (
    <aside className="panel side" aria-label={tr('Your configuration', '你的配置')}><span className="eyebrow">{tr('Your configuration', '你的配置')}</span><h3>{L(w.name)}</h3>
      <dl>{step >= 2 && w.fields.map((f) => <div key={f.k} style={{ display: 'contents' }}><dt className="q">{L(f.label)}</dt><dd className="q">{val(f)}</dd></div>)}
        <dt>{tr('Memory target', '显存需求')}</dt><dd>{f1(n.total)} GB</dd>
        {step >= 3 && <><dt>{tr('Priority', '优先级')}</dt><dd>{{ cost: tr('Lowest cost', '最低成本'), bal: tr('Balanced', '均衡'), head: tr('Most headroom', '最大余量') }[S.pri]}</dd><dt>GPUs</dt><dd>{S.multi === 'yes' ? tr('Multi OK', '可多卡') : tr('Single', '单卡')}</dd>{S.ecc && <><dt>ECC</dt><dd>{tr('Required', '必须')}</dd></>}{S.mig && <><dt>MIG</dt><dd>{tr('Required', '必须')}</dd></>}</>}</dl>
    </aside>
  );
  return (
    <div className="wrap adv"><div className={anim} key={step}>
      <nav className="steps" aria-label={tr('Advisor steps', '向导步骤')}>{steps.map((t, i) => <A key={i} className={`step ${i + 1 < step ? 'done' : ''} ${i + 1 === step ? 'cur' : ''}`} to={'/advisor/' + (i + 1)} aria-current={i + 1 === step ? 'step' : undefined}>0{i + 1} {t}</A>)}</nav>
      {main}</div>{side}</div>
  );
}
