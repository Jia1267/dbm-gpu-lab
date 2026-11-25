import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n.jsx';
import { useStore } from '../store.js';
import { app, setS, setAns, preset } from '../state.js';
import { GPUS, G, fmt, f1 } from '../data/gpus.js';
import { WL, WL_ORDER, LLM, recommend } from '../data/workloads.js';
import { SCENARIOS, WL_GUIDE } from '../data/scenarios.js';
import { Ico, A, St, img } from '../ui.jsx';
import Select from '../Select.jsx';

/* Start loading the 3D hero as soon as this page's code loads */
const hero3d = typeof window === 'undefined' ? Promise.reject() : import('../hero3d.js');

/* Hero visual: the 3D exploded-view card; the photo only shows if WebGL is unavailable */
function HeroGpu() {
  const { tr, lang } = useLang();
  const host = useRef(null);
  const api = useRef(null);
  const [mode, setMode] = useState('load'); // load → 3d, or photo if WebGL is unavailable
  const ready = mode === '3d';
  const [open, setOpen] = useState(false);
  const touch = typeof matchMedia !== 'undefined' && matchMedia('(hover: none)').matches;
  useEffect(() => {
    let dead = false;
    const labels = [[tr('Backplate', '背板'), tr('Anodized aluminium', '阳极氧化铝')], ['PCB', 'GB202 · PCIe 5.0 ×16'], [tr('Vapor chamber', '均热板'), tr('Copper', '纯铜')],
      [tr('Heat pipes', '热管'), '5 × 8 mm'], [tr('Fin stack', '散热鳍片'), tr('64 fins', '64 片')], [tr('Shroud', '外壳'), tr('Dual-slot · 304 mm', '双槽 · 304 mm')], null];
    hero3d.then((m) => {
      if (dead || !host.current) return;
      api.current = m.mount(host.current.querySelector('.stage'), document.getElementById('hero'), labels);
      setMode('3d');
    }).catch(() => !dead && setMode('photo'));
    return () => { dead = true; api.current?.destroy(); api.current = null; setOpen(false); };
  }, [lang]);
  const toggle = () => { const v = !open; setOpen(v); api.current?.pin(v); };
  return (
    <div className="hero-visual" ref={host}>
      {/* the photo stands in while the 3D view loads (or for good if WebGL is unavailable) */}
      {mode !== '3d' && <img src={img('hero')} alt={tr('Workstation GPU with machined aluminium fin stack and copper heat pipes', '带铝制散热鳍片和铜热管的工作站显卡')} width="1600" height="1088" />}
      <div className={'stage' + (ready ? ' on' : '')} aria-hidden="true" />
      {ready && <button type="button" className="hx-btn" aria-pressed={open} onClick={toggle}>
        <span className="dot" />{open ? tr('Put it back together', '合上') : touch ? tr('Tap to look inside', '点一下看内部') : tr('Move closer to look inside', '鼠标靠近，看看内部')}</button>}
    </div>
  );
}

