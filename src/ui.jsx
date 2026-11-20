import { Link } from 'react-router-dom';
import { useLang } from './i18n.jsx';

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
    ext: ['st-ds', 'i-ds', tr('Published', '公开数据')],
  }[t];
  return <span className={'st ' + m[0]}><svg><use href={'#' + m[1]} /></svg>{m[2]}</span>;
}

/* Language-aware link */
export function A({ to, ...rest }) {
  const { p } = useLang();
  return <Link to={p(to)} {...rest} />;
}

export const img = (name) => `/img/${name}.webp`;
