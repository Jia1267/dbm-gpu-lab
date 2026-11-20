import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/* Custom dropdown that replaces the native <select>.
   options: [[value, label, hint?], ...]   variant: 'field' (boxed) | 'inline' (underlined, inside a sentence) */
export default function Select({ value, onChange, options, variant = 'field', id, label, className = '' }) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [act, setAct] = useState(0);
  const [pos, setPos] = useState(null);
  const btn = useRef(null);
  const list = useRef(null);
  const typed = useRef({ s: '', t: 0 });
  const cur = Math.max(0, options.findIndex((o) => String(o[0]) === String(value)));

  const place = () => {
    const r = btn.current.getBoundingClientRect();
    const h = Math.min(340, options.length * 40 + 12);
    const below = innerHeight - r.bottom - 12, above = r.top - 12;
    const up = below < h && above > below;
    const w = Math.max(r.width, variant === 'inline' ? 240 : 0);
    const left = Math.min(Math.max(8, r.left), innerWidth - w - 8);
    setPos({ left, width: w, maxH: Math.min(340, Math.max(160, up ? above : below)), ...(up ? { bottom: innerHeight - r.top + 6 } : { top: r.bottom + 6 }) });
  };
  const show = (i = cur) => { place(); setAct(i); setOpen(true); };
  const close = (focus = true) => { setOpen(false); if (focus) btn.current?.focus(); };
  const pick = (i) => { onChange(options[i][0]); close(); };

  useLayoutEffect(() => { if (open) list.current?.focus({ preventScroll: true }); }, [open]);
  useEffect(() => { if (open) list.current?.querySelector(`[data-i="${act}"]`)?.scrollIntoView({ block: 'nearest' }); }, [act, open]);
  useEffect(() => {
    if (!open) return;
    const down = (e) => { if (!list.current?.contains(e.target) && !btn.current.contains(e.target)) close(false); };
    const re = (e) => { if (!list.current?.contains(e.target)) place(); };
    document.addEventListener('pointerdown', down);
    addEventListener('scroll', re, true);
    addEventListener('resize', re);
    return () => { document.removeEventListener('pointerdown', down); removeEventListener('scroll', re, true); removeEventListener('resize', re); };
  }, [open]);

  const onBtnKey = (e) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); show(); }
  };
  const onListKey = (e) => {
    const n = options.length;
    const k = e.key;
    if (k === 'ArrowDown') setAct((a) => Math.min(n - 1, a + 1));
    else if (k === 'ArrowUp') setAct((a) => Math.max(0, a - 1));
    else if (k === 'Home') setAct(0);
    else if (k === 'End') setAct(n - 1);
    else if (k === 'Enter' || k === ' ') pick(act);
    else if (k === 'Escape') close();
    else if (k === 'Tab') { close(false); return; }
    else if (k.length === 1) {
      const t = typed.current, now = Date.now();
      t.s = (now - t.t < 600 ? t.s : '') + k.toLowerCase(); t.t = now;
      const i = options.findIndex((o) => String(o[1]).toLowerCase().startsWith(t.s));
      if (i >= 0) setAct(i);
      return;
    } else return;
    e.preventDefault();
  };

  return (
    <>
      <button ref={btn} type="button" id={id} className={(variant === 'inline' ? 'dd-inline' : 'sel dd-field') + (open ? ' on' : '') + (className ? ' ' + className : '')}
        aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? uid : undefined} aria-label={label ? `${label}: ${options[cur]?.[1]}` : undefined}
        onClick={() => (open ? close() : show())} onKeyDown={onBtnKey}>
        <span className="dd-v">{options[cur]?.[1]}</span>
        <svg className="dd-c" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && pos && createPortal(
        <ul ref={list} id={uid} role="listbox" tabIndex={-1} className={'dd-pop' + (pos.bottom != null ? ' up' : '')} aria-label={label}
          aria-activedescendant={`${uid}-${act}`} onKeyDown={onListKey}
          style={{ left: pos.left, minWidth: pos.width, maxHeight: pos.maxH, top: pos.top, bottom: pos.bottom }}>
          {options.map(([v, t, hint], i) => (
            <li key={String(v)} id={`${uid}-${i}`} data-i={i} role="option" aria-selected={i === cur} className={i === act ? 'act' : ''}
              onPointerEnter={() => setAct(i)} onClick={() => pick(i)}>
              <span className="dd-t">{t}</span>{hint && <span className="dd-h">{hint}</span>}
              <svg className="dd-k" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
            </li>
          ))}
        </ul>, document.body)}
    </>
  );
}
