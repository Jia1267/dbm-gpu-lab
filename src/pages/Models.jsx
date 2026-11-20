import { useEffect } from 'react';
import { useLang } from '../i18n.jsx';
import { useStore } from '../store.js';
import { app, setMF, setS, setAns } from '../state.js';
import { MCATS, MODELS, MCAT_ZH, NOTE_ZH, licZh } from '../data/models.js';
import { LLM, WL } from '../data/workloads.js';
import { Ico, A } from '../ui.jsx';

const MTIER = (g) => (g <= 24 ? 1 : g <= 48 ? 2 : g <= 96 ? 3 : g <= 768 ? 4 : 5);
const MCAP = { 1: 24, 2: 48, 3: 96, 4: 768 };
const mfmt = (g) => (g >= 1000 ? `~${(g / 1000).toFixed(1)} TB` : `~${Math.round(g)} GB`);
const mtight = (g) => { const t = MTIER(g); return t <= 4 && g > MCAP[t] * 0.9; };
const mpos = (g) => Math.max(2, Math.min(100, Math.log2(Math.max(g, 1)) / Math.log2(2048) * 100));
const MTICK = [[24, '24'], [48, '48'], [96, '96'], [768, '8×96']];
const mnorm = (x) => String(x).toLowerCase().replace(/[^a-z0-9.一-鿿]+/g, '');
const LLMK = 'llm chat chatgpt gpt assistant chatbot large language model text 大模型 聊天 对话 客服';
const MKEY = { 'llm-s': LLMK + ' small local 单卡', 'llm-m': LLMK, 'llm-xl': LLMK, code: 'code coding programming copilot agent 编程 代码', vlm: 'vision image multimodal screenshot chart 看图 多模态', embed: 'rag search retrieval knowledge vector embedding rerank 知识库 检索 向量', ocr: 'ocr pdf document scan invoice table 文档 扫描 发票', img: 'image picture photo art text to image comfyui diffusion 生图 图片', video: 'video clip animation text to video image to video 视频', '3d': '3d mesh asset game image to 3d 建模', speech: 'speech voice audio transcription asr tts text to speech 语音 转写 配音', music: 'music song audio soundtrack 音乐 歌曲', cv: 'vision camera cctv detection segmentation yolo 监控 检测 分割', robot: 'robot robotics vla humanoid 机器人', bio: 'biology protein drug genome dna 蛋白 基因 药物' };

/* LLM rows can be sized in the Advisor: parse total / active params from the parameter text */
function mparams(m) {
  if (!/^(llm|code|vlm)/.test(m[0]) || /[–]/.test(m[3])) return null;
  const t = m[3].match(/^~?([\d.]+)\s*([TB])\b/); if (!t) return null;
  const a = m[3].match(/\/\s*([\d.]+)B active/);
  return { p: +t[1] * (t[2] === 'T' ? 1000 : 1), act: a ? +a[1] : null };
}
function sizeModel(i, tr) {
  const m = MODELS[i], pp = mparams(m); if (!pp) return;
  setMF({ y: window.scrollY, ret: true });
  const id = 'x' + i;
  LLM[id] = { name: m[1], p: pp.p, L: 60, kv: 8, hd: 128, moe: pp.act && pp.act < pp.p ? pp.act : null, est: true };
  const f = WL.llm.fields[0];
  if (!f.opts.some((o) => o[0] === id)) f.opts.unshift([id, { en: m[1] + ' (from Open models)', zh: m[1] + '（来自开源模型）' }]);
  setS({ wl: 'llm' }); setAns('llm', { model: id, prec: 'int4' });
}