export default function Home() {
  const { tr, L } = useLang();
  useEffect(() => { document.title = 'DBM GPU Lab'; });
  return (
    <>
      <section className="hero" id="hero" aria-labelledby="hero-h">
        <div className="wrap">
          <div className="hero-copy">
            <h1 id="hero-h">{tr('The right GPU for every AI workload.', '每种 AI 工作，都有对的 GPU。')}</h1>
            <p className="lede">{tr('See which GPU fits your workload.', '看看哪张 GPU 适合你的工作。')}</p>
            <div className="hero-ctas">
              <A to="/advisor/1" className="btn btn-primary">{tr('Find my GPU', '帮我选卡')} <Ico id="i-arrow" /></A>
              <A to="/gpus" className="btn btn-dark-line">{tr('Explore GPUs', '浏览 GPU')}</A>
            </div>
          </div>
        </div>
        <HeroGpu />
        <div className="readout" aria-label="RTX 5090">
          <div><span className="k">{tr('Model', '型号')}</span><span className="v">RTX 5090</span></div>
          <div><span className="k">{tr('Memory', '显存')}</span><span className="v">32 GB GDDR7</span></div>
          <div><span className="k">{tr('Bandwidth', '带宽')}</span><span className="v">1,792 GB/s</span></div>
          <div><span className="k">{tr('Board power', '功耗')}</span><span className="v">575 W</span></div>
        </div>
      </section>

      <Quick />

      <section className="block" aria-labelledby="sc-h">
        <div className="wrap">
          <div className="sec-head"><div><h2 id="sc-h">{tr('Scenario guides', '场景方案')}</h2></div><A to="/scenarios" className="link">{tr('All scenarios', '全部场景')} <Ico id="i-arrow" /></A></div>
          <div className="sc-idx">{SCENARIOS.slice(0, 3).map((s) => (
            <A key={s.id} to={'/scenarios/' + s.id} className="panel"><div className="ph"><img src={img(s.img)} alt="" loading="lazy" /></div>
              <div className="bd"><h3>{L(s.name)} <Ico id="i-arrow" /></h3><p>{L(s.tagline)}</p></div></A>
          ))}</div>
        </div>
      </section>

      <section className="block" id="workloads" aria-labelledby="wl-h" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head"><div><h2 id="wl-h">{tr('Start from what you want to run.', '从你要跑的东西开始。')}</h2></div></div>
          <div className="wl-grid">
            {WL_ORDER.map((k) => { const w = WL[k]; return (
              <A key={k} className="wl" to={WL_GUIDE[k] ? '/scenarios/' + WL_GUIDE[k] : '/advisor/2'} onClick={() => preset(k)}><div className="ph"><img src={img(w.img)} alt="" loading="lazy" width="1024" height="576" /></div><h3>{L(w.name)} <Ico id="i-arrow" /></h3><div className="wl-stack">{w.stack}</div></A>
            ); })}
            <A className="wl cta" to="/advisor/1"><span className="eyebrow">{tr('Not sure?', '不确定？')}</span><h3>{tr('Answer four questions', '回答四个问题')} <Ico id="i-arrow" /></h3></A>
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="hw-h">
        <div className="wrap" style={{ paddingTop: 88, paddingBottom: 64 }}>
          <div className="sec-head"><div><h2 id="hw-h">{tr('Explore the hardware.', '看看硬件。')}</h2></div><A to="/gpus" className="link">{tr(`All ${GPUS.length} GPUs`, `全部 ${GPUS.length} 张 GPU`)} <Ico id="i-arrow" /></A></div>
          <div className="strip">{['rtx-5090', 'rtx-pro-6000', 'a100-80', 'h100-pcie'].map((id) => { const g = G(id); return (
            <article className="scol" key={id}><A className="ph" to={'/gpu/' + id} tabIndex={-1} aria-hidden="true"><img src={img(g.img)} alt="" loading="lazy" width="1024" height="768" /></A>
              <div className="series">{L(g.seriesI)}</div><h3><A to={'/gpu/' + id}>{g.name}</A></h3>
              <div className="vram"><b>{g.vtot}</b><span>GB {g.mem}</span></div>
              <dl className="specs"><dt>{tr('Architecture', '架构')}</dt><dd>{g.arch}</dd><dt>{tr('Bandwidth', '带宽')}</dt><dd>{fmt(g.bw)} GB/s</dd><dt>{tr('Max power', '最大功耗')}</dt><dd>{g.tdp} W</dd></dl>
              <div className="acts"><A to={'/gpu/' + id} className="link" style={{ fontSize: 14 }}>{tr('Details', '详情')} <Ico id="i-arrow" /></A></div></article>
          ); })}</div>
          <p className="note" style={{ marginTop: 18 }}>{tr('Images: NVIDIA.', '图片：NVIDIA。')}</p>
        </div>
      </section>

      <Analysis />
    </>
  );
}

