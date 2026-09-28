import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { DataTable } from '../../../../shared/components/DataTable.jsx';
import { resolveAssetUrl } from '../../../../lib/asset-url.js';
import { MenuProductFilterBar } from './MenuProductFilterBar.jsx';
import { Edit3 } from 'lucide-react';

export const MenuProductTab = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  availabilityFilter,
  onAvailabilityChange,
  categoryOptions,
  productsQuery,
  page,
  onPageChange,
}) => {
  const navigate = useNavigate();
  const products = productsQuery.data?.items || [];
  const totalItems = productsQuery.data?.meta?.totalItems ?? products.length;

  const productColumns = [
    {
      header: 'المنتج',
      accessorKey: 'name',
      render: (prod) => (
        <div className="flex items-center gap-3">
          {prod.imageUrl && (
            <img
              src={resolveAssetUrl(prod.imageUrl)}
              alt={prod.name}
              className={`w-10 h-10 object-cover rounded-lg border border-border-subtle shrink-0 ${
                prod.status !== 'ACTIVE' ? 'opacity-50' : ''
              }`}
            />
          )}
          <div className="min-w-0 space-y-0.5">
            <NavLink
              to={`/menu/products/${prod.id}`}
              className={`font-bold transition-colors block ${
                prod.status !== 'ACTIVE' ? 'text-txt-muted hover:text-txt-muted' : 'text-txt-primary hover:text-brand-primary'
              }`}
            >
              <span className="truncate max-w-[260px] block">{prod.name}</span>
            </NavLink>
            {prod.description && (
              <p
                dir="auto"
                className={`text-xs font-normal leading-relaxed line-clamp-1 max-w-[340px] text-right ${
                  prod.status !== 'ACTIVE' ? 'text-txt-muted/70' : 'text-slate-400'
                }`}
              >
                {prod.description}
              </p>
            )}
            {prod.modifiers && prod.modifiers.length > 0 && (
              <span className="inline-block text-[11px] text-brand-primary font-medium">
                +{prod.modifiers.length} إضافات متوفرة
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'التصنيف',
      accessorKey: 'categoryId',
      width: '140px',
      render: (prod) => (
        <span className={`font-medium text-xs ${prod.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-txt-primary'}`}>
          {prod.category?.name || 'غير محدد'}
        </span>
      ),
    },
    {
      header: 'السعر',
      accessorKey: 'price',
      width: '110px',
      render: (prod) => (
        <span className={`font-mono font-bold text-xs ${prod.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-txt-primary'}`}>
          {Number(prod.price).toFixed(2)} EGP
        </span>
      ),
    },
    {
      header: 'الإجراءات',
      key: 'actions',
      width: '80px',
      render: (prod) => (
        <button
          type="button"
          onClick={() => navigate(`/menu/products/${prod.id}`)}
          className="p-1.5 rounded-lg text-txt-muted hover:text-white hover:bg-white/[0.06] transition-colors"
          title="تعديل المنتج"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <MenuProductFilterBar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        availabilityFilter={availabilityFilter}
        onAvailabilityChange={onAvailabilityChange}
        categoryOptions={categoryOptions}
      />

      <DataTable
        columns={productColumns}
        data={products}
        isLoading={productsQuery.isLoading}
        isError={productsQuery.isError}
        error={productsQuery.error}
        onRetry={productsQuery.refetch}
        pagination={{
          page,
          limit: 20,
          total: totalItems,
          totalPages: productsQuery.data?.meta?.totalPages || 1,
          onPageChange,
        }}
        emptyMessage="لا توجد أطعمة أو مشروبات مطابقة لخيارات البحث الحالية."
      />
    </div>
  );
};
