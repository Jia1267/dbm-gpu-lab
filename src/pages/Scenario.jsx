import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useLang } from '../i18n.jsx';
import { preset } from '../state.js';
import { G } from '../data/gpus.js';
import { SCENARIOS, SC } from '../data/scenarios.js';
import { VLLM, BENCH_SRC } from '../data/bench.js';
import { Ico, A, St, img } from '../ui.jsx';
import { VllmChart, ExtChart, TestCards } from './charts.jsx';

/* Index of all scenario guides */
export default function Scenarios() {
  const { tr, L } = useLang();
  useEffect(() => { document.title = tr('Scenarios', '场景方案') + ' · DBM GPU Lab'; });
  return (
    <>
      <div className="page-head"><div className="wrap"><div className="crumb"><A to="/">{tr('Home', '首页')}</A> / {tr('Scenarios', '场景')}</div><h1>{tr('Scenario guides', '场景方案')}</h1>
        <p className="lede">{tr('How it works, which GPU, test data and real cases.', '原理、选型、测试数据和真实案例。')}</p></div></div>
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 96 }}>
        <div className="sc-idx">{SCENARIOS.map((s) => (
          <A key={s.id} to={'/scenarios/' + s.id} className="panel"><div className="ph"><img src={img(s.img)} alt="" /></div>
            <div className="bd"><h3>{L(s.name)} <Ico id="i-arrow" /></h3><p>{L(s.tagline)}</p></div></A>
        ))}</div>
      </div>
    </>
  );
}

const GpuLinks = ({ ids }) => <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{ids.map((id) => <A key={id} className="chip" to={'/gpu/' + id}>{G(id).name}</A>)}</span>;

