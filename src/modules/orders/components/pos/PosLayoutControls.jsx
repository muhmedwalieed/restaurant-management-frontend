import React from 'react';
import { LayoutGrid, Grid2X2, List, Calculator, Columns, SquareDashedBottomCode } from 'lucide-react';
export const PosLayoutControls = ({ layoutMode = 'modern-operational', onChangeLayoutMode, cardDensity = 'visual-cards', onChangeCardDensity }) => (
  <div className="flex items-center gap-1.5 shrink-0">
    <div className="flex items-center p-1 rounded-full" style={{ background: 'var(--s2)', border: '1px solid var(--bd)' }}>
      <button type="button" onClick={() => onChangeLayoutMode('modern-operational')} className="px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1 cursor-pointer" style={layoutMode === 'modern-operational' ? { background: 'var(--ac)', color: 'var(--ti, #ffffff)' } : { color: 'var(--t3)' }}><LayoutGrid size={12} /><span className="hidden xl:inline">عصري</span></button>
      <button type="button" onClick={() => onChangeLayoutMode('fast-touch-numpad')} className="px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1 cursor-pointer" style={layoutMode === 'fast-touch-numpad' ? { background: 'var(--ac)', color: 'var(--ti, #ffffff)' } : { color: 'var(--t3)' }}><Calculator size={12} /><span className="hidden xl:inline">نقد</span></button>
      <button type="button" onClick={() => onChangeLayoutMode('vertical-rail')} className="px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1 cursor-pointer" style={layoutMode === 'vertical-rail' ? { background: 'var(--ac)', color: 'var(--ti, #ffffff)' } : { color: 'var(--t3)' }}><Columns size={12} /><span className="hidden xl:inline">عمودي</span></button>
    </div>
    <div className="w-px h-5 hidden sm:block" style={{ background: 'var(--bd)' }} />
    <div className="flex items-center p-1 rounded-full" style={{ background: 'var(--s2)', border: '1px solid var(--bd)' }}>
      <button type="button" onClick={() => onChangeCardDensity('visual-cards')} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer" style={cardDensity === 'visual-cards' ? { background: 'var(--ac)', color: 'var(--ti, #ffffff)' } : { color: 'var(--t3)' }}><SquareDashedBottomCode size={13} /></button>
      <button type="button" onClick={() => onChangeCardDensity('compact-grid')} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer" style={cardDensity === 'compact-grid' ? { background: 'var(--ac)', color: 'var(--ti, #ffffff)' } : { color: 'var(--t3)' }}><Grid2X2 size={13} /></button>
      <button type="button" onClick={() => onChangeCardDensity('list-rows')} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer" style={cardDensity === 'list-rows' ? { background: 'var(--ac)', color: 'var(--ti, #ffffff)' } : { color: 'var(--t3)' }}><List size={13} /></button>
    </div>
  </div>
);
