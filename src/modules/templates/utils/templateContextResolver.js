/**
 * Dynamic Template Context Resolver
 * Replaces static mock variables with dynamic contextual data resolved
 * directly from the authenticated user, active branch, and restaurant profile.
 */

export const resolveTemplateContext = ({ user, activeBranch, recentOrder } = {}) => {
  const restaurantName =
    activeBranch?.restaurant?.name ||
    activeBranch?.name ||
    user?.restaurantName ||
    'مطعمنا';

  const branchAddress =
    activeBranch?.address ||
    'الفرع الرئيسي';

  const agentName =
    user?.name ||
    'فريق خدمة العملاء';

  const customerName =
    recentOrder?.customer?.name ||
    recentOrder?.customerName ||
    'أحمد محمود';

  const orderNumber =
    recentOrder?.orderNumber != null
      ? String(recentOrder.orderNumber)
      : '1042';

  const total =
    recentOrder?.total != null
      ? Number(recentOrder.total).toFixed(2)
      : '285.00';

  const time = new Date().toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const currency = activeBranch?.settings?.currency || 'ج.م';

  return {
    restaurantName,
    orderNumber,
    total,
    currency,
    address: branchAddress,
    customerName,
    customerSalutation: ` يا أستاذ ${customerName.split(' ')[0]}`,
    categoryName: 'وجبات التوفير',
    productName: 'برجر كلاسيك دبل',
    cartSummary: `1. 2x برجر كلاسيك دبل (200.00 ${currency})\n2. 1x كولا (40.00 ${currency})`,
    status: 'قيد التجهيز بالمطبخ',
    time,
    ticketNumber: '502',
    subject: 'استفسار عن حجز طاولة',
    agentName,
    rating: '5',
    reason: 'استفسار عن الأصناف المتاحة',
    orderReference: ` بخصوص طلبك الأخير (#${orderNumber})`,
    addressText: `\nالعنوان: ${branchAddress}`,
  };
};

/**
 * Replaces all {{variable}} placeholders with resolved dynamic values.
 */
export const renderDynamicPreview = (templateText, context) => {
  if (!templateText) return '';
  let rendered = templateText;
  const variables = context || resolveTemplateContext();

  for (const [key, val] of Object.entries(variables)) {
    rendered = rendered.split(`{{${key}}}`).join(val ?? '');
  }
  return rendered;
};
