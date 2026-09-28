import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useCategoriesQuery,
  useProductsQuery,
} from '../hooks/useMenu.js';
import { CategoryFormModal } from '../components/CategoryFormModal.jsx';
import { ProductFormModal } from '../components/ProductFormModal.jsx';
import { PublicMenuPreviewModal } from '../components/PublicMenuPreviewModal.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { MenuProductTab } from '../components/management/MenuProductTab.jsx';
import { MenuCategoryTab } from '../components/management/MenuCategoryTab.jsx';
import { Utensils, FolderPlus, Plus, Eye } from 'lucide-react';

export const MenuManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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

  const allCategoriesQuery = useCategoriesQuery({ limit: 100 });
  const categoryOptions = (allCategoriesQuery.data?.items || []).map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'categories' ? { tab: 'categories' } : {});
  };

  const handleOpenCategoryModal = (cat = null) => {
    setCategoryToEdit(cat);
    setIsCategoryModalOpen(true);
  };

  const handleOpenProductModal = (prod = null) => {
    setProductToEdit(prod);
    setIsProductModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
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

          <Button
            size="sm"
            variant="outline"
            icon={Eye}
            onClick={() => setIsPreviewModalOpen(true)}
            className="border-white/10 hover:bg-white/[0.06] text-xs"
          >
            معاينة المنيو
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border-default/80">
        <button
          type="button"
          onClick={() => handleTabSwitch('products')}
          className={`pb-3 px-2 text-xs font-bold transition-colors relative ${
            activeTab === 'products'
              ? 'text-brand-primary'
              : 'text-txt-muted hover:text-txt-primary'
          }`}
        >
          قائمة المنتجات
          {activeTab === 'products' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('categories')}
          className={`pb-3 px-2 text-xs font-bold transition-colors relative ${
            activeTab === 'categories'
              ? 'text-brand-primary'
              : 'text-txt-muted hover:text-txt-primary'
          }`}
        >
          أقسام المنيو (التصنيفات)
          {activeTab === 'categories' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'products' ? (
        <MenuProductTab
          searchTerm={searchTerm}
          onSearchChange={(v) => { setProductPage(1); setSearchTerm(v); }}
          selectedCategory={selectedCategory}
          onCategoryChange={(v) => { setProductPage(1); setSelectedCategory(v); }}
          availabilityFilter={availabilityFilter}
          onAvailabilityChange={(v) => { setProductPage(1); setAvailabilityFilter(v); }}
          categoryOptions={categoryOptions}
          productsQuery={productsQuery}
          page={productPage}
          onPageChange={setProductPage}
        />
      ) : (
        <MenuCategoryTab
          categorySearch={categorySearch}
          onCategorySearchChange={(v) => { setCategoryPage(1); setCategorySearch(v); }}
          categoryStatus={categoryStatus}
          onCategoryStatusChange={(v) => { setCategoryPage(1); setCategoryStatus(v); }}
          categoriesQuery={categoriesQuery}
          page={categoryPage}
          onPageChange={setCategoryPage}
        />
      )}

      {/* Modals */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        initialData={productToEdit}
      />

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        initialData={categoryToEdit}
      />

      <PublicMenuPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
      />
    </div>
  );
};
