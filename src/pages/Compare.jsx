import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../i18n.jsx';
import { useStore } from '../store.js';
import { app } from '../state.js';
import { GPUS, G, fmt } from '../data/gpus.js';
import { SCEN } from '../data/workloads.js';
import { Ico, A, St, img, gpuColor } from '../ui.jsx';
import { FitCell } from './Detail.jsx';

export default function Compare() {
  const { ids } = useParams();
  const { tr, L, p } = useLang();
  const nav = useNavigate();
  const sel = useStore(app, (s) => s.sel);
  const [diffOnly, setDiff] = useState(false);

  /* URL is the source of truth when it names GPUs; keep it in sync with the selection */
  useEffect(() => { if (ids) { const v = ids.split(',').filter(G).slice(0, 4); if (v.length && v.join() !== sel.join()) app.set({ sel: v }); } }, [ids]);
  useEffect(() => { const want = sel.length ? '/compare/' + sel.join(',') : '/compare'; if ((ids ? '/compare/' + ids : '/compare') !== want) nav(p(want), { replace: true }); }, [sel]);
  useEffect(() => { document.title = tr('Compare GPUs', 'GPU 对比') + ' · DBM GPU Lab'; });

  const Lg = sel.map(G);
  const color = (g) => gpuColor(sel, g.id);
  const head = (
    <div className="page-head"><div className="wrap"><div className="crumb"><A to="/">{tr('Home', '首页')}</A> / {tr('Compare', '对比')}</div><h1>{tr('Compare GPUs', 'GPU 对比')}</h1>
      <div className="cmp-tools"><div className="mono note">{tr(`${Lg.length} of 4 selected`, `已选 ${Lg.length}/4`)}</div>{Lg.length >= 2 && <button className="switch" role="switch" aria-checked={diffOnly} onClick={() => setDiff(!diffOnly)}><span className="tr" />{tr('Show differences only', '只看不同项')}</button>}</div></div></div>
  );
  if (Lg.length < 2) {
    return <>{head}<div className="wrap" style={{ paddingTop: 40, paddingBottom: 96 }}><div className="empty" style={{ background: 'var(--surface)' }}><b>{Lg.length ? tr('Add one more GPU to compare', '再加一张卡就能对比') : tr('Pick at least two GPUs', '至少选两张卡')}</b>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 18 }}>
        {[['rtx-4090', 'rtx-5090'], ['rtx-a6000', 'rtx-pro-5000'], ['a100-80', 'h100-pcie'], ['rtx-4060', 'rtx-5060']].map((pr) => <button key={pr} className="btn btn-line btn-sm" onClick={() => app.set({ sel: pr })}>{G(pr[0]).name} vs {G(pr[1]).name}</button>)}
        <A className="btn btn-primary btn-sm" to="/gpus">{tr('Open Explorer', '打开 GPU 列表')}</A></div></div></div></>;
  }
  const maxV = Math.max(...Lg.map((g) => g.vtot)), maxB = Math.max(...Lg.map((g) => g.bw));
  const hb = (key, max, unit) => Lg.map((g) => (
    <div className="hb" key={g.id}><span className="n"><span className="sw" style={{ background: color(g) }} />{g.name}</span><div className="trk"><div className="fill" style={{ width: `calc(${g[key] / max * 100}% - 80px)`, background: color(g) }} /><span className="v" style={{ left: `calc(${g[key] / max * 100}% - 80px)` }}>{fmt(g[key])} {unit}</span></div></div>
  ));
  const yes = tr('Yes', '有'), no = tr('No', '无');
  const SPEC = [[tr('Hardware', '硬件'), null], [tr('Architecture', '架构'), (g) => g.arch], [tr('GPU memory', '显存'), (g) => g.memL, (g) => g.vtot, 'max'], [tr('Bandwidth', '带宽'), (g) => `${fmt(g.bw)} GB/s`, (g) => g.bw, 'max'], [tr('CUDA cores', 'CUDA 核心'), (g) => fmt(g.cuda), (g) => g.cuda, 'max'], [tr('Tensor cores', 'Tensor 核心'), (g) => (g.tensor ? fmt(g.tensor) : '—'), (g) => g.tensor, 'max'], [tr('RT cores', 'RT 核心'), (g) => (g.rt ? fmt(g.rt) : '—'), (g) => g.rt, 'max'],
    [tr('FP32 peak', 'FP32 峰值'), (g) => (g.fp32 != null ? `${g.fp32} TF` : 'n/p'), (g) => g.fp32 || 0, 'max'], [tr('FP64 peak', 'FP64 峰值'), (g) => (g.fp64 != null ? `${g.fp64} TF` : tr('Low', '低')), (g) => g.fp64 || 0, 'max'],
    [tr('Max board power', '最大功耗'), (g) => `${g.tdp} W`, (g) => g.tdp, 'min'], [tr('Interface', '接口'), (g) => g.pcie], [tr('Form factor', '外形'), (g) => g.slots], [tr('Cooling', '散热'), (g) => g.cool], [tr('ECC memory', 'ECC 显存'), (g) => (g.ecc ? yes : no)], ['NVENC', (g) => (g.nvenc === true ? yes : g.nvenc === false ? no : tr('Not listed', '未列出'))], ['NVLink', (g) => (g.nvlink ? yes : no)], ['MIG', (g) => (g.mig ? yes : no)]];
  const extra = Lg.length < 4;
  const minT = Math.min(...Lg.map((x) => x.tdp));
  const strengths = (g) => { const o = [];
    if (g.vtot === maxV) o.push(tr(`Most memory here (${g.memL}).`, `显存最大（${g.memL}）。`));
    if (g.fp64 >= 2 && g.fp64 === Math.max(...Lg.map((x) => x.fp64 || 0))) o.push(tr(`Highest FP64 here (${g.fp64} TFLOPS).`, `FP64 最高（${g.fp64} TFLOPS）。`));
    if (g.rt && g.rt === Math.max(...Lg.map((x) => x.rt))) o.push(tr(`Most RT cores (${g.rt}).`, `RT 核心最多（${g.rt}）。`));
    if (g.bw === maxB) o.push(tr(`Highest bandwidth (${fmt(g.bw)} GB/s).`, `带宽最高（${fmt(g.bw)} GB/s）。`));
    if (g.tdp === minT) o.push(tr(`Lowest board power (${g.tdp} W).`, `功耗最低（${g.tdp} W）。`));
    if (g.ecc && Lg.some((x) => !x.ecc)) o.push(tr('ECC memory, unlike the consumer cards here.', '有 ECC 显存，消费级卡没有。'));
    if (!g.ecc) o.push(tr('Limitation: no ECC; not built for 24/7 duty.', '限制：没有 ECC，不是为 7×24 运行设计。'));
    if (g.cool === 'Passive') o.push(tr('Limitation: passive cooling — needs server airflow.', '限制：被动散热，需要服务器风道。'));
    if (!g.gfx) o.push(tr('Limitation: compute-only — no graphics, gaming or CAD.', '限制：纯计算卡，不能做图形、游戏或 CAD。'));
    return o; };

  const rowsOut = [];
  SPEC.forEach(([label, fn, raw, best]) => {
    if (!fn) { rowsOut.push(<tr className="grp" key={label}><th colSpan={Lg.length + 1 + (extra ? 1 : 0)}>{label}</th></tr>); return; }
    const vals = Lg.map((g) => fn(g)), same = vals.every((v) => v === vals[0]);
    if (diffOnly && same) return;
    let bi = -1; if (best) { const r = Lg.map(raw), t = best === 'max' ? Math.max(...r) : Math.min(...r); if (r.filter((x) => x === t).length === 1) bi = r.indexOf(t); }
    rowsOut.push(<tr key={label}><th scope="row">{label}</th>{vals.map((v, i) => <td key={i} className={i === bi ? 'best' : ''}>{v}</td>)}{extra && <td />}</tr>);
  });
  rowsOut.push(<tr className="grp" key="fit"><th colSpan={Lg.length + 1 + (extra ? 1 : 0)}>{tr('Workload fit — estimated', '工作负载匹配 — 估算')}</th></tr>);
  SCEN.forEach((sc, i) => rowsOut.push(<tr key={'s' + i}><th scope="row">{L(sc.t)}<br /><span className="mono" style={{ fontSize: 12 }}>{sc.s}</span></th>{Lg.map((g) => <td key={g.id}><FitCell g={g} sc={sc} /></td>)}{extra && <td />}</tr>));
  rowsOut.push(<tr className="grp" key="perf"><th colSpan={Lg.length + 1 + (extra ? 1 : 0)}>{tr('Measured performance', '实测性能')}</th></tr>);
  rowsOut.push(<tr key="llmt"><th scope="row">{tr('LLM throughput', '大模型吞吐量')}</th>{Lg.map((g) => <td key={g.id}><St t="nt" /></td>)}{extra && <td />}</tr>);

  return (
    <>{head}
      <div className="wrap" style={{ paddingTop: 32, paddingBottom: 96 }}>
        <div className="kd"><div className="panel"><h3>{tr('Memory capacity', '显存容量')} <small>GB · {tr('datasheet', '规格书')}</small></h3><div className="hbars">{hb('vtot', maxV, 'GB')}</div></div>
          <div className="panel"><h3>{tr('Memory bandwidth', '显存带宽')} <small>GB/s · {tr('datasheet', '规格书')}</small></h3><div className="hbars">{hb('bw', maxB, 'GB/s')}</div></div></div>
        <div className="ctable-wrap" style={{ marginTop: 40 }}><table className="ct"><thead><tr><th scope="col" style={{ width: '22%' }}><span className="note">▲ {tr('best in row', '该行最佳')}</span></th>
          {Lg.map((g) => <th scope="col" key={g.id}><div className="colh"><div className="ph"><img src={img(g.img)} alt="" /></div><div className="nm"><span className="sw" style={{ background: color(g) }} /><A to={'/gpu/' + g.id}>{g.name}</A><button className="x" onClick={() => app.set({ sel: sel.filter((x) => x !== g.id) })} aria-label={tr('Remove ', '移除 ') + g.name}><Ico id="i-x" /></button></div></div></th>)}
          {extra && <th scope="col"><div className="addcol"><select className="sel" value="" onChange={(e) => e.target.value && app.set({ sel: [...sel, e.target.value] })} aria-label={tr('Add a GPU', '添加 GPU')}><option value="">+ {tr('Add GPU', '添加 GPU')}</option>{GPUS.filter((g) => !sel.includes(g.id)).map((g) => <option key={g.id} value={g.id}>{g.name} · {g.vtot} GB</option>)}</select></div></th>}</tr></thead>
          <tbody>{rowsOut}</tbody></table></div>
        <section style={{ marginTop: 56 }}><div className="sec-head" style={{ marginBottom: 12 }}><div><h2 style={{ fontSize: 24 }}>{tr('Summary', '总结')}</h2></div><A className="btn btn-primary" to="/advisor/1">{tr('Check against my workload', '用我的工作负载来检查')} <Ico id="i-arrow" /></A></div>
          <div>{Lg.map((g) => <div className="verdict" key={g.id}><div className="n"><span className="sw" style={{ background: color(g) }} />{g.name}</div><ul>{(strengths(g).length ? strengths(g) : [tr('Middle option in this set.', '这组里的中间选项。')]).map((s) => <li key={s}>{s}</li>)}</ul></div>)}</div></section>
      </div>
    </>
  );
}
