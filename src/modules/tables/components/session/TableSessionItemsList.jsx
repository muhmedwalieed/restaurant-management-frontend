import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';

export const EditableItemRow = ({ item, onUpdate, onRemove }) => (
  <div className="flex items-center justify-between gap-2 bg-bg-base/60 border border-border-subtle rounded-lg p-2 text-xs">
    <div className="min-w-0 flex-1">
      <p className="font-semibold text-txt-primary truncate">{item.productName}</p>
      <p className="text-[11px] text-txt-muted">
        {item.quantity} × {Number(item.unitPrice).toFixed(2)} = {Number(item.total).toFixed(2)}
      </p>
      {item.addedByName && <p className="text-[11px] text-brand-primary">{item.addedByName} أضافها</p>}
    </div>
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={() => onUpdate(item.id, Math.max(1, item.quantity - 1))}
        className="w-5 h-5 rounded border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
      >
        <Minus className="w-3 h-3" />
      </button>
      <button
        type="button"
        onClick={() => onUpdate(item.id, item.quantity + 1)}
        className="w-5 h-5 rounded border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
      >
        <Plus className="w-3 h-3" />
      </button>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="w-5 h-5 rounded hover:text-red-400 flex items-center justify-center cursor-pointer transition-colors"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  </div>
);

export const ReadonlyItemRow = ({ item }) => (
  <div className="flex items-center justify-between gap-2 bg-bg-base/60 border border-border-subtle rounded-lg p-2 text-xs">
    <div className="min-w-0 flex-1">
      <p className="font-semibold text-txt-primary truncate">{item.productName}</p>
      <p className="text-[11px] text-txt-muted">
        {item.quantity} × {Number(item.unitPrice).toFixed(2)} = {Number(item.total).toFixed(2)}
      </p>
      {item.addedByName && <p className="text-[11px] text-brand-primary">{item.addedByName} أضافها</p>}
    </div>
    <span className="font-mono font-bold text-txt-primary shrink-0">{Number(item.total).toFixed(2)}</span>
  </div>
);
