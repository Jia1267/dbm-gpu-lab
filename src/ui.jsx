import { Link } from 'react-router-dom';
import { useLang } from './i18n.jsx';
import { useStore } from './store.js';
import { app, toggleCmp } from './state.js';

export const Ico = ({ id, cls = 'i' }) => <svg className={cls}><use href={'#' + id} /></svg>;

export function St({ t }) {
  const { tr } = useLang();
  const m = {
    ver: ['st-ver', 'i-ver', tr('Verified', '已验证')],
    est: ['st-est', 'i-est', tr('Estimated', '估算')],
    nt: ['st-nt', 'i-nt', tr('Not tested', '未测试')],
    ds: ['st-ds', 'i-ds', tr('Datasheet', '规格书')],
    demo: ['st-demo', 'i-demo', tr('Demo data', '演示数据')],
    cust: ['st-ds', 'i-ds', tr('Customer-reported', '客户反馈')],
    dbm: ['st-ver', 'i-ver', tr('DBM test', 'DBM 实测')],
  }[t];
  return <span className={'st ' + m[0]}><svg><use href={'#' + m[1]} /></svg>{m[2]}</span>;
}

/* Language-aware link */
export function A({ to, ...rest }) {
  const { p } = useLang();
  return <Link to={p(to)} {...rest} />;
}

export function Ctog({ id, big }) {
  const { tr } = useLang();
  const on = useStore(app, (s) => s.sel.includes(id));
  return (
    <button className={'ctog' + (big ? ' btn btn-line' : '')} aria-pressed={on}
      onClick={() => toggleCmp(id, tr('Compare holds up to four GPUs. Remove one first.', '最多对比 4 张卡，请先移除一张。'))}>
      <span className="box"><Ico id="i-check" cls="" /></span>{big ? tr('Add to compare', '加入对比') : tr('Compare', '对比')}
    </button>
  );
}

export const gpuColor = (sel, id) => { const i = sel.indexOf(id); return i >= 0 ? ['#245AE8', '#0F8B8D', '#B7791F', '#7A3E9D'][i] : '#5C6B79'; };
export const img = (name) => `/img/${name}.webp`;
