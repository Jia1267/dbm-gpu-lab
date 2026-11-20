import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../i18n.jsx';
import { VLLM, OLLAMA, BENCH_SRC } from '../data/bench.js';
import { Ico, A, St } from '../ui.jsx';
import { G } from '../data/gpus.js';
import { EXT, NVENC, NVENC_SRC } from '../data/ext.js';
import { SC } from '../data/scenarios.js';
import { VllmChart, ExtChart, TestCards } from './charts.jsx';
import Select from '../Select.jsx';

/* Tabs: [key, en, zh, published set or null, related scenario] */
const TABS = [
  ['vllm', 'LLM · vLLM', '大模型 · vLLM', null, 'llm'], ['ollama', 'LLM · Ollama', '大模型 · Ollama', null, 'llm'],
  ['render', 'Rendering', '渲染', 'blender', 'render'], ['graphics', 'Graphics', '图形', 'steelnomad', 'game'], ['train', 'Training', '训练', 'lambda', 'train'],
  ['imggen', 'Image & video gen', '生图与视频', 'nvimg', 'img'], ['md', 'Molecular dynamics', '分子动力学', 'amber', 'bio'], ['cad', 'CAD', 'CAD', 'specvp', 'cad'],
  ['video', 'Video encode', '视频编码', null, 'streaming'], ['vgpu', 'GPU sharing', 'GPU 共享', null, 'vgpu'],
];

function NvencTable() {
  const { tr } = useLang();
  const rows = Object.entries(NVENC).filter(([id, v]) => G(id) && v[0] > 0).sort((a, b) => b[1][0] - a[1][0] || b[1][2] - a[1][2]);
  return (
    <div className="panel sc-table"><table><thead><tr><th>GPU</th><th>{tr('NVENC encoders', 'NVENC 编码器')}</th><th>{tr('Concurrent sessions', '并发编码路数')}</th><th>AV1</th></tr></thead>
      <tbody>{rows.map(([id, [n, s, av1]]) => <tr key={id}><td><A to={'/gpu/' + id}>{G(id).name}</A></td><td className="m">{n}</td><td className="m">{s === '∞' ? tr('No limit', '不限') : s}</td><td className="m">{av1 ? '✓' : '—'}</td></tr>)}</tbody></table></div>
  );
}

