import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Palette, Check, X, Sun, Moon, Lock, ArrowLeftRight, SlidersHorizontal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export const ThemePaletteStudio = ({ compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('light');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const { activePaletteId, activePalette, palettes, setPalette } = useTheme();
  const modalContentRef = useRef(null);

  // Sync tab with active palette mode when opening
  useEffect(() => {
    if (isOpen && activePalette?.mode) {
      setActiveTab(activePalette.mode);
    }
  }, [isOpen, activePalette]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const lightPalettes = useMemo(() => palettes.filter((p) => p.mode === 'light'), [palettes]);
  const darkPalettes = useMemo(() => palettes.filter((p) => p.mode === 'dark'), [palettes]);
  const displayedPalettes = activeTab === 'dark' ? darkPalettes : lightPalettes;

  const handleLockDefault = () => {
    try {
      localStorage.setItem('restaurant_saas_palette', activePaletteId);
      localStorage.setItem('restaurant_saas_theme', activePalette.mode);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border shadow-xs hover:scale-[1.02] active:scale-[0.98] ${
          compact ? 'p-1.5 h-8 w-8 justify-center' : 'h-8 px-2.5 sm:px-3'
        }`}
        style={{
          background: 'var(--s2)',
          borderColor: isOpen ? 'var(--ac)' : 'var(--bd)',
          color: 'var(--t1)',
        }}
        title="استوديو المظهر والألوان (تخصيص الثيمات)"
        aria-label="استوديو الألوان والمظهر"
      >
        <Palette size={14} style={{ color: 'var(--ac)' }} />
        {!compact && (
          <>
            <span className="hidden sm:inline-block font-semibold">المظهر</span>
            <span
              className="w-2 h-2 rounded-full ring-2 ring-white/30 shrink-0"
              style={{ background: activePalette?.preview?.accent || 'var(--ac)' }}
            />
          </>
        )}
      </button>

      {/* Centered Modal Backdrop & Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Container (Always centered & responsive) */}
          <div
            dir="rtl"
            ref={modalContentRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] max-h-[90vh] rounded-3xl shadow-2xl border p-5 sm:p-6 flex flex-col animate-in zoom-in-95 duration-200"
            style={{
              background: 'var(--s1)',
              borderColor: 'var(--bd)',
              boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.75)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b mb-3.5 shrink-0" style={{ borderColor: 'var(--bd)' }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs"
                  style={{ background: 'var(--ac-bg)', color: 'var(--ac)' }}
                >
                  <SlidersHorizontal size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold flex items-center gap-1.5" style={{ color: 'var(--t1)' }}>
                    <span>استوديو المظهر والألوان</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      معاينة حية
                    </span>
                  </h3>
                  <p className="text-[11px]" style={{ color: 'var(--t3)' }}>
                    شاهد المعاينة الحية فوراً على النظام قبل الحفظ
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X size={16} style={{ color: 'var(--t2)' }} />
              </button>
            </div>

            {/* Quick Hero Twin Switcher */}
            <div
              className="p-3 rounded-2xl border mb-3 shrink-0 space-y-2"
              style={{ background: 'var(--s3)', borderColor: 'var(--bd)' }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5" style={{ color: 'var(--t1)' }}>
                  <ArrowLeftRight size={13} style={{ color: 'var(--ac)' }} />
                  <span>المقارنة السريعة للأنماط المعتمدة:</span>
                </span>
                <span className="text-[10px]" style={{ color: 'var(--t3)' }}>
                  تبديل فوري
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPalette('studio-graphite');
                    setActiveTab('light');
                  }}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                    activePaletteId === 'studio-graphite'
                      ? 'ring-2 ring-slate-900 bg-white text-slate-900 shadow-md border-slate-400 scale-[1.02]'
                      : 'bg-white/80 text-slate-700 hover:bg-white border-slate-200'
                  }`}
                >
                  <Sun size={14} className="text-amber-500" />
                  <span>☀️ النهاري (أبيض ناصع)</span>
                  {activePaletteId === 'studio-graphite' && <Check size={13} className="text-emerald-600 stroke-[3]" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPalette('true-black-minimal');
                    setActiveTab('dark');
                  }}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                    activePaletteId === 'true-black-minimal'
                      ? 'ring-2 ring-white bg-black text-white shadow-md border-neutral-700 scale-[1.02]'
                      : 'bg-black/90 text-neutral-300 hover:bg-black border-neutral-800'
                  }`}
                >
                  <Moon size={14} className="text-neutral-300" />
                  <span>🌙 أسود دارك خالص</span>
                  {activePaletteId === 'true-black-minimal' && <Check size={13} className="text-emerald-400 stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* Mode Tabs */}
            <div
              className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl mb-3 shrink-0 border"
              style={{ background: 'var(--s3)', borderColor: 'var(--bd)' }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('light')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'light'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                <Sun size={14} className="text-amber-500" />
                <span>☀️ الثيمات الفاتحة (Light)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-600 font-mono font-bold">
                  {lightPalettes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dark')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'dark'
                    ? 'bg-slate-900 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon size={14} className="text-indigo-400" />
                <span>🌙 الثيمات الداكنة (Dark)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/25 text-indigo-300 font-mono font-bold">
                  {darkPalettes.length}
                </span>
              </button>
            </div>

            {/* Scrollable Palette Cards Grid */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar min-h-0">
              {displayedPalettes.map((p) => {
                const isSelected = p.id === activePaletteId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPalette(p.id)}
                    className={`w-full p-3 rounded-2xl border text-right transition-all flex items-center justify-between gap-3.5 cursor-pointer group relative overflow-hidden ${
                      isSelected
                        ? 'ring-2 ring-offset-2 scale-[1.01] shadow-md'
                        : 'hover:border-slate-500 opacity-90 hover:opacity-100'
                    }`}
                    style={{
                      background: p.preview.bg,
                      borderColor: isSelected ? p.preview.accent : p.preview.border,
                      ringColor: isSelected ? p.preview.accent : 'transparent',
                    }}
                  >
                    {/* Visual UI Micro-Mockup Card */}
                    <div
                      className="w-14 h-11 rounded-lg border flex flex-col justify-between p-1.5 shrink-0 shadow-inner"
                      style={{
                        background: p.preview.surface,
                        borderColor: p.preview.border,
                      }}
                      title="معاينة مصغرة لشكل الكروت والأزرار"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-4 h-1.5 rounded-full" style={{ background: p.preview.accent }} />
                        <div className="w-2 h-1.5 rounded-full opacity-40" style={{ background: p.vars['--text-primary'] || '#fff' }} />
                      </div>
                      <div
                        className="w-full h-3 rounded flex items-center justify-center text-[7px] font-bold"
                        style={{
                          background: p.preview.accent,
                          color: p.vars['--text-inverted'] || '#fff',
                        }}
                      >
                        POS
                      </div>
                    </div>

                    {/* Palette details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold truncate" style={{ color: p.vars['--text-primary'] || '#fff' }}>
                          {p.name}
                        </span>
                      </div>
                      <span
                        className="text-[10px] block truncate opacity-75 mt-0.5"
                        style={{ color: p.vars['--text-muted'] || '#94a3b8' }}
                      >
                        {p.badge}
                      </span>
                    </div>

                    {/* Checkmark or Preview text */}
                    <div className="shrink-0">
                      {isSelected ? (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-75"
                          style={{
                            background: p.preview.accent,
                            color: p.vars['--text-inverted'] || '#000',
                          }}
                        >
                          <Check size={14} strokeWidth={3} />
                        </div>
                      ) : (
                        <span
                          className="text-[10px] font-bold px-2 py-1 rounded-md opacity-60 group-hover:opacity-100 transition-opacity border"
                          style={{
                            borderColor: p.preview.border,
                            color: p.vars['--text-muted'] || '#aaa',
                          }}
                        >
                          معاينة
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Lock & Save Action Footer */}
            <div className="mt-3.5 pt-3.5 border-t shrink-0 space-y-2" style={{ borderColor: 'var(--bd)' }}>
              <button
                type="button"
                onClick={handleLockDefault}
                className="w-full py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
                style={{
                  background: 'var(--ac)',
                  color: 'var(--text-inverted)',
                }}
              >
                <Lock size={14} />
                <span>
                  {savedSuccess
                    ? '✓ تم حفظ وتثبيت هذا الثيم للنظام بنجاح!'
                    : `تثبيت الثيم الحالي (${activePalette?.name}) كافتراضي`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