/* One-sentence quick advisor */
function Quick() {
  const { tr, L } = useLang();
  const S = useStore(app, (s) => s.S);
  const { n, fit } = recommend(S);
  const showM = S.wl === 'llm' || S.wl === 'train';
  const ref = useRef(null);
  useEffect(() => {
    const meas = document.createElement('span'); meas.style.cssText = 'position:absolute;visibility:hidden;white-space:pre'; document.body.appendChild(meas);
    ref.current?.querySelectorAll('select').forEach((s) => { const cs = getComputedStyle(s); meas.style.font = cs.font; meas.style.letterSpacing = cs.letterSpacing; meas.textContent = s.options[s.selectedIndex]?.text || ''; s.style.width = (meas.offsetWidth + 32) + 'px'; });
    meas.remove();
  });
  return (
    <section className="quick" aria-labelledby="q-h">
      <div className="wrap">
        <div><h2 id="q-h">{tr('What are you building?', '你要做什么？')}</h2></div>
        <div ref={ref}>
          <p className="sentence">{tr('I want to run ', '我想运行 ')}
            <Select variant="inline" label={tr('Workload', '工作负载')} value={S.wl} onChange={(v) => setS({ wl: v })} options={WL_ORDER.map((k) => [k, L(WL[k].name)])} />
            {showM && <>{tr(' on a ', '，用 ')}<Select variant="inline" label={tr('Model', '模型')} value={S.wl === 'llm' ? S.a.llm.model : S.a.train.size} onChange={(v) => (S.wl === 'llm' ? setAns('llm', { model: v }) : setAns('train', { size: +v }))}
              options={S.wl === 'llm' ? Object.entries(LLM).filter(([, m]) => !m.est).map(([v, m]) => [v, m.name]) : [8, 14, 32, 70].map((v) => [v, v + 'B'])} />{tr(' model', ' 模型')}</>}
            {tr(', optimizing for ', '，优先考虑 ')}
            <Select variant="inline" label={tr('Priority', '优先级')} value={S.pri} onChange={(v) => setS({ pri: v })} options={[['cost', tr('lowest cost', '最低成本')], ['bal', tr('balanced value', '均衡')], ['head', tr('most headroom', '最大余量')]]} />.
          </p>
          <div className="quick-out">
            <span className="need">{tr('Estimate', '估算')} <b>{f1(n.total)} GB</b> · {tr(`${fit.length} GPUs fit`, `${fit.length} 张卡装得下`)}<br /><span className="note">{tr('Assumes ', '假设 ')}{n.label}</span></span>
            <div className="chips">{fit.length ? <>{fit.slice(0, 3).map((x) => <span className="chip" key={x.g.id}>{x.g.name}<i>{x.g.vram} GB</i></span>)}{fit.length > 3 && <span className="chip more">+{fit.length - 3}</span>}</> : <span className="chip">{tr('Needs more than one GPU', '需要多张卡')}</span>}</div>
            <A to="/advisor/4" className="btn btn-primary" onClick={() => setS({})}>{tr('See recommendation', '查看推荐')} <Ico id="i-arrow" /></A>
          </div>
        </div>
      </div>
    </section>
  );
}

/* LLM weight-memory chart */
function Analysis() {
  const { tr } = useLang();
  const [bits, setBits] = useState(16);
  const MAX = 160, CAPS = [[24, '4090'], [32, '5090'], [48, 'A6000'], [80, 'A100']];
  return (
    <section className="block" aria-labelledby="an-h">
      <div className="wrap analysis">
        <div>
          <h2 id="an-h">{tr('How much memory does an LLM need?', '大模型需要多少显存？')}</h2>
          <div style={{ marginTop: 18 }}><St t="est" /></div>
          <div className="formula">weight_GB = params<span>(B)</span> × bits ÷ 8<br /><span>// {tr('weights only', '仅权重')}</span></div>
          <A to="/advisor/2" className="link" onClick={() => preset('llm')} style={{ marginTop: 22 }}>{tr('Add KV cache and concurrency', '加上 KV 缓存和并发')} <Ico id="i-arrow" /></A>
        </div>
        <div className="panel chart">
          <div className="chart-top">
            <h3>{tr('Model weight memory (GB)', '模型权重显存（GB）')}</h3>
            <div className="seg m" role="group" aria-label={tr('Precision', '精度')}>{[[4, 'INT4'], [8, 'INT8'], [16, 'FP16']].map(([v, l]) => <button key={v} aria-pressed={bits === v} onClick={() => setBits(v)}>{l}</button>)}</div>
          </div>
          <div className="plot"><div className="bars">
            {Object.values(LLM).filter((m) => !m.est).map((m) => { const gb = m.p * bits / 8; return (
              <div className={'brow' + (gb > 80 ? ' over' : '')} key={m.name}><span className="lbl">{Math.round(m.p)}B</span><div className="bar" style={{ width: Math.min(gb, MAX) / MAX * 100 + '%' }} /><span className="bval">{f1(gb)} GB</span></div>
            ); })}
            {CAPS.map(([v, nm], i) => <div className="vline" key={v} style={{ left: v / MAX * 100 + '%' }}><span style={{ top: -4 - (i % 2) * 18 }}>{nm} · {v}</span></div>)}
          </div><div className="axis">{[0, 40, 80, 120, 160].map((v) => <span key={v} style={{ left: v / MAX * 100 + '%' }}>{v}</span>)}</div></div>
          <div className="legend"><span><i />{tr('Fits one 80 GB GPU', '一张 80 GB 卡装得下')}</span><span><i className="h" />{tr('Needs more than one GPU', '需要多张卡')}</span><span><i className="d" />{tr('GPU memory capacity', '显卡显存容量')}</span></div>
        </div>
      </div>
    </section>
  );
}