export default function Bench() {
  const { tr, L } = useLang();
  const [sp, setSp] = useSearchParams();
  const tab = TABS.some((t) => t[0] === sp.get('t')) ? sp.get('t') : 'vllm';
  const setTab = (t) => setSp(t === 'vllm' ? {} : { t }, { replace: true });
  const [model, setModel] = useState('qwen3-8b-fp8');
  const [conc, setConc] = useState(8);
  const [metric, setMetric] = useState('agg');
  const [om, setOm] = useState('gpt-oss:20b');
  useEffect(() => { document.title = tr('Benchmarks', '测试数据') + ' · DBM GPU Lab'; });
  const flagged = VLLM[model].flag;
  const T = TABS.find((t) => t[0] === tab);
  const ext = T[3] && EXT[T[3]];
  const llm = tab === 'vllm' || tab === 'ollama';

  return (
    <>
      <div className="page-head"><div className="wrap"><div className="crumb"><A to="/">{tr('Home', '首页')}</A> / {tr('Benchmarks', '测试')}</div><h1>{tr('Benchmarks', '测试数据')}</h1>
        <p className="lede">{tr('Our own tests on GPU Mart servers, plus published results from vendors and benchmark bodies.', '我们在 GPU Mart 服务器上的实测，以及厂商和权威测试机构公开的结果。')}</p>
        <div style={{ marginTop: 20 }} className="seg-tabs btabs" role="group" aria-label={tr('Workload', '工作负载')}>
          {TABS.map(([k, en, zh]) => <button key={k} aria-pressed={tab === k} onClick={() => setTab(k)}>{tr(en, zh)}</button>)}
        </div></div></div>
      <div className="wrap bwrap" style={{ paddingBottom: 96, paddingTop: 32 }}>
        <div>
          {tab === 'vllm' && <>
            <div className="bfilters b3" style={{ marginTop: 0, marginBottom: 20 }}>
              <div className="field"><label htmlFor="b-model">{tr('Model', '模型')}</label><Select id="b-model" label={tr('Model', '模型')} value={model} onChange={setModel} options={Object.entries(VLLM).map(([k, m]) => [k, m.name])} /></div>
              <div className="field"><label htmlFor="b-conc">{tr('Concurrent requests', '并发请求数')}</label><Select id="b-conc" label={tr('Concurrent requests', '并发请求数')} value={conc} onChange={setConc} options={[1, 8, 32].map((c) => [c, String(c)])} /></div>
              <div className="field"><label htmlFor="b-metric">{tr('Show', '指标')}</label><Select id="b-metric" label={tr('Show', '指标')} value={metric} onChange={setMetric} options={[['agg', tr('Total tokens/s (higher is better)', '总吞吐 tokens/s（越高越好）')], ['user', tr('Tokens/s per user (higher is better)', '单用户 tokens/s（越高越好）')], ['ttft', tr('Time to first token (lower is better)', '首 token 延迟（越低越好）')]]} /></div>
            </div>
            <VllmChart modelKey={model} conc={conc} metric={metric} />
            {flagged && <p className="sc-note">* {tr('RTX PRO 5000 rows match the RTX 5090 rows in the source table and are being re-checked.', 'RTX PRO 5000 的数据在源表中与 RTX 5090 完全一致，正在复核。')}</p>}
          </>}
          {tab === 'ollama' && <>
            <div className="bfilters b1" style={{ marginTop: 0, marginBottom: 20 }}>
              <div className="field"><label htmlFor="b-om">{tr('Model (Q4_K_M)', '模型（Q4_K_M）')}</label><Select id="b-om" label={tr('Model (Q4_K_M)', '模型（Q4_K_M）')} value={om} onChange={setOm} options={Object.entries(OLLAMA).map(([k, m]) => [k, k, m.vram])} /></div>
            </div>
            <div className="panel"><div className="sc-bars">{(() => { const rows = OLLAMA[om].rows, max = Math.max(...rows.map((r) => r[2])); return rows.map((r, i) => (
              <div className="sc-bar" key={r[0]}><span>{G(r[0]).name}</span><div className="trk"><div className={'fill' + (i === 0 ? ' top' : '')} style={{ width: r[2] / max * 100 + '%' }} /></div><span className="v">{r[2]} tok/s</span></div>)); })()}</div></div>
          </>}
          {ext && <ExtChart key={T[3]} k={T[3]} />}
          {tab === 'video' && <>
            <TestCards items={SC('streaming').test.items} />
            <h3 className="bsub">{tr('Hardware encoders per GPU', '每张 GPU 的硬件编码器')}</h3>
            <NvencTable />
            <p className="sc-note"><St t="ext" /> <a className="link" href={NVENC_SRC} target="_blank" rel="noopener">NVIDIA · Video Encode and Decode GPU Support Matrix</a>{tr(' · A100 and H100 have no NVENC.', ' · A100 和 H100 没有 NVENC。')}</p>
          </>}
          {tab === 'vgpu' && <TestCards items={SC('vgpu').test.items} />}
          <div className="adv-nav" style={{ marginTop: 24 }}><A className="btn btn-line btn-sm" to={'/scenarios/' + T[4]}>{tr('Scenario guide', '场景方案')} <Ico id="i-arrow" /></A></div>
        </div>
        <aside className="panel env"><h3>{tr('Test environment', '测试环境')}</h3><div style={{ marginTop: 8 }}><St t={ext ? 'ext' : 'dbm'} /></div>
          {tab === 'vllm' && <dl><dt>{tr('Framework', '框架')}</dt><dd>vLLM</dd><dt>{tr('Input / output', '输入 / 输出')}</dt><dd>1,024 / 512 tokens</dd><dt>{tr('Concurrency', '并发')}</dt><dd>1 · 8 · 32</dd><dt>{tr('Driver / CUDA', '驱动 / CUDA')}</dt><dd>{tr('Not published', '未公布')}</dd></dl>}
          {tab === 'ollama' && <dl><dt>{tr('Framework', '框架')}</dt><dd>Ollama (llama.cpp)</dd><dt>{tr('Quantization', '量化')}</dt><dd>Q4_K_M</dd><dt>{tr('Input / output', '输入 / 输出')}</dt><dd>1,024 / 512 tokens</dd><dt>{tr('Runs', '次数')}</dt><dd>{tr('Mean of 10, single user', '单用户，10 次平均')}</dd></dl>}
          {ext && <dl><dt>{tr('Test', '测试')}</dt><dd>{L(ext.name)}</dd><dt>{tr('Setup', '环境')}</dt><dd>{L(ext.src.ver)}</dd></dl>}
          {(tab === 'video' || tab === 'vgpu') && <dl><dt>{tr('Where', '地点')}</dt><dd>{tr('GPU Mart servers', 'GPU Mart 服务器')}</dd><dt>{tr('Details', '详情')}</dt><dd>{tr('On each card', '见各卡片')}</dd></dl>}
          <div className="src"><span className="eyebrow">{tr('Source', '来源')}</span>
            {ext ? <a className="link" href={ext.src.url} target="_blank" rel="noopener">{ext.src.label}</a>
              : tab === 'video' ? <a className="link" href={NVENC_SRC} target="_blank" rel="noopener">NVIDIA · NVENC matrix</a>
              : tab === 'vgpu' ? <a className="link" href={SC('vgpu').sources[0][0]} target="_blank" rel="noopener">{SC('vgpu').sources[0][1]}</a>
              : <a className="link" href={BENCH_SRC} target="_blank" rel="noopener">GPU Mart · Self-hosted LLM guide</a>}
            {llm && <span>{tr('Model labels follow the source chart legend.', '模型名称依据来源页面的图例。')}</span>}</div></aside>
      </div>
    </>
  );
}
