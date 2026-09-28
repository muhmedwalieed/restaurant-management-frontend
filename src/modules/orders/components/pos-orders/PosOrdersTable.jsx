import React from 'react';

const STATUS_CFG = {
  PENDING: { label: 'انتظار', dot: 'var(--warn)' },
  CONFIRMED: { label: 'مؤكد', dot: 'var(--ac)' },
  PREPARING: { label: 'قيد التنفيذ', dot: 'var(--ac)' },
  READY: { label: 'جاهز', dot: 'var(--ok)' },
  OUT_FOR_DELIVERY: { label: 'في الطريق', dot: 'var(--ac)' },
  DELIVERED: { label: 'تم التسليم', dot: 'var(--ok)' },
  CANCELLED: { label: 'ملغي', dot: 'var(--err)' },
};

const TYPE_LBL = {
  DINE_IN: 'صالة',
  PICKUP: 'استلام',
  DELIVERY: 'توصيل',
};

const SOURCE_LBL = {
  CASHIER: 'كاشير',
  POS: 'كاشير',
  PHONE: 'هاتف',
  WHATSAPP: 'واتساب',
  WEBSITE: 'موقع',
  QR: 'طاولة (QR)',
};

function PayBadge({ order }) {
  const isPaid = order.paymentStatus === 'PAID';
  const isPartial = order.paymentStatus === 'PARTIAL';
  if (isPaid) return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">مدفوع</span>;
  if (isPartial) return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">دفع جزئي</span>;
  return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">غير مدفوع</span>;
}

export const PosOrdersTable = ({
  orders = [],
  selectedOrderId,
  onSelectOrder,
}) => {
  if (orders.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ color: 'var(--t3)' }}>
        <p className="text-xs font-semibold">لا توجد طلبات مطابقة للبحث أو الفلتر المحدد</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto custom-scrollbar">
      <table className="w-full text-right text-xs border-collapse select-none">
        <thead
          className="sticky top-0 z-10 border-b font-semibold"
          style={{ background: 'var(--s1)', borderColor: 'var(--bd)', color: 'var(--t2)' }}
        >
          <tr>
            <th className="py-2.5 px-4">رقم الطلب</th>
            <th className="py-2.5 px-4">العميل / الطاولة</th>
            <th className="py-2.5 px-4">النوع / المصدر</th>
            <th className="py-2.5 px-4">الحالة</th>
            <th className="py-2.5 px-4">حالة الدفع</th>
            <th className="py-2.5 px-4 text-left">الإجمالي</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--bd)' }}>
          {orders.map((o) => {
            const isSel = selectedOrderId === o.id;
            const statusInfo = STATUS_CFG[o.status] || { label: o.status, dot: 'var(--t3)' };
            const custName = o.customer?.name || o.customerName || (o.table ? `طاولة ${o.table.label || o.table.number}` : 'عميل مباشر');
            const total = Number(o.total || o.totalAmount || 0);

            return (
              <tr
                key={o.id}
                onClick={() => onSelectOrder(o)}
                className="transition-colors cursor-pointer"
                style={{
                  background: isSel ? 'var(--s2)' : 'transparent',
                }}
              >
                <td className="py-3 px-4 mono font-bold" style={{ color: 'var(--ac)' }}>
                  #{o.orderNumber || o.id?.slice(0, 6)}
                </td>
                <td className="py-3 px-4 font-medium" style={{ color: 'var(--t1)' }}>
                  {custName}
                </td>
                <td className="py-3 px-4" style={{ color: 'var(--t2)' }}>
                  {TYPE_LBL[o.type] || o.type} ({SOURCE_LBL[o.source] || o.source})
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: statusInfo.dot }} />
                    <span style={{ color: 'var(--t1)' }}>{statusInfo.label}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <PayBadge order={o} />
                </td>
                <td className="py-3 px-4 text-left mono font-bold" style={{ color: 'var(--t1)' }}>
                  {total.toFixed(2)} ج
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
