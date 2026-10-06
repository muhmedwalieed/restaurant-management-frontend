/**
 * Orders module constants & utilities
 */

export const PAY_METHODS = [
  { id: 'CASH', label: 'نقدي' },
  { id: 'INSTAPAY', label: 'انستاباي' },
  { id: 'WALLET', label: 'محفظة' },
];

export const ORDER_TYPES = [
  { id: 'DINE_IN', label: 'صالة' },
  { id: 'TAKEAWAY', label: 'تيك أواي' },
  { id: 'PICKUP', label: 'استلام' },
  { id: 'DELIVERY', label: 'توصيل' },
];

export const ORDER_SOURCES = [
  { id: 'POS', label: 'نقطة البيع' },
  { id: 'PHONE', label: 'الهاتف' },
  { id: 'WAITER', label: 'الويتر' },
  { id: 'QR', label: 'QR المائدة' },
  { id: 'ONLINE', label: 'المتجر الإلكتروني' },
];

export const ORDER_STATUSES = [
  { id: 'PENDING', label: 'معلق', color: 'amber' },
  { id: 'CONFIRMED', label: 'مؤكد', color: 'blue' },
  { id: 'PREPARING', label: 'قيد التجهيز', color: 'purple' },
  { id: 'READY', label: 'جاهز', color: 'indigo' },
  { id: 'DELIVERED', label: 'تم التسليم', color: 'emerald' },
  { id: 'COMPLETED', label: 'مكتمل', color: 'green' },
  { id: 'CANCELLED', label: 'ملغي', color: 'red' },
];

export const SOURCE_PERMISSIONS = [
  { value: 'CASHIER', key: 'pos.create', label: 'كاشير' },
  { value: 'PHONE', key: 'callcenter.manage', label: 'هاتف' },
  { value: 'WAITER', key: 'waiter.order', label: 'ويتر' },
];

/**
 * Checks whether a product has any modifier groups or options
 */
export const hasProductModifiers = (product) => {
  if (!product) return false;
  if (Array.isArray(product.modifierGroups) && product.modifierGroups.length > 0) {
    return true;
  }
  if (Array.isArray(product.modifiers) && product.modifiers.length > 0) {
    return true;
  }
  if (Array.isArray(product.ProductModifierGroup) && product.ProductModifierGroup.length > 0) {
    return true;
  }
  return false;
};

/**
 * Helper to get modifiers formatted or list from an order item
 */
export const getOrderItemModifiers = (item) => {
  if (!item) return [];
  if (Array.isArray(item.modifiers)) return item.modifiers;
  if (Array.isArray(item.modifierNames)) return item.modifierNames;
  return [];
};
