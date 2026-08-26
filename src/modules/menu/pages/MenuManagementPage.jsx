import React, { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  useCategoriesQuery,
  useProductsQuery,
} from '../hooks/useMenu.js';
import { CategoryFormModal } from '../components/CategoryFormModal.jsx';
import { ProductFormModal } from '../components/ProductFormModal.jsx';
import { PublicMenuPreviewModal } from '../components/PublicMenuPreviewModal.jsx';
import { DataTable } from '../../../shared/components/DataTable.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { resolveAssetUrl } from '../../../lib/asset-url.js';
import { Utensils, FolderPlus, Plus, Eye, Tag, Edit3 } from 'lucide-react';

const CATEGORY_STATUS_OPTIONS = [
  { value: 'ALL', label: 'جميع الحالات' },
  { value: 'ACTIVE', label: 'نشط فقط' },
  { value: 'INACTIVE', label: 'معطل فقط' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'ALL', label: 'جميع حالات التوافر' },
  { value: 'true', label: 'المتاحة للطلب فقط' },
  { value: 'false', label: 'غير المتاحة حالياً' },
];

export const MenuManagementPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'categories' ? 'categories' : 'products';
  const initialCategory = searchParams.get('category') || 'ALL';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [productPage, setProductPage] = useState(1);

  const [categorySearch, setCategorySearch] = useState('');
  const [categoryStatus, setCategoryStatus] = useState('ALL');
  const [categoryPage, setCategoryPage] = useState(1);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const categoriesQuery = useCategoriesQuery({
    page: categoryPage,
    limit: 20,
    status: categoryStatus === 'ALL' ? undefined : categoryStatus,
  });
  const productsQuery = useProductsQuery({
    page: productPage,
    limit: 20,
    search: searchTerm || undefined,
    categoryId: selectedCategory === 'ALL' ? undefined : selectedCategory,
    isAvailable: availabilityFilter === 'ALL' ? undefined : availabilityFilter === 'true',
  });

  const categories = categoriesQuery.data?.items || [];
  const products = productsQuery.data?.items || [];

  const filteredCategories = categories.filter((cat) => {
    if (!categorySearch.trim()) return true;
    const query = categorySearch.toLowerCase();
    return (
      cat.name?.toLowerCase().includes(query) ||
      cat.description?.toLowerCase().includes(query)
    );
  });

  const handleOpenCategoryModal = (cat = null) => {
    setCategoryToEdit(cat);
    setIsCategoryModalOpen(true);
  };

  const handleOpenProductModal = (prod = null) => {
    setProductToEdit(prod);
    setIsProductModalOpen(true);
  };

  const onProductsFilterChange = (setter) => (value) => {
    setProductPage(1);
    setter(value);
  };

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
    <div className="space-y-5">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <Utensils className="w-5 h-5 text-brand-primary" />
            <span>إدارة قائمة الطعام والمنتجات</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            إدارة التصنيفات، أصناف المأكولات، التوافر الفوري للمطبخ، وخيارات الإضافات.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PermissionGate permission="menu.manage">
            {activeTab === 'products' ? (
              <Button
                size="sm"
                icon={Plus}
                onClick={() => handleOpenProductModal()}
                className="bg-white text-slate-950 font-medium hover:bg-slate-200 border-none shadow-sm text-xs"
              >
                إضافة منتج
              </Button>
            ) : (
              <Button
                size="sm"
                icon={FolderPlus}
                onClick={() => handleOpenCategoryModal()}
                className="bg-white text-slate-950 font-medium hover:bg-slate-200 border-none shadow-sm text-xs"
              >
                إضافة تصنيف
              </Button>
            )}
          </PermissionGate>
        </div>
      </div>

      {}
      <div className="flex items-center gap-2 border-b border-border-default">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-white text-white'
              : 'border-transparent text-txt-muted hover:text-txt-primary'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>قائمة المنتجات ({productsQuery.data?.pagination?.total || products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'categories'
              ? 'border-white text-white'
              : 'border-transparent text-txt-muted hover:text-txt-primary'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>التصنيفات ({categoriesQuery.data?.pagination?.total || categories.length})</span>
        </button>
      </div>

      {}
      {activeTab === 'products' && (
        <DataTable
          columns={productColumns}
          data={products}
          isLoading={productsQuery.isLoading}
          isError={productsQuery.isError}
          error={productsQuery.error}
          onRetry={() => productsQuery.refetch()}
          searchQuery={searchTerm}
          onSearchChange={(v) => onProductsFilterChange(setSearchTerm)(v)}
          searchPlaceholder="ابحث باسم المنتج أو الوصف..."
          emptyTitle="لا توجد منتجات مطابقة"
          emptyDescription="لم يتم العثور على أي صنف في قائمة الطعام. يمكنك إضافة منتج جديد الآن."
          pagination={{
            page: productPage,
            totalPages: productsQuery.data?.pagination?.totalPages || 1,
            total: productsQuery.data?.pagination?.total,
            onPageChange: setProductPage,
          }}
          filters={
            <>
              <div className="w-44">
                <Select
                  options={[{ value: 'ALL', label: 'جميع التصنيفات' }, ...categories.map((cat) => ({ value: cat.id, label: cat.name }))]}
                  value={selectedCategory}
                  onChange={(e) => onProductsFilterChange(setSelectedCategory)(e.target.value)}
                  aria-label="فلترة بالتصنيف"
                />
              </div>
              <div className="w-48">
                <Select
                  options={AVAILABILITY_OPTIONS}
                  value={availabilityFilter}
                  onChange={(e) => onProductsFilterChange(setAvailabilityFilter)(e.target.value)}
                  aria-label="فلترة بالتوافر"
                />
              </div>
            </>
          }
          mobileCardRender={(prod) => (
            <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {prod.imageUrl ? (
                    <img
                      src={resolveAssetUrl(prod.imageUrl)}
                      alt={prod.name}
                      className={`w-12 h-12 object-cover rounded-md border border-border-default shrink-0 ${
                        prod.status !== 'ACTIVE' ? 'opacity-50' : ''
                      }`}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-bg-surface-elevated border border-border-default rounded-md flex items-center justify-center text-txt-muted shrink-0">
                      <Utensils className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <NavLink
                      to={`/menu/products/${prod.id}`}
                      className={`font-bold text-sm ${
                        prod.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-txt-primary hover:text-brand-primary'
                      }`}
                    >
                      {prod.name}
                    </NavLink>
                    <span className="text-xs text-txt-muted block">
                      {prod.category?.name || 'بدون تصنيف'}
                    </span>
                  </div>
                </div>
                <span className={`text-sm font-bold ${prod.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-brand-primary'}`}>
                  {Number(prod.price).toFixed(2)} EGP
                </span>
              </div>

              {prod.description && (
                <p className="text-xs text-txt-muted line-clamp-2">{prod.description}</p>
              )}

              <div className="flex items-center justify-end pt-2 border-t border-border-default">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/menu/products/${prod.id}`)}
                  icon={Eye}
                  className="text-txt-primary hover:text-brand-primary"
                  title="عرض تفاصيل المنتج"
                >
                  التفاصيل
                </Button>
              </div>
            </div>
          )}
        />
      )}

      {}
      {activeTab === 'categories' && (
        <DataTable
          columns={categoryColumns}
          data={filteredCategories}
          isLoading={categoriesQuery.isLoading}
          isError={categoriesQuery.isError}
          error={categoriesQuery.error}
          onRetry={() => categoriesQuery.refetch()}
          searchQuery={categorySearch}
          onSearchChange={setCategorySearch}
          searchPlaceholder="ابحث باسم التصنيف أو الوصف..."
          emptyTitle="لا توجد تصنيفات معرفة"
          emptyDescription="قم بإضافة التصنيف الأول (مثل: وجبات، مشروبات، حلويات) لتتمكن من إضافة المنتجات تحته."
          pagination={{
            page: categoryPage,
            totalPages: categoriesQuery.data?.pagination?.totalPages || 1,
            total: categoriesQuery.data?.pagination?.total,
            onPageChange: setCategoryPage,
          }}
          filters={
            <div className="w-40">
              <Select
                options={CATEGORY_STATUS_OPTIONS}
                value={categoryStatus}
                onChange={(e) => {
                  setCategoryPage(1);
                  setCategoryStatus(e.target.value);
                }}
                aria-label="فلترة بالحالة"
              />
            </div>
          }
          mobileCardRender={(cat) => (
            <div className="bg-bg-surface border border-border-default rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Tag className={`w-4 h-4 shrink-0 ${cat.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-brand-primary'}`} />
                  <span className={`font-bold text-sm ${cat.status !== 'ACTIVE' ? 'text-txt-muted' : 'text-txt-primary'}`}>
                    {cat.name}
                  </span>
                </div>
              </div>

              {cat.description && <p className="text-xs text-txt-muted line-clamp-2">{cat.description}</p>}

              <div className="text-xs text-txt-muted">
                الأصناف: <strong className="text-txt-primary">{cat._count?.products ?? 0}</strong> · الترتيب:{' '}
                <strong className="text-txt-primary">{cat.sortOrder ?? 0}</strong>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-border-default">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/menu?tab=products&category=${cat.id}`)}
                  icon={Eye}
                  className="text-txt-primary hover:text-brand-primary"
                  title="عرض منتجات التصنيف"
                >
                  التفاصيل
                </Button>
              </div>
            </div>
          )}
        />
      )}

      {}
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={categoryToEdit}
      />

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
        categories={categories}
      />

      <PublicMenuPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
      />
    </div>
  );
};
