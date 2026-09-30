import React from 'react';
import {
  User,
  Phone,
  MapPin,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Monitor,
  MessageCircle,
  Globe,
  QrCode,
} from 'lucide-react';

const SOURCE_CFG = {
  CASHIER: { label: 'كاشير', Icon: Monitor },
  POS: { label: 'كاشير', Icon: Monitor },
  DIRECT: { label: 'مباشر', Icon: Monitor },
  PHONE: { label: 'هاتف', Icon: Phone },
  WHATSAPP: { label: 'واتساب', Icon: MessageCircle },
  ONLINE: { label: 'أونلاين', Icon: Globe },
  WEBSITE: { label: 'موقع إلكتروني', Icon: Globe },
  QR: { label: 'طاولة QR', Icon: QrCode },
};

const TYPE_CFG = {
  PICKUP: { label: 'استلام / سفري', Icon: ShoppingBag },
  DELIVERY: { label: 'توصيل', Icon: Bike },
  DINE_IN: { label: 'صالة', Icon: UtensilsCrossed },
};

export const PosOrderCustomerDetails = ({ order }) => {
  if (!order) return null;

  const rawSource = order.source || order.orderSource || order.channel || 'POS';
  const sourceInfo = SOURCE_CFG[rawSource] || { label: rawSource, Icon: Monitor };
  const SourceIcon = sourceInfo.Icon;

  const typeInfo = TYPE_CFG[order.type] || { label: order.type, Icon: ShoppingBag };
  const TypeIcon = typeInfo.Icon;

  return (
    <div className="p-3.5 rounded-2xl border space-y-2.5 text-xs" style={{ background: 'var(--s2)', borderColor: 'var(--bd)' }}>
      {/* Customer / Table Header & Source */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0" style={{ color: 'var(--t1)' }}>
          <User size={14} className="shrink-0" style={{ color: 'var(--t3)' }} />
          <span className="font-bold truncate">
            {order.customer?.name || order.customerName || 'عميل مباشر'}
          </span>
        </div>
        {/* Source Badge */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
          <SourceIcon size={11} className="text-zinc-400" />
          <span>المصدر: {sourceInfo.label}</span>
        </span>
      </div>

      {/* Phone */}
      {(order.customer?.phone || order.customerPhone) && (
        <div className="flex items-center gap-2 mono text-[11px]" style={{ color: 'var(--t2)' }}>
          <Phone size={13} className="shrink-0" style={{ color: 'var(--t3)' }} />
          <span dir="ltr">{order.customer?.phone || order.customerPhone}</span>
        </div>
      )}

      {/* Type and Location details */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t text-[11px]" style={{ borderColor: 'var(--bd)' }}>
        <div className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--t2)' }}>
          <TypeIcon size={13} style={{ color: 'var(--t3)' }} />
          <span>النوع: {typeInfo.label}</span>
        </div>

        {order.table && (
          <div className="font-bold" style={{ color: 'var(--ac)' }}>
            {(() => {
              const raw = String(order.table.label || order.table.number || order.table.name || '').trim();
              return raw.startsWith('طاولة') ? raw : `طاولة ${raw}`;
            })()}
          </div>
        )}
      </div>

      {/* Delivery Address */}
      {order.deliveryAddress && (
        <div className="flex items-start gap-2 text-xs pt-1 border-t" style={{ borderColor: 'var(--bd)', color: 'var(--t2)' }}>
          <MapPin size={13} className="shrink-0 mt-0.5" style={{ color: 'var(--t3)' }} />
          <span>{order.deliveryAddress}</span>
        </div>
      )}
    </div>
  );
};

export default PosOrderCustomerDetails;
