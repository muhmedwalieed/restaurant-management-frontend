import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

const ItemModifiers = ({ item }) => {
  if (!item?.modifiers || item.modifiers.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {item.modifiers.map((m, idx) => (
        <span
          key={idx}
          className="text-[10px] px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
        >
          {m.name || m.optionName} {Number(m.price || 0) > 0 ? `(+${m.price} EGP)` : ''}
        </span>
      ))}
    </div>
  );
};

export const OrderItemsTable = ({ order, orderRounds = [] }) => {
  if (!order) return null;

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-border-default flex items-center justify-between bg-bg-base/40">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-brand-primary shrink-0" />
          <h3 className="text-xs font-bold text-txt-primary">الأصناف المطلوبة</h3>
        </div>
        <span className="text-xs text-txt-muted">
          {order?.items?.length || 0} أصناف
          {orderRounds.length > 1 ? ` • ${orderRounds.length} طلبات/جولات` : ''}
        </span>
      </div>

      {/* Multi-round or single list */}
      {orderRounds.length > 1 ? (
        <div className="divide-y divide-white/[0.06]">
          {orderRounds.map((round) => (
            <div key={round.round} className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-txt-primary">
                  {round.round === 1 ? 'الطلب الأول' : `الطلب ${round.round === 2 ? 'الثاني' : `#${round.round}`}`}
                  <span className="text-[11px] font-semibold text-txt-muted mr-1">(جولة {round.round})</span>
                </h4>
                <span className="text-[11px] font-mono font-bold text-txt-primary" dir="ltr">
                  حساب الطلب: {round.subtotal.toFixed(2)} EGP
                </span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border-subtle">
                <table className="w-full text-xs text-right">
                  <thead className="bg-bg-base/60 text-txt-muted border-b border-border-default select-none">
                    <tr>
                      <th className="px-4 py-2 font-semibold">الصنف</th>
                      <th className="px-4 py-2 font-semibold text-center w-20">الكمية</th>
                      <th className="px-4 py-2 font-semibold text-left w-28">السعر</th>
                      <th className="px-4 py-2 font-semibold text-left w-28">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {round.items.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-txt-primary">{item.productName || item.name}</span>
                            {item.notes && (
                              <span className="text-[11px] text-txt-muted mt-0.5">
                                ملاحظات: {item.notes}
                              </span>
                            )}
                            <ItemModifiers item={item} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-txt-primary">
                          {item.quantity}×
                        </td>
                        <td className="px-4 py-3 text-left font-mono tabular-nums text-txt-muted">
                          {Number(item.unitPrice || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-left font-mono font-bold tabular-nums text-txt-primary">
                          {Number(item.subtotal || item.total || 0).toFixed(2)} EGP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-bg-base/60 text-txt-muted border-b border-border-default select-none">
              <tr>
                <th className="px-4 py-2.5 font-semibold">الصنف</th>
                <th className="px-4 py-2.5 font-semibold text-center w-20">الكمية</th>
                <th className="px-4 py-2.5 font-semibold text-left w-28">السعر</th>
                <th className="px-4 py-2.5 font-semibold text-left w-28">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {order?.items?.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-txt-primary">{item.productName || item.name}</span>
                      {item.notes && (
                        <span className="text-[11px] text-txt-muted mt-0.5">
                          ملاحظات: {item.notes}
                        </span>
                      )}
                      <ItemModifiers item={item} />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono font-bold text-txt-primary">
                    {item.quantity}×
                  </td>
                  <td className="px-4 py-3.5 text-left font-mono tabular-nums text-txt-muted">
                    {Number(item.unitPrice || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 text-left font-mono font-bold tabular-nums text-txt-primary">
                    {Number(item.subtotal || item.total || 0).toFixed(2)} EGP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Financial Summary */}
      <div className="p-4 border-t border-white/[0.08] bg-bg-base/30 space-y-2 text-xs">
        <div className="flex items-center justify-between text-txt-muted">
          <span>المجموع الفرعي:</span>
          <span className="font-mono tabular-nums">{Number(order?.subtotal || order?.total || 0).toFixed(2)} EGP</span>
        </div>
        {Number(order?.tax || 0) > 0 && (
          <div className="flex items-center justify-between text-txt-muted">
            <span>الضريبة:</span>
            <span className="font-mono tabular-nums">{Number(order.tax).toFixed(2)} EGP</span>
          </div>
        )}
        {Number(order?.deliveryFee || 0) > 0 && (
          <div className="flex items-center justify-between text-txt-muted">
            <span>رسوم التوصيل:</span>
            <span className="font-mono tabular-nums">{Number(order.deliveryFee).toFixed(2)} EGP</span>
          </div>
        )}
        {Number(order?.discount || 0) > 0 && (
          <div className="flex items-center justify-between text-emerald-400 font-medium">
            <span>الخصم:</span>
            <span className="font-mono tabular-nums">-{Number(order.discount).toFixed(2)} EGP</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-sm font-bold text-txt-primary">
          <span>المبلغ الإجمالي الكلي:</span>
          <span className="font-mono text-base text-brand-primary tabular-nums">
            {Number(order?.total || 0).toFixed(2)} EGP
          </span>
        </div>
      </div>
    </div>
  );
};
