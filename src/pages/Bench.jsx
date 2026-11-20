import { useEffect, useState } from 'react';
import { useLang } from '../i18n.jsx';
import { G } from '../data/gpus.js';
import { VLLM, OLLAMA, BENCH_SRC } from '../data/bench.js';
import { preset } from '../state.js';
import { Ico, A, St } from '../ui.jsx';

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

export default function Bench() {
  const { tr } = useLang();
  const [tab, setTab] = useState('vllm');
  const [model, setModel] = useState('qwen3-8b-fp8');
  const [conc, setConc] = useState(8);
  const [metric, setMetric] = useState('agg');
  const [om, setOm] = useState('gpt-oss:20b');
  useEffect(() => { document.title = tr('Benchmarks', '测试数据') + ' · DBM GPU Lab'; });
  const flagged = VLLM[model].flag;

  return (
    <>
      <div className="page-head"><div className="wrap"><div className="crumb"><A to="/">{tr('Home', '首页')}</A> / {tr('Benchmarks', '测试')}</div><h1>{tr('Benchmarks', '测试数据')}</h1>
        <p className="lede">{tr('LLM inference measured on GPU Mart servers.', '在 GPU Mart 服务器上实测的大模型推理数据。')}</p>
        <div style={{ marginTop: 20 }} className="seg-tabs" role="group" aria-label={tr('Framework', '框架')}>
          <button aria-pressed={tab === 'vllm'} onClick={() => setTab('vllm')}>{tr('vLLM · production serving', 'vLLM · 生产部署')}</button>
          <button aria-pressed={tab === 'ollama'} onClick={() => setTab('ollama')}>{tr('Ollama · single user', 'Ollama · 单用户')}</button>
        </div></div></div>
      <div className="wrap bwrap" style={{ paddingBottom: 96, paddingTop: 32 }}>
        <div>
          {tab === 'vllm' ? <>
            <div className="bfilters b3" style={{ marginTop: 0, marginBottom: 20 }}>
              <div className="field"><label htmlFor="b-model">{tr('Model', '模型')}</label><select className="sel" id="b-model" value={model} onChange={(e) => setModel(e.target.value)}>{Object.entries(VLLM).map(([k, m]) => <option key={k} value={k}>{m.name}</option>)}</select></div>
              <div className="field"><label htmlFor="b-conc">{tr('Concurrent requests', '并发请求数')}</label><select className="sel" id="b-conc" value={conc} onChange={(e) => setConc(+e.target.value)}>{[1, 8, 32].map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="field"><label htmlFor="b-metric">{tr('Show', '指标')}</label><select className="sel" id="b-metric" value={metric} onChange={(e) => setMetric(e.target.value)}><option value="agg">{tr('Total tokens/s (higher is better)', '总吞吐 tokens/s（越高越好）')}</option><option value="user">{tr('Tokens/s per user (higher is better)', '单用户 tokens/s（越高越好）')}</option><option value="ttft">{tr('Time to first token (lower is better)', '首 token 延迟（越低越好）')}</option></select></div>
            </div>
            <VllmChart modelKey={model} conc={conc} metric={metric} />
            {flagged && <p className="sc-note">* {tr('RTX PRO 5000 rows match the RTX 5090 rows in the source table and are being re-checked.', 'RTX PRO 5000 的数据在源表中与 RTX 5090 完全一致，正在复核。')}</p>}
          </> : <>
            <div className="bfilters b1" style={{ marginTop: 0, marginBottom: 20 }}>
              <div className="field"><label htmlFor="b-om">{tr('Model (Q4_K_M)', '模型（Q4_K_M）')}</label><select className="sel" id="b-om" value={om} onChange={(e) => setOm(e.target.value)}>{Object.entries(OLLAMA).map(([k, m]) => <option key={k} value={k}>{k} · {m.vram}</option>)}</select></div>
            </div>
            <div className="panel"><div className="sc-bars">{(() => { const rows = OLLAMA[om].rows, max = Math.max(...rows.map((r) => r[2])); return rows.map((r, i) => (
              <div className="sc-bar" key={r[0]}><span>{G(r[0]).name}</span><div className="trk"><div className={'fill' + (i === 0 ? ' top' : '')} style={{ width: r[2] / max * 100 + '%' }} /></div><span className="v">{r[2]} tok/s</span></div>)); })()}</div></div>
          </>}
          <div className="adv-nav" style={{ marginTop: 24 }}><A className="btn btn-line btn-sm" to="/scenarios/llm">{tr('LLM inference guide', '大模型推理方案')}</A><A className="btn btn-line btn-sm" to="/advisor/2" onClick={() => preset('llm')}>{tr('Size my workload', '估算我的需求')}</A></div>
        </div>
        <aside className="panel env"><h3>{tr('Test environment', '测试环境')}</h3><div style={{ marginTop: 8 }}><St t="dbm" /></div>
          {tab === 'vllm'
            ? <dl><dt>{tr('Framework', '框架')}</dt><dd>vLLM</dd><dt>{tr('Input / output', '输入 / 输出')}</dt><dd>1,024 / 512 tokens</dd><dt>{tr('Concurrency', '并发')}</dt><dd>1 · 8 · 32</dd><dt>{tr('Driver / CUDA', '驱动 / CUDA')}</dt><dd>{tr('Not published', '未公布')}</dd></dl>
            : <dl><dt>{tr('Framework', '框架')}</dt><dd>Ollama (llama.cpp)</dd><dt>{tr('Quantization', '量化')}</dt><dd>Q4_K_M</dd><dt>{tr('Input / output', '输入 / 输出')}</dt><dd>1,024 / 512 tokens</dd><dt>{tr('Runs', '次数')}</dt><dd>{tr('Mean of 10, single user', '单用户，10 次平均')}</dd></dl>}
          <div className="src"><span className="eyebrow">{tr('Source', '来源')}</span><a className="link" href={BENCH_SRC} target="_blank" rel="noopener">GPU Mart · Self-hosted LLM guide</a><span>{tr('Model labels follow the source chart legend.', '模型名称依据来源页面的图例。')}</span></div></aside>
      </div>
    </>
  );
}
