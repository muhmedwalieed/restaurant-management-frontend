import React from 'react';

const getModifiers = (item) => {
  if (!item.selectedModifiers) return [];
  if (Array.isArray(item.selectedModifiers)) return item.selectedModifiers;
  if (typeof item.selectedModifiers === 'string') {
    try {
      const parsed = JSON.parse(item.selectedModifiers);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const ReceiptItemsTable = ({ items = [] }) => {
  return (
    <div className="py-2.5 border-b border-dashed border-[#ccc]">
      <table className="w-full text-right text-[11px] table-fixed" dir="rtl">
        <thead>
          <tr className="border-b border-[#ddd] text-black font-bold">
            <th className="pb-1.5 text-right w-[46%]" dir="rtl">
              الصنف
            </th>
            <th className="pb-1.5 text-center w-[12%]" dir="rtl">
              الكمية
            </th>
            <th className="pb-1.5 text-left w-[21%]" dir="rtl">
              السعر
            </th>
            <th className="pb-1.5 text-left w-[21%]" dir="rtl">
              الإجمالي
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const mods = getModifiers(item);
            return (
              <tr key={item.id || idx} className="align-top border-b border-[#eee] last:border-0">
                <td className="py-1.5 font-medium text-black break-words leading-tight" dir="auto">
                  <div dir="auto">{item.productName}</div>
                  {mods.length > 0 && (
                    <div className="mt-1 space-y-0.5 pr-1.5" dir="auto">
                      {mods.map((m, mIdx) => (
                        <div
                          key={m.id || m.modifierId || mIdx}
                          className="text-[10px] text-gray-700 flex items-center justify-between"
                        >
                          <span>
                            + {m.name} {m.quantity > 1 ? `×${m.quantity}` : ''}
                          </span>
                          {Number(m.priceDelta || m.price || 0) > 0 && (
                            <span className="font-mono text-[9px] text-gray-600 mr-2" dir="ltr">
                              +{(Number(m.priceDelta || m.price || 0) * (m.quantity || 1)).toFixed(2)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <div className="text-[10px] text-gray-500 font-normal mt-0.5" dir="auto">
                      ملاحظة: <bdi>{item.notes}</bdi>
                    </div>
                  )}
                </td>
                <td className="py-1.5 text-center font-mono font-bold whitespace-nowrap" dir="ltr">
                  {item.quantity}
                </td>
                <td className="py-1.5 text-left font-mono tabular-nums whitespace-nowrap" dir="ltr">
                  {Number(item.unitPrice || 0).toFixed(2)}
                </td>
                <td className="py-1.5 text-left font-mono font-bold tabular-nums whitespace-nowrap" dir="ltr">
                  {Number(item.subtotal || 0).toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
