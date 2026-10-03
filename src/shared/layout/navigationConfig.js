import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  Grid,
  UtensilsCrossed,
  Users,
  MessageSquare,
  BarChart3,
  Calculator,
  TicketPercent,
  UserCheck,
  Settings,
  Store,
  Shield,
  ScrollText,
  Layers,
} from 'lucide-react';

export const ROLE_LABELS = {
  owner: 'المالك',
  admin: 'مدير النظام',
  manager: 'مدير',
  cashier: 'كاشير',
  waiter: 'موظف صالة',
};

export const DEFAULT_PERMISSION = 'orders.view';

export const NAV_SECTIONS = [
  {
    key: 'ops',
    title: 'العمليات التشغيلية',
    items: [
      {
        label: 'نقطة البيع',
        path: '/pos',
        icon: Calculator,
        permission: [
          'orders.source_cashier',
          'orders.source_phone',
          'orders.source_whatsapp',
          'orders.source_website',
        ],
      },
      {
        label: 'شاشة الويتر',
        path: '/waiter',
        icon: UtensilsCrossed,
        permission: ['tables.view', 'orders.create'],
      },
      {
        label: 'لوحة التحكم',
        path: '/',
        icon: LayoutDashboard,
        permission: 'dashboard.view',
      },
      {
        label: 'الطلبات',
        path: '/orders',
        icon: ShoppingBag,
        permission: 'orders.view',
      },
      {
        label: 'شاشة المطبخ (KDS)',
        path: '/kds',
        icon: ChefHat,
        permission: ['kds.view', 'orders.view'],
      },
      {
        label: 'الطاولات',
        path: '/tables',
        icon: Grid,
        permission: ['tables.view', 'tables.manage'],
      },
      {
        label: 'سجل الورديات',
        path: '/shifts',
        icon: Layers,
        permission: ['shifts.view', 'reports.view', 'orders.source_cashier'],
      },
    ],
  },
  {
    key: 'manage',
    title: 'إدارة المطعم',
    items: [
      {
        label: 'قائمة الطعام',
        path: '/menu',
        icon: UtensilsCrossed,
        permission: ['menu.manage', 'menu.view'],
      },
      {
        label: 'العملاء',
        path: '/customers',
        icon: Users,
        permission: 'customers.view',
      },
      {
        label: 'الموظفون',
        path: '/settings/employees',
        icon: UserCheck,
        permission: 'employees.view',
      },
      {
        label: 'الرسائل',
        path: '/whatsapp',
        icon: MessageSquare,
        permission: ['whatsapp.view', 'chats.view'],
      },
      {
        label: 'الكوبونات',
        path: '/coupons',
        icon: TicketPercent,
        permission: ['coupons.manage', 'coupons.view'],
      },
      {
        label: 'التقارير والتحليلات',
        path: '/reports',
        icon: BarChart3,
        permission: 'dashboard.view',
      },
    ],
  },
  {
    key: 'settings',
    title: 'إعدادات النظام',
    items: [
      {
        label: 'إعدادات المطعم',
        path: '/settings/restaurant',
        icon: Settings,
        permission: ['restaurants.manage', 'restaurants.view'],
      },
      {
        label: 'الفروع التشغيلية',
        path: '/settings/branches',
        icon: Store,
        permission: ['branches.manage', 'branches.view'],
      },
      {
        label: 'الأدوار والصلاحيات',
        path: '/settings/roles',
        icon: Shield,
        permission: 'employees.manage_roles',
      },
      {
        label: 'سجل التدقيق والأمان',
        path: '/settings/audit-logs',
        icon: ScrollText,
        permission: 'audit.view',
      },
    ],
  },
];
