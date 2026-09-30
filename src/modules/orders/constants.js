export const ORDER_TYPES = [
  { id: 'PICKUP', value: 'PICKUP', label: 'استلام' },
  { id: 'DELIVERY', value: 'DELIVERY', label: 'توصيل' },
  { id: 'DINE_IN', value: 'DINE_IN', label: 'صالة' },
];

export const PAY_METHODS = [
  { id: 'CASH', value: 'CASH', label: 'نقدي' },
  { id: 'CARD', value: 'CARD', label: 'بطاقة' },
  { id: 'INSTAPAY', value: 'INSTAPAY', label: 'انستاباي' },
  { id: 'WALLET', value: 'WALLET', label: 'محفظة' },
];

export const SOURCE_PERMISSIONS = [
  { value: 'CASHIER', key: 'orders.source_cashier', label: 'كاشير' },
  { value: 'PHONE', key: 'orders.source_phone', label: 'هاتف' },
  { value: 'WHATSAPP', key: 'orders.source_whatsapp', label: 'واتساب' },
  { value: 'WEBSITE', key: 'orders.source_website', label: 'موقع' },
];

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export const PAYMENT_STATUSES = [
  'PENDING',
  'PARTIAL',
  'PAID',
  'FAILED',
  'REFUNDED',
];

export const hasProductModifiers = (product) => {
  if (!product) return false;
  if (product.hasModifiers) return true;
  if (Array.isArray(product.modifierGroups) && product.modifierGroups.length > 0) return true;
  if (Array.isArray(product.modifiers) && product.modifiers.length > 0) return true;
  return false;
};

export const getOrderItemModifiers = (item) => {
  if (!item) return [];
  if (Array.isArray(item.selectedModifiers) && item.selectedModifiers.length > 0) return item.selectedModifiers;
  if (Array.isArray(item.modifiers) && item.modifiers.length > 0) return item.modifiers;
  return [];
};
