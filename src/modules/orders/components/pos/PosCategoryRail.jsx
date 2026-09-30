import React from 'react';
import { Utensils, Pizza, Coffee, Beef, Sparkles, Layers } from 'lucide-react';
const ICONS = { pizza: Pizza, burgers: Beef, burger: Beef, drinks: Coffee, beverages: Coffee };
export const PosCategoryRail = ({ categories = [], activeCategory = 'ALL', onSelectCategory }) => (
  <aside className="w-[200px] shrink-0 flex flex-col" style={{ background: 'var(--s1)', borderLeft: '1px solid var(--bd)' }}>
    <div className="h-11 px-3 flex items-center gap-2 shrink-0" style={{ borderBottom: '1px solid var(--bd)' }}>
      <Layers size={13} style={{ color: 'var(--ac)' }} />
      <span className="text-[11px] font-black tracking-wide" style={{ color: 'var(--t1)' }}>التصنيفات</span>
      <span className="mr-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'var(--s2)', color: 'var(--t3)', border: '1px solid var(--bd)' }}>{categories.length + 1}</span>
    </div>
    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
      <button type="button" onClick={() => onSelectCategory('ALL')}
        className="w-full h-9 px-3 rounded-xl text-right font-black text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
        style={activeCategory === 'ALL' ? { background: 'var(--ac)', color: 'var(--ti, #ffffff)' } : { color: 'var(--t2)' }}>
        <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={activeCategory === 'ALL' ? { background: 'rgba(128,128,128,.22)' } : { background: 'var(--s2)', border: '1px solid var(--bd)' }}><Sparkles size={13} /></span>
        جميع الأصناف
      </button>
      {categories.map((c) => {
        const sel = activeCategory === c.id;
        const Icon = ICONS[(c.name || '').toLowerCase()] || Utensils;
        return (
          <button key={c.id} type="button" onClick={() => onSelectCategory(c.id)}
            className="w-full h-9 px-3 rounded-xl text-right font-black text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
            style={sel ? { background: 'var(--ac)', color: 'var(--ti, #ffffff)' } : { color: 'var(--t2)' }}>
            <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={sel ? { background: 'rgba(128,128,128,.22)' } : { background: 'var(--s2)', border: '1px solid var(--bd)' }}><Icon size={13} /></span>
            <span className="truncate">{c.name}</span>
          </button>
        );
      })}
    </div>
  </aside>
);
