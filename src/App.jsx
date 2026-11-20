import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { LangProvider, useLang, basePath } from './i18n.jsx';
import { useStore } from './store.js';
import { app } from './state.js';
import { G } from './data/gpus.js';
import { Ico, A, gpuColor } from './ui.jsx';
import Home from './pages/Home.jsx';
import Explorer from './pages/Explorer.jsx';
import Detail from './pages/Detail.jsx';
import Compare from './pages/Compare.jsx';
import Advisor from './pages/Advisor.jsx';
import Models from './pages/Models.jsx';
import Bench from './pages/Bench.jsx';
import Scenarios, { Scenario } from './pages/Scenario.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/zh/*" element={<LangProvider value={{ lang: 'zh' }}><Shell /></LangProvider>} />
      <Route path="/*" element={<LangProvider value={{ lang: 'en' }}><Shell /></LangProvider>} />
    </Routes>
  );
}

function Shell() {
  const { lang, tr } = useLang();
  const loc = useLocation();
  const [drawer, setDrawer] = useState(false);
  const base = basePath(loc.pathname);

  useEffect(() => { document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'; }, [lang]);
  useEffect(() => {
    setDrawer(false);
    const MF = app.get().MF;
    if (base === '/workloads') requestAnimationFrame(() => document.getElementById('workloads')?.scrollIntoView());
    else if (base === '/models' && MF.ret) { const y = MF.y; app.set((s) => ({ MF: { ...s.MF, ret: false } })); requestAnimationFrame(() => window.scrollTo(0, y)); }
    else if (!loc.hash) window.scrollTo(0, 0);
    if (!base.startsWith('/models') && !base.startsWith('/advisor')) app.set((s) => ({ MF: { ...s.MF, ret: false } }));
  }, [base]);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') setDrawer(false); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  return (
    <>
      <Header base={base} drawer={drawer} setDrawer={setDrawer} />
      <main id="main" key={lang}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="workloads" element={<Home />} />
          <Route path="gpus" element={<Explorer />} />
          <Route path="gpu/:id" element={<Detail />} />
          <Route path="compare/:ids?" element={<Compare />} />
          <Route path="advisor/:step?" element={<Advisor />} />
          <Route path="models" element={<Models />} />
          <Route path="benchmarks" element={<Bench />} />
          <Route path="scenarios" element={<Scenarios />} />
          <Route path="scenarios/:id" element={<Scenario />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <Tray base={base} />
      <Toast />
      <a href="#main" className="sr">{tr('Skip to content', '跳到正文')}</a>
    </>
  );
}

function Header({ base, drawer, setDrawer }) {
  const { tr, p, zh } = useLang();
  const nav = useNavigate();
  const n = useStore(app, (s) => s.sel.length);
  const [q, setQ] = useState('');
  const items = [['/gpus', tr('GPUs', 'GPU'), ['/gpus', '/gpu']], ['/scenarios', tr('Scenarios', '场景'), ['/scenarios']], ['/compare', tr('Compare', '对比'), ['/compare']], ['/workloads', tr('Workloads', '工作负载'), ['/workloads']], ['/models', tr('Models', '模型'), ['/models']], ['/benchmarks', tr('Benchmarks', '测试'), ['/benchmarks']]];
  const cur = (m) => m.some((x) => base === x || base.startsWith(x + '/'));
  const other = zh ? base : '/zh' + (base === '/' ? '' : base);
  return (
    <>
      <header className="nav">
        <div className="wrap">
          <A to="/" className="logo" aria-label="DBM GPU Lab"><svg width="28" height="28" aria-hidden="true"><use href="#i-chip" /></svg><span>DBM <small>GPU Lab</small></span></A>
          <nav className="nav-links" aria-label={tr('Primary', '主导航')}>
            {items.map(([to, label, m]) => (
              <Link key={to} to={p(to)} aria-current={cur(m) ? 'page' : undefined}>{label}{to === '/compare' && n > 0 && <span className="badge">{n}</span>}</Link>
            ))}
          </nav>
          <form className="nsearch" role="search" onSubmit={(e) => { e.preventDefault(); nav(p('/gpus') + (q ? '?q=' + encodeURIComponent(q) : '')); }}>
            <Ico id="i-search" /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('Search GPUs', '搜索 GPU')} aria-label={tr('Search GPUs', '搜索 GPU')} autoComplete="off" />
          </form>
          <Link className="lang" to={other + (base === '/gpus' ? window.location.search : '')} hrefLang={zh ? 'en' : 'zh'} aria-label={zh ? 'Switch to English' : '切换到中文'}>{zh ? 'EN' : '中文'}</Link>
          <A to="/advisor/1" className="btn btn-primary btn-sm">{tr('Find my GPU', '帮我选卡')}</A>
          <button className="burger" aria-label={tr('Open menu', '打开菜单')} aria-expanded={drawer} aria-controls="drawer" onClick={() => setDrawer(!drawer)}><Ico id="i-menu" /></button>
        </div>
      </header>
      <nav className={'drawer' + (drawer ? ' open' : '')} id="drawer" aria-label={tr('Mobile', '移动端菜单')}>
        {items.map(([to, label]) => <Link key={to} to={p(to)}>{label} <Ico id="i-arrow" /></Link>)}
        <Link to={other}>{zh ? 'English' : '中文'} <Ico id="i-arrow" /></Link>
        <Link to={p('/advisor/1')} style={{ color: 'var(--blue)' }}>{tr('Find my GPU', '帮我选卡')} <Ico id="i-arrow" /></Link>
      </nav>
    </>
  );
}

function Footer() {
  const { tr } = useLang();
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div><A className="logo" to="/" style={{ color: '#fff' }}><svg width="28" height="28" aria-hidden="true"><use href="#i-chip" /></svg><span>DBM <small style={{ color: '#8EA0B3' }}>GPU Lab</small></span></A>
            <p className="tag">{tr('GPU data and sizing for AI workloads.', '面向 AI 工作负载的 GPU 数据与选型。')}</p></div>
          <div><h5>{tr('Explore', '浏览')}</h5><ul><li><A to="/gpus">{tr('GPU Explorer', 'GPU 列表')}</A></li><li><A to="/compare">{tr('Compare', '对比')}</A></li><li><A to="/models">{tr('Open models', '开源模型')}</A></li></ul></div>
          <div><h5>{tr('Scenarios', '场景')}</h5><ul><li><A to="/scenarios/llm">{tr('LLM inference', '大模型推理')}</A></li><li><A to="/scenarios/vgpu">{tr('GPU virtualization', 'GPU 虚拟化')}</A></li><li><A to="/scenarios/streaming">{tr('Live streaming', '直播与转码')}</A></li></ul></div>
          <div><h5>{tr('Choose', '选型')}</h5><ul><li><A to="/advisor/1">{tr('GPU Advisor', '选卡向导')}</A></li><li><A to="/benchmarks">{tr('Benchmarks', '测试')}</A></li></ul></div>
          <div><h5>{tr('Company', '公司')}</h5><ul><li><a href="https://www.gpu-mart.com/" target="_blank" rel="noopener">GPU Mart</a></li><li><a href="https://www.databasemart.com/" target="_blank" rel="noopener">Database Mart</a></li></ul></div>
        </div>
        <div className="foot-bottom"><span>© 2026 Database Mart · DBM GPU Lab · {tr('Specifications vary by board partner and configuration.', '规格因板卡厂商和配置而异。')}</span></div>
      </div>
    </footer>
  );
}

