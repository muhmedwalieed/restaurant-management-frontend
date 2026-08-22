import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useProductQuery,
  useUpdateProductMutation,
  useCategoriesQuery,
  useModifiersQuery,
  useDeleteModifierMutation,
} from '../hooks/useMenu.js';
import { productFormSchema } from '../schemas/menu.schema.js';
import { ModifierFormModal } from '../components/ModifierFormModal.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Toggle } from '../../../shared/components/Toggle.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import {
  Utensils,
  Layers,
  ChevronRight,
  DollarSign,
  Image,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const PRODUCT_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'نشط (ظاهر في المنيو)' },
  { value: 'INACTIVE', label: 'غير نشط (مخفي من المنيو)' },
];

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'modifiers'
  const [generalSuccess, setGeneralSuccess] = useAutoDismiss();
  const [generalError, setGeneralError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [modifierToEdit, setModifierToEdit] = useState(null);

  // Queries & Mutations
  const { data: product, isLoading, isError, error, refetch } = useProductQuery(id);
  const updateProductMutation = useUpdateProductMutation();
  const categoriesQuery = useCategoriesQuery();
  const modifiersQuery = useModifiersQuery(id);
  const deleteModifierMutation = useDeleteModifierMutation();

  const categories = categoriesQuery.data?.items || [];
  const modifiers = modifiersQuery.data || [];

  const categoryOptions = categories.map((cat) => ({ value: cat.id, label: cat.name }));

  // General Form setup (same schema as the create/edit modal)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productFormSchema),
    values: {
      categoryId: product?.categoryId || product?.category?.id || '',
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price !== undefined ? String(product.price) : '',
      imageUrl: product?.imageUrl || '',
      isAvailable: product?.isAvailable ?? true,
      status: product?.status || 'ACTIVE',
    },
  });
  const isAvailableValue = watch('isAvailable');

  const handleGeneralSubmit = async (formData) => {
    setGeneralSuccess(null);
    setGeneralError(null);
    try {
      await updateProductMutation.mutateAsync({ id, payload: formData });
      setGeneralSuccess('تم تحديث بيانات المنتج بنجاح.');
    } catch (err) {
      setGeneralError(err?.message || 'حدث خطأ أثناء تحديث بيانات المنتج.');
    }
  };

  const handleOpenModifierModal = (mod = null) => {
    setModifierToEdit(mod);
    setIsModifierModalOpen(true);
  };

  const handleDeleteModifier = async (mod) => {
    setActionError(null);
    if (!window.confirm(`هل أنت متأكد من حذف الإضافة "${mod.name}"؟`)) return;
    try {
      await deleteModifierMutation.mutateAsync({ productId: id, modifierId: mod.id });
    } catch (err) {
      setActionError(err?.message || 'حدث خطأ أثناء حذف الإضافة.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height={48} className="w-1/3" />
        <LoadingSkeleton height={300} className="w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-status-danger-bg border border-status-danger/30 rounded-lg p-6 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-status-danger mx-auto" />
        <h3 className="text-base font-bold text-txt-primary">فشل في تحميل تفاصيل المنتج</h3>
        <p className="text-xs text-txt-muted">{error?.message || 'تعذر التواصل مع الخادم.'}</p>
        <Button size="sm" variant="outline" onClick={refetch}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section with back button */}
      <div className="flex items-center gap-3 pb-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/menu')}
          icon={ChevronRight}
        >
          العودة للمنيو
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-txt-primary">{product?.name || 'تفاصيل المنتج'}</h1>
          {product?.status === 'ACTIVE' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-status-success-bg text-status-success border border-status-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
              نشط
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-status-neutral-bg text-status-neutral border border-status-neutral/20">
              <span className="w-1.5 h-1.5 rounded-full bg-status-neutral" />
              معطل
            </span>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border-default bg-bg-surface px-4 pt-2 rounded-t-lg">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-txt-muted hover:text-txt-primary'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>البيانات العامة</span>
        </button>

        <button
          onClick={() => setActiveTab('modifiers')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'modifiers'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-txt-muted hover:text-txt-primary'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>الإضافات والخيارات ({modifiers.length})</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="bg-bg-surface border border-border-default border-t-0 rounded-b-lg p-6">
        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <form onSubmit={handleSubmit(handleGeneralSubmit)} className="space-y-6 text-right" noValidate>
            {generalSuccess && (
              <div className="p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{generalSuccess}</span>
              </div>
            )}

            {generalError && (
              <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="التصنيف"
                options={categoryOptions}
                placeholder="اختر التصنيف..."
                required
                error={errors.categoryId?.message}
                {...register('categoryId')}
              />

              <Input
                label="اسم المنتج"
                icon={Utensils}
                required
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="السعر (EGP)"
                type="number"
                step="0.01"
                icon={DollarSign}
                required
                error={errors.price?.message}
                {...register('price')}
              />

              <Input
                label="رابط الصورة (Image URL)"
                type="url"
                icon={Image}
                error={errors.imageUrl?.message}
                {...register('imageUrl')}
              />
            </div>

            <div className="flex flex-col gap-1.5 w-full text-right">
              <label className="text-xs font-medium text-txt-primary">وصف المنتج (اختياري)</label>
              <textarea
                rows={3}
                placeholder="أدخل مكونات أو تفاصيل المنتج..."
                className="w-full bg-bg-surface text-txt-primary placeholder:text-txt-muted border border-border-default rounded-md text-sm px-3 py-2 transition-colors focus-visible:outline-none focus-visible:border-brand-primary"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-status-danger font-medium mt-0.5">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="flex items-center justify-between p-3 bg-bg-surface-elevated/50 border border-border-default rounded-md">
                <div>
                  <span className="text-xs font-medium text-txt-primary block">التوافر الفوري للمطبخ</span>
                  <span className="text-[11px] text-txt-muted">متاح للطلب الآن على الكاشير/الواتساب</span>
                </div>
                <Toggle
                  checked={isAvailableValue}
                  onChange={(val) => setValue('isAvailable', val)}
                  label="تغيير التوافر"
                />
              </div>

              <Select
                label="حالة المنتج الإدارية"
                options={PRODUCT_STATUS_OPTIONS}
                error={errors.status?.message}
                {...register('status')}
              />
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-border-subtle">
              <PermissionGate permission="menu.manage">
                <Button type="submit" variant="primary" size="sm" isLoading={updateProductMutation.isPending}>
                  حفظ البيانات العامة
                </Button>
              </PermissionGate>
            </div>
          </form>
        )}

        {/* Tab 2: Product Modifiers */}
        {activeTab === 'modifiers' && (
          <div className="space-y-4">
            {actionError && (
              <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-primary" />
                  <span>خيارات المنتج والإضافات</span>
                </h2>
              </div>

              <PermissionGate permission="menu.manage">
                <Button variant="secondary" size="sm" icon={PlusCircle} onClick={() => handleOpenModifierModal()}>
                  إضافة خيار جديد
                </Button>
              </PermissionGate>
            </div>

            {modifiersQuery.isLoading ? (
              <LoadingSkeleton height={120} className="w-full" />
            ) : modifiersQuery.isError ? (
              <div className="p-4 bg-status-danger/10 border border-status-danger/30 rounded-md text-xs text-status-danger text-center">
                {modifiersQuery.error?.message || 'تعذر جلب إضافات المنتج'}
              </div>
            ) : modifiers.length === 0 ? (
              <EmptyState
                title="لا توجد إضافات معرفة لهذا المنتج"
                description="يمكنك إضافة خيارات مثل: حجم كبير (+20), جبنة إضافية (+15) لإتاحتها للعملاء والكاشير."
                actionLabel="إضافة الخيار الأول"
                onAction={() => handleOpenModifierModal()}
                icon={Layers}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-bg-surface-elevated border-b border-border-default text-txt-muted font-bold">
                    <tr>
                      <th className="p-3">اسم الخيار / الإضافة</th>
                      <th className="p-3">الفرق في السعر</th>
                      <th className="p-3">نوع الخيار</th>
                      <th className="p-3 text-left">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    {modifiers.map((mod) => (
                      <tr key={mod.id} className="hover:bg-bg-surface-elevated/40 transition-colors">
                        <td className="p-3 font-bold text-txt-primary">{mod.name}</td>
                        <td className="p-3 font-bold text-brand-primary">
                          {Number(mod.priceDelta) > 0 ? `+${mod.priceDelta} EGP` : 'بدون زيادة (0 EGP)'}
                        </td>
                        <td className="p-3">
                          <StatusPill status={mod.isRequired ? 'warning' : 'neutral'}>
                            {mod.isRequired ? 'إجباري عند الطلب' : 'اختياري'}
                          </StatusPill>
                        </td>
                        <td className="p-3 text-left">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Edit}
                              onClick={() => handleOpenModifierModal(mod)}
                              title="تعديل الإضافة"
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              icon={Trash2}
                              onClick={() => handleDeleteModifier(mod)}
                              title="حذف الإضافة"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ModifierFormModal
        isOpen={isModifierModalOpen}
        onClose={() => setIsModifierModalOpen(false)}
        productId={id}
        modifierToEdit={modifierToEdit}
      />
    </div>
  );
};