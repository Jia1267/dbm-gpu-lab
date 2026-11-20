import { createContext, useContext } from 'react';

/* Language comes from the URL: /zh/... is Chinese, everything else English.
   tr(en, zh) picks inline copy; L(v) picks from a {en, zh} value (plain strings pass through); p(path) adds the language prefix. */
const Ctx = createContext({ lang: 'en' });
export const LangProvider = Ctx.Provider;

export function useLang() {
  const { lang } = useContext(Ctx);
  const zh = lang === 'zh';
  return {
    lang,
    zh,
    tr: (en, zhs) => (zh ? zhs : en),
    L: (v) => (v == null ? '' : typeof v === 'object' ? (zh ? v.zh ?? v.en : v.en) : v),
    p: (path) => (zh ? '/zh' + (path === '/' ? '' : path) : path),
  };
}

/* Strip the language prefix so the other language's link keeps the same page */
export const basePath = (pathname) => pathname.replace(/^\/zh(?=\/|$)/, '') || '/';
