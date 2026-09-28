import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../../shared/components/DataTable.jsx';
import { Button } from '../../../../shared/components/Button.jsx';
import { MenuCategoryFilterBar } from './MenuCategoryFilterBar.jsx';
import { Tag } from 'lucide-react';

export const MenuCategoryTab = ({
  categorySearch,
  onCategorySearchChange,
  categoryStatus,
  onCategoryStatusChange,
  categoriesQuery,
  page,
  onPageChange,
}) => {
  const navigate = useNavigate();
  const categories = categoriesQuery.data?.items || [];
  const totalItems = categoriesQuery.data?.meta?.totalItems ?? categories.length;

  const filteredCategories = categories.filter((cat) => {
    if (!categorySearch.trim()) return true;
    const query = categorySearch.toLowerCase();
    return (
      cat.name?.toLowerCase().includes(query) ||
      cat.description?.toLowerCase().includes(query)
    );
  });

  const categoryColumns = [
    {
      header: 'التصنيف',
      accessorKey: 'name',
      render: (cat) => (
        <div className="flex items-center gap-2">
          <Tag className={`w-4 h-4 shrink-0 ${cat.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-brand-primary'}`} />
          <span className={`font-bold ${cat.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-txt-primary'}`}>
            {cat.name}
          </span>
        </div>
      ),
    },
    {
      header: 'الوصف',
      accessorKey: 'description',
      render: (cat) => (
        <span className="truncate max-w-[260px] inline-block text-txt-muted text-xs">
          {cat.description || 'غير محدد'}
        </span>
      ),
    },
    {
      header: 'الأصناف',
      accessorKey: '_count',
      width: '90px',
      render: (cat) => <span className="font-bold text-txt-primary font-mono text-xs">{cat._count?.products ?? 0}</span>,
    },
    {
      header: 'الترتيب',
      accessorKey: 'sortOrder',
      width: '90px',
      render: (cat) => (
        <span className={`font-mono font-medium text-xs ${cat.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-txt-primary'}`}>
          {cat.sortOrder ?? 0}
        </span>
      ),
    },
    {
      header: 'الإجراءات',
      key: 'actions',
      width: '90px',
      render: (cat) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/menu?tab=products&category=${cat.id}`)}
          className="border-white/10 hover:bg-white/[0.06] text-xs h-7 px-2.5"
          title="عرض منتجات هذا التصنيف"
        >
          المنتجات
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <MenuCategoryFilterBar
        searchQuery={categorySearch}
        onSearchChange={onCategorySearchChange}
        statusFilter={categoryStatus}
        onStatusChange={onCategoryStatusChange}
      />

      <DataTable
        columns={categoryColumns}
        data={filteredCategories}
        isLoading={categoriesQuery.isLoading}
        isError={categoriesQuery.isError}
        error={categoriesQuery.error}
        onRetry={categoriesQuery.refetch}
        pagination={{
          page,
          limit: 20,
          total: totalItems,
          totalPages: categoriesQuery.data?.meta?.totalPages || 1,
          onPageChange,
        }}
        emptyMessage="لم يتم العثور على أقسام تطابق الفلترة المحددة."
      />
    </div>
  );
};
