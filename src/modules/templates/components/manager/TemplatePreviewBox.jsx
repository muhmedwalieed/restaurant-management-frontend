import React from 'react';
import { Eye, Check } from 'lucide-react';
import { renderDynamicPreview } from '../../utils/templateContextResolver.js';

export const TemplatePreviewBox = ({ text, context }) => {
  const rendered = renderDynamicPreview(text, context);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1 text-[11px] font-bold text-txt-muted">
        <Eye className="w-3.5 h-3.5 text-brand-primary" />
        <span>معاينة حية كما ستصل للعميل:</span>
      </div>
      <div className="p-3.5 rounded-xl bg-slate-950/40 border border-border-default/60 space-y-2">
        <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-lg p-3 text-xs leading-relaxed text-emerald-100 whitespace-pre-wrap font-sans shadow-inner">
          {rendered || <span className="text-txt-dim italic">نص القالب فارغ...</span>}
          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-emerald-400/70 font-mono">
            <span>الآن</span>
            <div className="flex -space-x-1">
              <Check className="w-3 h-3 text-emerald-400" />
              <Check className="w-3 h-3 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
