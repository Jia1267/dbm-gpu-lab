import { useState } from 'react';
import { useLang } from '../i18n.jsx';
import { G } from '../data/gpus.js';
import { VLLM } from '../data/bench.js';
import { EXT } from '../data/ext.js';
import { A, St } from '../ui.jsx';

const num = (v) => (v >= 100 ? Math.round(v * 10) / 10 : v).toLocaleString('en-US');
const Name = ({ id }) => (G(id) ? <A to={'/gpu/' + id}>{G(id).name}</A> : <>{id}</>);

/* Bar chart + table for one vLLM model at one concurrency */
export function VllmChart({ modelKey, conc, metric = 'agg', compact }) {
  const { tr } = useLang();
  const m = VLLM[modelKey];
  const col = { agg: 5, user: 4, ttft: 2 }[metric];
  const rows = m.rows.filter((r) => r[1] === conc).map((r) => ({ g: G(r[0]), v: r[col], r, flag: m.flag?.[r[0]] }));
  const lowerBetter = metric === 'ttft';
  rows.sort((a, b) => (lowerBetter ? a.v - b.v : b.v - a.v));
  const max = Math.max(...rows.map((r) => r.v));
  return (
    <div className="panel">
      <div className="sc-bars">{rows.map((x, i) => (
        <div className="sc-bar" key={x.g.id}><span>{x.g.name}{x.flag && <sup title={tr('Matches RTX 5090 rows in the source; being re-checked', '源数据中与 RTX 5090 完全一致，正在复核')}> *</sup>}</span>
          <div className="trk"><div className={'fill' + (i === 0 ? ' top' : '')} style={{ width: Math.max(2, x.v / max * 100) + '%' }} /></div><span className="v">{x.v.toLocaleString('en-US')}{metric === 'ttft' ? ' s' : ''}</span></div>
      ))}</div>
      {!compact && <div className="sc-table" style={{ borderTop: '1px solid var(--border)' }}><table><thead><tr><th>GPU</th><th>{tr('Mean TTFT', '平均首 token')}</th><th>{tr('P50 TTFT', 'P50 首 token')}</th><th>{tr('Per-user tok/s', '单用户 tok/s')}</th><th>{tr('Total tok/s', '总吞吐 tok/s')}</th><th>{tr('Mean end-to-end', '平均端到端')}</th></tr></thead>
        <tbody>{rows.map((x) => <tr key={x.g.id}><td>{x.g.name}{x.flag && ' *'}</td><td className="m">{x.r[2]} s</td><td className="m">{x.r[3]} s</td><td className="m">{x.r[4]}</td><td className="m">{x.r[5].toLocaleString('en-US')}</td><td className="m">{x.r[6]} s</td></tr>)}</tbody></table></div>}
    </div>
  );
}

/* Bar chart for a published benchmark set (data/ext.js) */
export function ExtChart({ k, title = true }) {
  const { tr, L } = useLang();
  const s = EXT[k];
  const [c, setC] = useState(0);
  const col = s.cols[c];
  const rows = s.rows.filter((r) => r[c + 1] != null).sort((a, b) => (col.lower ? a[c + 1] - b[c + 1] : b[c + 1] - a[c + 1]));
  const max = Math.max(...rows.map((r) => r[c + 1]));
  return (
    <div className="ext">
      <div className="sc-bench-top">
        {title && <div><h3>{L(s.name)}</h3><p>{L(col.n)}{col.unit ? ' · ' + col.unit : ''} · {col.lower ? tr('lower is better', '越低越好') : tr('higher is better', '越高越好')}</p></div>}
        {s.cols.length > 1 && <div className="seg-tabs" role="group" aria-label={tr('Test', '测试项')}>{s.cols.map((x, i) => <button key={x.k} aria-pressed={c === i} onClick={() => setC(i)}>{L(x.n)}</button>)}</div>}
      </div>
      <div className="panel"><div className="sc-bars">{rows.map((r, i) => (
        <div className={'sc-bar' + (G(r[0]) ? '' : ' ref')} key={r[0]}><span><Name id={r[0]} /></span>
          <div className="trk"><div className={'fill' + (i === 0 ? ' top' : '')} style={{ width: Math.max(2, (col.lower ? Math.min(...rows.map((x) => x[c + 1])) / r[c + 1] : r[c + 1] / max) * 100) + '%' }} /></div>
          <span className="v">{num(r[c + 1])}{col.unit && col.unit.length <= 2 ? ' ' + col.unit : ''}</span></div>
      ))}</div></div>
      <p className="sc-note"><St t="ext" /> <a className="link" href={s.src.url} target="_blank" rel="noopener">{s.src.label}</a> · {L(s.src.ver)}{s.note ? ' · ' + L(s.note) : ''}</p>
    </div>
  );
}

/* Cards for individual tests: DBM's own, or published ones with a source link */
export function TestCards({ items }) {
  const { tr, L } = useLang();
  return (
    <div className="sc-grid">{items.map((x, i) => (
      <div className="panel sc-case" key={i}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}><h3>{L(x.t)}</h3><St t={x.src ? 'ext' : 'dbm'} /></div>
        <dl>{(x.gpu || x.gpuName) && <><dt>GPU</dt><dd>{x.gpu ? <A className="link" to={'/gpu/' + x.gpu}>{G(x.gpu).name}</A> : x.gpuName}</dd></>}{x.setup && <><dt>{tr('Setup', '环境')}</dt><dd className="mono" style={{ fontSize: 13 }}>{x.setup}</dd></>}</dl>
        <div className="res">{x.res.map((r, j) => <span key={j}>{L(r)}</span>)}</div>
        {x.note && <p className="sc-note" style={{ marginTop: 0 }}>{L(x.note)}</p>}
        {x.src && <a className="link" style={{ fontSize: 13.5 }} href={x.src.url} target="_blank" rel="noopener">{x.src.label} ↗</a>}</div>
    ))}</div>
  );
}