export default function Models() {
  const { tr, zh } = useLang();
  const MF = useStore(app, (s) => s.MF);
  useEffect(() => { document.title = tr('Open models', '开源模型') + ' · DBM GPU Lab'; });
  const catName = (c) => (zh ? MCAT_ZH[c[0]][0] : c[1]);
  const TN = { 1: [tr('Fits 24 GB', '24 GB 可跑'), 'RTX 4090 · RTX A5000'], 2: [tr('Fits 48 GB', '48 GB 可跑'), 'RTX A6000 · RTX PRO 5000'], 3: [tr('Fits 96 GB', '96 GB 可跑'), 'RTX PRO 6000 · H100'], 4: [tr('Multi-GPU', '多卡'), tr('2 to 8 GPUs in one server', '一台服务器 2–8 张卡')], 5: [tr('Beyond one server', '超出单台服务器'), tr('More than 8 × 96 GB', '超过 8 × 96 GB')] };
  const LIC = { o: [tr('Commercial OK', '可商用'), 'ok'], c: [tr('Conditions', '有条件'), 'cond'], n: [tr('Non-commercial', '非商用'), 'nc'] };

  const hit = (m, skipCat) => {
    const q = MF.q.trim();
    if (!skipCat && MF.cat && m[0] !== MF.cat) return false;
    if (MF.tier && !(MF.tier === 4 ? MTIER(m[7]) >= 4 : MTIER(m[7]) <= MF.tier)) return false;
    if (MF.lic && m[5] !== MF.lic) return false;
    if (!q) return true;
    const c = MCATS.find((x) => x[0] === m[0]);
    const hay = mnorm(m.join(' ') + ' ' + c[1] + ' ' + MCAT_ZH[m[0]][0] + ' ' + (NOTE_ZH[m[1]] || '') + ' ' + (MKEY[m[0]] || ''));
    return q.split(/\s+/).map(mnorm).filter(Boolean).every((w) => hay.includes(w));
  };
  const rows = MODELS.filter((m) => hit(m));
  const nf = (MF.tier ? 1 : 0) + (MF.lic ? 1 : 0);
  const scale = <span className="vm-scale" aria-hidden="true">{MTICK.map(([g, l]) => <i key={l} style={{ left: mpos(g) + '%' }}>{l}</i>)}</span>;
  const meter = (gb) => <div className="vm" aria-hidden="true"><div className="vm-trk"><div className={'vm-fill t' + MTIER(gb)} style={{ width: mpos(gb) + '%' }} />{MTICK.map(([x]) => <i key={x} style={{ left: mpos(x) + '%' }} />)}</div><div className="vm-lab">{scale}</div></div>;

  return (
    <>
      <div className="page-head"><div className="wrap"><div className="crumb"><A to="/">{tr('Home', '首页')}</A> / {tr('Open models', '开源模型')}</div><h1>{tr('Open models', '开源模型')}</h1>
        <p className="lede">{tr(`${MODELS.length} models you can self-host, and the GPU each one needs.`, `${MODELS.length} 个可以自己部署的模型，以及每个需要什么 GPU。`)}</p>
        <div className="mlegend">{[1, 2, 3, 4, 5].map((t) => <span key={t} title={TN[t][1]}><i className={'tier-dot t' + t} />{TN[t][0]}</span>)}</div></div></div>
      <div className="mbar"><div className="wrap">
        <div className="mfil"><div className="msearch"><Ico id="i-search" /><input type="search" value={MF.q} onChange={(e) => setMF({ q: e.target.value })} placeholder={tr('Search models or tasks', '搜索模型或用途')} aria-label={tr('Search models', '搜索模型')} autoComplete="off" /></div>
          <button type="button" className="btn btn-line mfbtn" aria-expanded={MF.open} aria-controls="m-sels" onClick={() => setMF({ open: !MF.open })}><Ico id="i-filter" />{tr('Filters', '筛选')}<span className="mfn mono">{nf ? ' · ' + nf : ''}</span></button>
          <div className={'msels' + (MF.open ? ' open' : '')} id="m-sels">
            <select className="sel" value={MF.tier} onChange={(e) => setMF({ tier: +e.target.value })} aria-label={tr('Filter by GPU memory', '按显存筛选')}><option value={0}>{tr('Any GPU size', '任意显存')}</option>{[1, 2, 3].map((t) => <option key={t} value={t}>{TN[t][0]}</option>)}<option value={4}>{tr('Needs multi-GPU', '需要多卡')}</option></select>
            <select className="sel" value={MF.lic} onChange={(e) => setMF({ lic: e.target.value })} aria-label={tr('Filter by license', '按许可证筛选')}><option value="">{tr('Any license', '任意许可证')}</option>{Object.entries(LIC).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}</select></div>
          <span className="mcount mono" aria-live="polite">{rows.length} / {MODELS.length}</span></div>
        <div className="mcats" role="group" aria-label={tr('Category', '类别')}>
          <button type="button" className="mpick" title={tr('Chat models that fit one 24 GB GPU and allow commercial use', '能在一张 24 GB 卡上跑、可商用的聊天模型')} onClick={() => { setMF({ cat: 'llm-s', tier: 1, lic: 'o', q: '' }); document.querySelector('.mbar')?.scrollIntoView({ behavior: 'smooth' }); }}>{tr('1 GPU · commercial', '单卡 · 可商用')}</button>
          <button aria-pressed={!MF.cat} onClick={() => setMF({ cat: '' })}>{tr('All', '全部')} <i>{MODELS.filter((m) => hit(m, true)).length}</i></button>
          {MCATS.map((c) => { const n = MODELS.filter((m) => hit(m, true) && m[0] === c[0]).length; return <button key={c[0]} aria-pressed={MF.cat === c[0]} disabled={!n && MF.cat !== c[0]} onClick={() => setMF({ cat: c[0] })}>{catName(c)} <i>{n}</i></button>; })}
        </div>
      </div></div>
      <div className="wrap mbody">
        {MCATS.filter((c) => !MF.cat || c[0] === MF.cat).map((c) => { const r = rows.filter((m) => m[0] === c[0]); if (!r.length) return null; return (
          <section className="ms" key={c[0]} aria-labelledby={'ms-' + c[0]}><div className="ms-head"><h2 id={'ms-' + c[0]} title={zh ? MCAT_ZH[c[0]][1] : c[2]}>{catName(c)} <span className="mono">{r.length}</span></h2></div>
            <div className="panel mt" role="table" aria-label={catName(c)}>
              <div className="mr mh" role="row"><span role="columnheader">{tr('Model', '模型')}</span><span role="columnheader">{tr('Params', '参数')}</span><span role="columnheader">{tr('License', '许可证')}</span><span role="columnheader" className="mh-mem">{tr('Memory, 4-bit', '显存（4-bit）')} {scale}</span><span role="columnheader"><span className="sr">Advisor</span></span></div>
              {r.map((m) => { const i = MODELS.indexOf(m), t = MTIER(m[7]), Lc = LIC[m[5]], note = zh ? NOTE_ZH[m[1]] : m[8], pp = mparams(m); return (
                <div className="mr" role="row" key={m[1]}>
                  <div className="mn" role="cell"><a className="mname" href={'https://huggingface.co/models?search=' + encodeURIComponent(m[1].split(/ [·(]/)[0])} target="_blank" rel="noopener" title={tr('Find on Hugging Face', '在 Hugging Face 上查找')}>{m[1]} <Ico id="i-ext" /></a><span title={note || ''}>{m[2]}</span></div>
                  <div className="mp mono" role="cell">{m[3]}</div>
                  <div className="mlc" role="cell"><span className={'lic lic-' + Lc[1]} title={zh ? licZh(m[4]) : m[4]}>{Lc[0]}</span></div>
                  <div className="mm" role="cell"><div className="mm-top"><span className="tier"><i className={'tier-dot t' + t} />{TN[t][0]}{mtight(m[7]) && <em title={tr('Within 10% of the card: little room for long chats', '离显存上限不到 10%，长对话余量很少')}> {tr('tight', '偏紧')}</em>}</span><span className="mono" title={m[6]}>{mfmt(m[7])}</span></div>{meter(m[7])}</div>
                  <div className="mz" role="cell">{pp && <A className="link msz" to="/advisor/2" onClick={() => sizeModel(i)} aria-label={tr(`Size ${m[1]} in the Advisor`, `在选卡向导里估算 ${m[1]}`)}>{tr('Size', '估算')} <Ico id="i-arrow" /></A>}</div>
                </div>); })}
            </div></section>); })}
        {!rows.length && <div className="panel mempty"><h3>{tr('No models match these filters', '没有符合条件的模型')}</h3><p>{tr('Try a broader GPU size or license, or clear the search.', '放宽显存或许可证条件，或者清空搜索。')}</p><button className="btn btn-line btn-sm" onClick={() => setMF({ cat: '', q: '', tier: 0, lic: '' })}>{tr('Clear filters', '清空筛选')}</button></div>}
        <details className="mnotes"><summary>{tr('Method and sources', '方法与来源')}</summary><ul>
          <li>{tr('Memory ≈ 0.55 GB per billion parameters at 4-bit. Long chats and many users need more: ', '4-bit 下每十亿参数约 0.55 GB 显存。长对话和多用户需要更多：')}<A className="link" to="/advisor/1">{tr('use the Advisor', '用选卡向导估算')}</A>.</li>
          <li>{tr('Mixture-of-experts models load every parameter; active parameters only set the speed.', '混合专家模型要加载全部参数；激活参数只影响速度。')}</li>
          <li>{tr('Late-2026 figures come from public roundups. Check the model card before commercial use.', '2026 年下半年的数据来自公开汇总，商用前请核对模型卡。')}</li></ul>
          <p className="note">{tr('Sources: ', '来源：')}<a href="https://www.morphllm.com/open-source-ai-models" target="_blank" rel="noopener">Morph</a> · <a href="https://geotoolbox.ai/blog/best-open-source-llms" target="_blank" rel="noopener">GeoToolbox</a> · <a href="https://ltx.io/blog/open-source-video-generation-models-guide" target="_blank" rel="noopener">LTX</a> · <a href="https://www.3daistudio.com/state-of-ai-3d-generation-2026" target="_blank" rel="noopener">3D AI Studio</a> · <a href="https://arxiv.org/pdf/2606.03264" target="_blank" rel="noopener">PaddleOCR-VL 1.6</a> · <a href="https://developer.nvidia.com/isaac/gr00t/llm-info.md" target="_blank" rel="noopener">NVIDIA GR00T</a> · <a href="https://blog.roboflow.com/best-computer-vision-models/" target="_blank" rel="noopener">Roboflow</a>. {tr('Checked November 2026.', '2026 年 11 月核对。')}</p></details>
      </div>
    </>
  );
}