function Tray({ base }) {
  const { tr, p } = useLang();
  const sel = useStore(app, (s) => s.sel);
  if (!sel.length || base.startsWith('/compare') || base.startsWith('/advisor')) return null;
  return (
    <div className="tray enter" role="region" aria-label={tr('Compare tray', '对比栏')}>
      <div className="tt"><span className="tw">{tr('Compare', '对比')}</span><span>{sel.length}/4</span></div>
      <div className="slots">{[0, 1, 2, 3].map((i) => { const g = G(sel[i]); return g
        ? <div className="slot on" key={i}><span className="sw" style={{ background: gpuColor(sel, g.id) }} /><span className="nm">{g.name}</span><span className="gb">{g.vtot} GB</span><button onClick={() => app.set({ sel: sel.filter((x) => x !== g.id) })} aria-label={tr('Remove ', '移除 ') + g.name}><Ico id="i-x" /></button></div>
        : <div className="slot" key={i}>{tr('Add GPU', '添加 GPU')}</div>; })}</div>
      <button className="clr" onClick={() => app.set({ sel: [] })}>{tr('Clear all', '清空')}</button>
      <Link to={p('/compare/' + sel.join(','))} className="btn btn-primary" aria-disabled={sel.length < 2}>{sel.length < 2 ? tr('Select one more', '再选一张') : <>{tr(`Compare ${sel.length}`, `对比 ${sel.length} 张`)} <Ico id="i-arrow" /></>}</Link>
    </div>
  );
}

function Toast() {
  const t = useStore(app, (s) => s.toast);
  if (!t) return null;
  return <div role="status" style={{ position: 'fixed', left: '50%', top: 84, transform: 'translateX(-50%)', background: 'var(--graphite)', color: '#fff', padding: '10px 16px', borderRadius: 8, fontSize: 14, zIndex: 70 }}>{t}</div>;
}