export function Scenario() {
  const { id } = useParams();
  const { tr, L, p } = useLang();
  const s = SC(id);
  const [cur, setCur] = useState('how');
  const [model, setModel] = useState('qwen3-8b-fp8');
  const [conc, setConc] = useState(32);
  useEffect(() => { if (s) document.title = L(s.name) + ' · DBM GPU Lab'; });
  useEffect(() => {
    const on = () => { let c = null; document.querySelectorAll('.sc-sec').forEach((x) => { if (x.getBoundingClientRect().top < 180) c = x.id; }); if (c) setCur(c); };
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  if (!s) return <Navigate to={p('/scenarios')} replace />;

  const hasCases = s.cases?.length > 0;
  const tabs = [['how', tr('How it works', '原理')], ['pick', tr('Which GPU', '选型')], ['test', tr('Test data', '测试数据')], ...(hasCases ? [['cases', tr('Cases', '案例')]] : []), ['faq', 'FAQ']];
  const go = (e, k) => { e.preventDefault(); document.getElementById(k)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };

  return (
    <>
      <section className="sc-hero"><div className="wrap">
        <div>
          <div className="crumb"><A to="/">{tr('Home', '首页')}</A> / <A to="/scenarios">{tr('Scenarios', '场景')}</A> / {L(s.name)}</div>
          <h1>{L(s.name)}</h1>
          <p className="lede">{L(s.tagline)}</p>
          <div className="hero-ctas" style={{ marginTop: 24 }}><A to="/advisor/2" className="btn btn-primary" onClick={() => preset(s.wl)}>{tr('Size my setup', '估算我的配置')} <Ico id="i-arrow" /></A><a href="#pick" className="btn btn-dark-line" onClick={(e) => go(e, 'pick')}>{tr('Which GPU', '选哪张卡')}</a></div>
          <div className="sc-kpis">{s.kpis.map(([v, l]) => <div key={v}><b>{v}</b><span>{L(l)}</span></div>)}</div>
        </div>
        <div className="ph"><img src={img(s.img)} alt="" /></div>
      </div></section>

      <nav className="sc-tabs" aria-label={tr('On this page', '本页导航')}><div className="wrap">{tabs.map(([k, t]) => <a key={k} href={'#' + k} className={cur === k ? 'cur' : ''} onClick={(e) => go(e, k)}>{t}</a>)}</div></nav>

      <div className="wrap">
        <section className="sc-sec" id="how"><h2>{tr('How it works', '原理')}</h2>
          {s.how.flow && <div className="sc-flow">{s.how.flow.map(([t, d], i) => <div className="sc-step" key={i}><i>0{i + 1}</i><b>{L(t)}</b><span>{L(d)}</span></div>)}</div>}
          {s.how.cards && <div className="sc-grid" style={{ marginTop: 16 }}>{s.how.cards.map(([t, d], i) => <div className="panel sc-card" key={i}><h3>{L(t)}</h3><p>{L(d)}</p></div>)}</div>}
          {s.how.methods && <div className="panel sc-table"><table><thead><tr><th>{tr('Method', '方式')}</th><th>{tr('How it shares', '共享方式')}</th><th>{tr('Isolation', '隔离')}</th><th>{tr('Licence', '授权')}</th><th>{tr('Platform', '平台')}</th><th>{tr('Best for', '适合')}</th></tr></thead>
            <tbody>{s.how.methods.map((m) => <tr key={m.k}><td><b>{L(m.n)}</b></td><td>{L(m.d)}</td><td>{L(m.iso)}</td><td>{L(m.lic)}</td><td className="m" style={{ whiteSpace: 'normal' }}>{m.os}</td><td>{L(m.best)}</td></tr>)}</tbody></table></div>}
        </section>

        <section className="sc-sec" id="pick"><h2>{tr('Which GPU', '选型')}</h2>
          <div className="panel sc-table"><table><thead><tr>{s.pick.cols.map((c, i) => <th key={i}>{L(c)}</th>)}</tr></thead>
            <tbody>{s.pick.rows.map((r, i) => <tr key={i}><td>{L(r[0])}</td><td className="m" style={{ whiteSpace: 'normal' }}>{L(r[1])}</td><td><GpuLinks ids={r[2]} /></td></tr>)}</tbody></table></div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: '32px 0 14px' }}>{tr('GPU Mart plans', 'GPU Mart 套餐')}</h3>
          <div className="sc-plans">{s.pick.plans.map(([gid, type, price, spec, fit]) => (
            <div className="panel sc-plan" key={gid + price}><span className="t">{L(type)}</span><A className="g" to={'/gpu/' + gid}>{G(gid).name}</A><span className="mono" style={{ fontSize: 13, color: 'var(--steel)' }}>{G(gid).vtot} GB {G(gid).mem}</span>
              <span className="pr">${price.toLocaleString('en-US')}<small>{tr(' /mo', ' /月')}</small></span><ul><li>{L(spec)}</li></ul><span className="fit">{L(fit)}</span></div>
          ))}</div>
          <p className="sc-note">{tr('List prices seen in November 2026; promotions excluded. Check ', '2026 年 11 月的标价，不含促销。以 ')}<a className="link" href={s.pick.src} target="_blank" rel="noopener">GPU Mart</a>{tr(' for current pricing.', ' 当前价格为准。')}</p>
        </section>

        <section className="sc-sec" id="test"><h2>{tr('Test data', '测试数据')}</h2>
          {s.test.kind === 'vllm' ? <>
            <div className="sc-bench-top"><div><h3>{tr('vLLM throughput, total tokens/s', 'vLLM 总吞吐量（tokens/s）')}</h3><p>{tr('1,024 input / 512 output tokens · higher is better', '输入 1,024 / 输出 512 tokens · 越高越好')}</p></div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div className="seg-tabs" role="group" aria-label={tr('Model', '模型')}>{Object.entries(VLLM).map(([k, m]) => <button key={k} aria-pressed={model === k} onClick={() => setModel(k)}>{m.name.split(' · ')[0]}</button>)}</div>
                <div className="seg-tabs" role="group" aria-label={tr('Concurrent users', '并发用户')}>{[1, 8, 32].map((c) => <button key={c} aria-pressed={conc === c} onClick={() => setConc(c)}>{c} {tr(c === 1 ? 'user' : 'users', '人')}</button>)}</div>
              </div></div>
            <VllmChart modelKey={model} conc={conc} compact />
            <p className="sc-note"><St t="dbm" /> {VLLM[model].name} · <a className="link" href={BENCH_SRC} target="_blank" rel="noopener">{tr('Source and full table', '来源和完整数据')}</a> · <A className="link" to="/benchmarks">{tr('All benchmarks', '全部测试')}</A></p>
          </> : <>
            {s.test.charts?.map((k) => <ExtChart key={k} k={k} />)}
            {s.test.items?.length > 0 && <div style={{ marginTop: s.test.charts?.length ? 32 : 0 }}><TestCards items={s.test.items} /></div>}
          </>}
        </section>

        {hasCases && <section className="sc-sec" id="cases"><h2>{tr('Customer cases', '客户案例')}</h2>
          <div className="sc-grid">{s.cases.map((c, i) => (
            <div className="panel sc-case" key={i}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}><h3>{L(c.t)}</h3><St t="cust" /></div>
              <dl>{c.gpu && <><dt>GPU</dt><dd><A className="link" to={'/gpu/' + c.gpu}>{G(c.gpu).name}</A></dd></>}<dt>{tr('Stack', '软件')}</dt><dd className="mono" style={{ fontSize: 13 }}>{c.stack}</dd></dl>
              <div className="res">{c.res.map((r, j) => <span key={j}>{L(r)}</span>)}</div>
              {c.note && <p className="sc-note" style={{ marginTop: 0 }}>{L(c.note)}</p>}
              {c.link && <A className="link" to={c.link} style={{ fontSize: 14 }}>{tr('See streaming guide', '查看直播方案')} <Ico id="i-arrow" /></A>}</div>
          ))}</div>
        </section>}

        <section className="sc-sec sc-faq" id="faq"><h2>FAQ</h2>
          {s.faq.map(([q, a], i) => <details key={i}><summary>{L(q)}</summary><p>{L(a)}</p></details>)}
          <p className="sc-note" style={{ marginTop: 20 }}>{tr('Sources: ', '来源：')}{s.sources.map(([u, t], i) => <span key={u}>{i ? ' · ' : ''}<a className="link" href={u} target="_blank" rel="noopener">{t}</a></span>)}</p>
        </section>

        <div className="sc-cta"><div><h2>{tr('Size it for your own workload', '按你的工作量来估算')}</h2><p>{tr('Four questions, a recommended GPU and the reasoning behind it.', '四个问题，给出推荐的 GPU 和理由。')}</p></div>
          <div className="row"><A to="/advisor/2" className="btn btn-primary" onClick={() => preset(s.wl)}>{tr('Open the Advisor', '打开选卡向导')} <Ico id="i-arrow" /></A><a href="https://www.gpu-mart.com/" className="btn btn-dark-line" target="_blank" rel="noopener">GPU Mart</a></div></div>
      </div>
    </>
  );
}
