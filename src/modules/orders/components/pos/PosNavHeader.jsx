import React from 'react';
import {
  ShoppingCart,
  ClipboardList,
  LayoutGrid,
  ConciergeBell,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'sales', label: 'البيع', Icon: ShoppingCart },
  { id: 'orders', label: 'الطلبات', Icon: ClipboardList },
  { id: 'tables', label: 'الطاولات', Icon: LayoutGrid },
  { id: 'waiter', label: 'الويتر', Icon: ConciergeBell },
];

export const PosNavHeader = ({
  activeTab,
  onSelectTab,
  activeBranch,
  user,
  onLogout,
  onNavigateDashboard,
}) => {
  return (
    <header
      className="h-14 px-4 flex items-center justify-between shrink-0 border-b select-none z-10"
      style={{ background: 'var(--s1)', borderColor: 'var(--bd)' }}
    >
      {/* Branch Title & Tabs */}
      <div className="flex items-center gap-4">
        <div>
          <span className="font-bold text-xs" style={{ color: 'var(--t1)' }}>
            {activeBranch?.name || 'كاشير المطعم'}
          </span>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.Icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                style={{
                  background: isActive ? 'var(--ac)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--t3)',
                }}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-2">
        <span className="text-xs hidden sm:inline-block" style={{ color: 'var(--t2)' }}>
          {user?.name || 'الكاشير'}
        </span>

        <button
          type="button"
          onClick={onNavigateDashboard}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-slate-300"
          title="لوحة التحكم"
        >
          <LayoutDashboard size={15} />
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-red-400"
          title="تسجيل الخروج"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
};
