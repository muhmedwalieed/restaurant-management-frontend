import React from 'react';

/**
 * Renders the table's products grouped per order — each order shows its own items
 * and subtotal, while the table total is the sum of all orders.
 */
export const TableOrdersBreakdown = ({
  orderGroups = [],
  ordersCount = 0,
  itemsCount = 0,
  currency = 'ج.م',
  emptyText = 'لم يتم طلب أصناف بعد.',
}) => {
  return (
    <div className="space-y-3">
      <div
        className="flex items-center justify-between gap-2 text-xs font-bold"
        style={{ color: 'var(--t2)' }}
      >
        <span className="truncate">الأصناف حسب الطلب</span>
        <span className="mono shrink-0">
          {ordersCount > 1 ? `${ordersCount} طلبات · ` : ''}
          {itemsCount} صنف
        </span>
      </div>

      {orderGroups.length === 0 ? (
        <p className="text-xs text-center py-6" style={{ color: 'var(--t3)' }}>
          {emptyText}
        </p>
      ) : (
        <div className="space-y-3">
          {orderGroups.map((group) => (
            <div key={group.key} className="space-y-1">
              <div
                className="flex items-center justify-between gap-2 pb-1.5 border-b text-[11px] font-bold"
                style={{ borderColor: 'var(--bd)', color: 'var(--t2)' }}
              >
                <span className="truncate">
                  طلب {group.orderNumber != null ? `#${group.orderNumber}` : ''}
                </span>
                <span className="mono shrink-0" style={{ color: 'var(--t1)' }}>
                  {Number(group.total || 0).toFixed(2)} {currency}
                </span>
              </div>

              {group.items.map((it, idx) => (
                <div
                  key={`${it.productId || it.id}_${idx}`}
                  className="flex items-center justify-between gap-2 py-1.5 text-xs border-b last:border-0"
                  style={{ borderColor: 'var(--bd)' }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold shrink-0" style={{ color: 'var(--ac)' }}>
                      {it.qty}×
                    </span>
                    <span className="truncate" style={{ color: 'var(--t1)' }}>
                      {it.name}
                    </span>
                  </div>
                  <span className="mono font-semibold shrink-0" style={{ color: 'var(--t1)' }}>
                    {(it.qty * it.price).toFixed(2)} {currency}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TableOrdersBreakdown;
