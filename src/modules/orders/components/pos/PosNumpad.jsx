import React, { useState } from 'react';
import { Delete, Banknote } from 'lucide-react';
const QUICK = [50, 100, 200, 500];
export const PosNumpad = ({ totalAmount = 0 }) => {
  const [val, setVal] = useState('');
  const press = (k) => {
    if (k === 'DEL') return setVal((p) => p.slice(0, -1));
    if (k === 'C') return setVal('');
    setVal((p) => p.length >= 7 ? p : p + k);
  };
  const paid = Number(val || 0);
  const change = paid >= totalAmount && totalAmount > 0 ? paid - totalAmount : null;
  return (
    <div className="rounded-2xl p-2.5 flex flex-col gap-2" style={{ background: 'var(--s2)', border: '1px solid var(--bd)' }}>
      <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
        <button type="button" onClick={() => setVal(String(Math.round(totalAmount)))} className="px-3 py-1.5 rounded-full text-[11px] font-black whitespace-nowrap cursor-pointer shrink-0" style={{ background: 'var(--ac)', color: 'var(--ti, #ffffff)' }}>بالضبط {Math.round(totalAmount)}</button>
        {QUICK.map((b) => <button key={b} type="button" onClick={() => setVal(String(b))} className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer shrink-0" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', color: 'var(--t1)' }}>{b}</button>)}
        <button type="button" onClick={() => setVal('')} className="px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer shrink-0" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', color: 'var(--t3)' }}>مسح</button>
      </div>
      <div className="rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ background: 'var(--s1)', border: '1px solid var(--bd)' }}>
        <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--t3)' }}><Banknote size={14} style={{ color: 'var(--ac)' }} /> المدفوع</span>
        <span className="font-black text-sm" style={{ color: 'var(--t1)' }}>{val || '0'} <span className="text-[10px]" style={{ color: 'var(--t3)' }}>ج.م</span></span>
      </div>
      {change !== null && <div className="rounded-xl px-3 py-2 flex items-center justify-between text-xs font-black" style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.25)', color: '#10b981' }}><span>الباقي</span><span>{change.toFixed(0)} ج.م</span></div>}
      <div className="grid grid-cols-3 gap-1.5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'DEL'].map((k) => (
          <button key={k} type="button" onClick={() => press(k)} className={`h-9 rounded-xl font-black text-sm flex items-center justify-center cursor-pointer active:scale-95 transition-transform ${k === 'DEL' ? '' : ''}`} style={k === 'DEL' ? { background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444' } : { background: 'var(--s1)', border: '1px solid var(--bd)', color: 'var(--t1)' }}>
            {k === 'DEL' ? <Delete size={14} /> : k}
          </button>
        ))}
      </div>
    </div>
  );
};
