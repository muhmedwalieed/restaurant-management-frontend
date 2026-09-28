import React from 'react';
import { Eye } from 'lucide-react';

export const TemplateLivePreview = ({ previewText }) => {
  return (
    <div className="space-y-1.5 pt-1">
      <label className="text-xs font-semibold text-txt-primary flex items-center gap-1">
        <Eye className="w-3.5 h-3.5 text-txt-dim" />
        <span>معاينة حية للنص كما يظهر للعميل:</span>
      </label>
      <div className="p-3.5 rounded-lg bg-bg-base/70 border border-border-default/80 text-xs text-txt-primary leading-relaxed whitespace-pre-wrap font-sans min-h-[70px]">
        {previewText || <span className="text-txt-dim italic">اكتب نص القالب للمعاينة الحية هنا...</span>}
      </div>
    </div>
  );
};
