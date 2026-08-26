import React, { useState, useMemo } from 'react';
import { Check, Search } from 'lucide-react';

export const TableQuickPicker = ({ tables = [], value, onChange, required = false }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTables = useMemo(() => {
    if (!searchTerm.trim()) return tables;
    return tables.filter((t) => t.label?.toString().toLowerCase().includes(searchTerm.toLowerCase()));
  }, [tables, searchTerm]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-txt-primary flex items-center gap-1">
          <span>رقم الطاولة</span>
          {required && <span className="text-status-danger">*</span>}
        </label>
      </div>

      {tables.length > 8 && (
        <div className="relative mb-1">
          <Search className="w-3 h-3 absolute right-2.5 top-2 text-txt-muted" />
          <input
            type="text"
            placeholder="بحث طاولة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-base/60 border border-border-default rounded-md text-[10px] pr-7 pl-2 py-0.5 text-txt-primary focus:outline-none focus:border-brand-primary"
          />
        </div>
      )}

      {tables.length === 0 ? (
        <div className="p-2 bg-bg-base/40 border border-border-default rounded-lg text-center text-[11px] text-txt-muted">
          لا توجد طاولات متاحة
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1 max-h-24 overflow-y-auto custom-scrollbar p-1 bg-bg-base/40 border border-border-default rounded-lg">
          {filteredTables.map((t) => {
            const isSelected = value === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange(t.id)}
                className={`py-1 px-1.5 rounded border text-center flex items-center justify-between transition-all relative ${
                  isSelected
                    ? 'bg-brand-primary text-slate-950 border-brand-primary font-bold shadow-sm'
                    : 'bg-bg-surface text-txt-primary border-border-default hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <span className="text-[11px] font-bold truncate">طاولة {t.label}</span>
                {isSelected && <Check className="w-3 h-3 text-slate-950 shrink-0 ml-0.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
