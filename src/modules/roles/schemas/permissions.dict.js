export const MODULE_LABELS = {
  restaurants: 'إعدادات المطعم الرئيسية',
  restaurant: 'إعدادات المطعم الرئيسية',
  employees: 'الموظفون والأدوار الوظيفية',
  menu: 'قائمة الطعام والمنتجات',
  branches: 'الفروع والمواقع',
  orders: 'إدارة الطلبات ونقطة البيع (POS)',
  tables: 'الطاولات وصالة الطعام',
  whatsapp: 'المحادثات والرسائل (WhatsApp)',
  chats: 'المحادثات والرسائل',
  customers: 'بيانات وإدارة العملاء',
  dashboard: 'لوحة التحكم والتقارير والتحليلات',
  notifications: 'التنبيهات والإشعارات',
  coupons: 'الكوبونات والعروض الترويجية',
  audit: 'سجلات النظام والأمان (Audit Logs)',
};

export const PERMISSION_LABELS = {
  // Orders
  'orders.view': 'عرض قائمة الطلبات وسجل التفاصيل',
  'orders.create': 'إنشاء طلبات جديدة (POS / الهاتف / QR)',
  'orders.update': 'تعديل الطلبات وتحديث الحالات التشغيلية',
  'orders.cancel': 'إلغاء الطلبات وتوثيق السبب',
  'orders.payment': 'تحصيل مدفوعات الطلبات وإصدار الفواتير',
  'orders.refund': 'استرداد المبالغ المالية للطلبات',

  // Menu
  'menu.view': 'عرض قائمة الطعام والأصناف',
  'menu.manage': 'إدارة الأصناف، الفئات، الأسعار، والإضافات',

  // Tables
  'tables.view': 'عرض خريطة الطاولات والجلسات',
  'tables.manage': 'إدارة وتخصيص الطاولات، الجلسات، وحالات الصالة',

  // Employees & Roles
  'employees.view': 'عرض ملفات وسجل بيانات الموظفين',
  'employees.manage': 'إضافة، تعديل، وإدارة بيانات الموظفين',
  'employees.manage_roles': 'إنشاء وتعديل مصفوفة الأدوار والصلاحيات',

  // Customers
  'customers.view': 'عرض سجل وبيانات العملاء',
  'customers.manage': 'إضافة وتعديل وتحديث بيانات العملاء',

  // Branches
  'branches.view': 'عرض قائمة الفروع التشغيلية',
  'branches.manage': 'إضافة وتعديل وساعات عمل الفروع',

  // WhatsApp & Messaging
  'whatsapp.view': 'عرض المحادثات والرسائل الواردة',
  'whatsapp.manage': 'إرسال وتحديث وإعادة توجيه رسائل الواتساب',
  'whatsapp.takeover': 'استلام، قفل، وإعادة تعيين محادثات الواتساب',
  'chats.view': 'عرض محادثات ورسائل صندوق الوارد',
  'chats.manage': 'إدارة وإرسال رسائل ومحادثات صندوق الوارد',
  'chats.takeover': 'استلام، قفل، وإعادة تعيين محادثات صندوق الوارد',

  // Dashboard & Reports
  'dashboard.view': 'عرض لوحة التحكم والتقارير والتحليلات المالية',

  // Coupons
  'coupons.view': 'عرض قائمة الكوبونات والعروض',
  'coupons.manage': 'إدارة وتوليد كوبونات وتخفيضات الأسعار',

  // Notifications
  'notifications.view': 'عرض التنبيهات والإشعارات الإدارية',

  // Audit Logs
  'audit.view': 'عرض سجل الأمان والتدقيق الإداري (Audit Logs)',

  // Restaurant Settings
  'restaurants.manage': 'تحديث بيانات المطعم الرئيسية والهوية',
};

/**
 * Utility function to resolve clean localized module title
 */
export const getLocalizedModuleTitle = (rawModule) => {
  if (!rawModule) return 'صلاحيات متنوعة';
  const key = String(rawModule).toLowerCase().trim();
  return MODULE_LABELS[key] || rawModule;
};

/**
 * Utility function to resolve clean localized permission action name
 */
export const getLocalizedPermissionName = (permKey, rawName) => {
  if (permKey && PERMISSION_LABELS[permKey]) {
    return PERMISSION_LABELS[permKey];
  }
  return rawName || permKey || 'صلاحية غير محددة';
};
