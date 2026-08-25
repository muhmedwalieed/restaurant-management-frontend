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
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import { ImageUploadInput } from '../../../shared/components/ImageUploadInput.jsx';
import {
  Utensils,
  Layers,
  ChevronRight,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [generalSuccess, setGeneralSuccess] = useAutoDismiss();
  const [generalError, setGeneralError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [modifierToEdit, setModifierToEdit] = useState(null);
  const [modifierToDelete, setModifierToDelete] = useState(null);

  // Queries & Mutations
  const { data: product, isLoading, isError, error, refetch } = useProductQuery(id);
  const updateProductMutation = useUpdateProductMutation();
  const categoriesQuery = useCategoriesQuery();
  const modifiersQuery = useModifiersQuery(id);
  const deleteModifierMutation = useDeleteModifierMutation();

  const categories = categoriesQuery.data?.items || [];
  const modifiers = modifiersQuery.data || [];

  const categoryOptions = categories.map((cat) => ({ value: cat.id, label: cat.name }));

  // General Form setup
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
  const statusValue = watch('status');
  const isMenuVisible = statusValue === 'ACTIVE';

  const handleGeneralSubmit = async (formData) => {
    setGeneralSuccess(null);
    setGeneralError(null);
    try {
      await updateProductMutation.mutateAsync({ id, payload: formData });
      setGeneralSuccess('تم حفظ بيانات المنتج بنجاح.');
    } catch (err) {
      setGeneralError(err?.message || 'حدث خطأ أثناء تحديث بيانات المنتج.');
    }
  };

  const handleOpenModifierModal = (mod = null) => {
    setModifierToEdit(mod);
    setIsModifierModalOpen(true);
  };

  const handleDeleteModifier = async () => {
    if (!modifierToDelete) return;
    setActionError(null);
    try {
      await deleteModifierMutation.mutateAsync({ productId: id, modifierId: modifierToDelete.id });
      setModifierToDelete(null);
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
        <AlertCircle className="w-6 h-6 text-status-danger mx-auto" />
        <h3 className="text-base font-bold text-txt-primary">فشل في تحميل تفاصيل المنتج</h3>
        <p className="text-xs text-txt-muted">{error?.message || 'تعذر التواصل مع الخادم.'}</p>
        <Button size="sm" variant="outline" onClick={refetch}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Header section with back button and primary Save CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/menu')}
            icon={ChevronRight}
            className="border-white/10 text-xs"
          >
            العودة لقائمة الطعام
          </Button>

          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
              <Utensils className="w-5 h-5 text-brand-primary" />
              <span>{product?.name || 'تفاصيل المنتج'}</span>
            </h1>
            {product?.status === 'ACTIVE' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                نشط
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                معطل
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PermissionGate permission="menu.manage">
            <Button
              type="submit"
              form="product-edit-form"
              size="sm"
              isLoading={updateProductMutation.isPending}
              className="bg-white text-slate-950 font-medium hover:bg-slate-200 border-none shadow-sm text-xs"
            >
              حفظ التعديلات
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Notifications */}
      {generalSuccess && (
        <div className="p-3 rounded-lg text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{generalSuccess}</span>
        </div>
      )}
      {generalError && (
        <div className="p-3 rounded-lg text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 rounded-lg text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 2. Unified 2-Column Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= RIGHT COLUMN (~60% / lg:col-span-7): Product Form ================= */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-brand-primary" />
                <h3 className="text-xs font-bold text-txt-primary">البيانات العامة للصنف</h3>
              </div>
              <span className="text-[11px] text-txt-muted">
                معرف الصنف: <span className="font-mono">{id?.slice(0, 8)}...</span>
              </span>
            </div>

            <form
              id="product-edit-form"
              onSubmit={handleSubmit(handleGeneralSubmit)}
              className="space-y-4 text-right"
              noValidate
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="اسم المنتج"
                  required
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Select
                  label="التصنيف"
                  options={categoryOptions}
                  placeholder="اختر التصنيف..."
                  required
                  error={errors.categoryId?.message}
                  {...register('categoryId')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="سعر الصنف"
                  type="number"
                  step="0.01"
                  min="0"
                  suffix="ج.م"
                  required
                  error={errors.price?.message}
                  {...register('price')}
                />

                <ImageUploadInput
                  label="صورة الصنف"
                  value={watch('imageUrl')}
                  onChange={(url) => setValue('imageUrl', url, { shouldValidate: true })}
                  hint="ارفع صورة من جهازك (JPG/PNG/WEBP/GIF حتى 2MB)"
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full text-right">
                <label className="text-xs font-medium text-txt-primary">وصف ومكونات الصنف</label>
                <textarea
                  rows={3}
                  dir="auto"
                  placeholder="أدخل مكونات أو تفاصيل الصنف..."
                  className="w-full bg-bg-surface text-txt-primary placeholder:text-txt-muted border border-border-default rounded-lg text-sm px-3 py-2 transition-colors focus-visible:outline-none focus-visible:border-brand-primary"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-xs text-status-danger font-medium mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Dual Clean Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-bg-base/60 border border-border-subtle rounded-xl">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-txt-primary block">التوافر الفوري</span>
                    <span className="text-[11px] text-txt-muted block">متاح للطلب الآن بالمطبخ</span>
                  </div>
                  <Toggle
                    checked={isAvailableValue}
                    onChange={(val) => setValue('isAvailable', val)}
                    label="التوافر الفوري"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-bg-base/60 border border-border-subtle rounded-xl">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-txt-primary block">القائمة الرقمية</span>
                    <span className="text-[11px] text-txt-muted block">إظهار في منيو الـ QR</span>
                  </div>
                  <Toggle
                    checked={isMenuVisible}
                    onChange={(val) => setValue('status', val ? 'ACTIVE' : 'INACTIVE')}
                    label="إظهار في القائمة"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ================= LEFT COLUMN (~40% / lg:col-span-5): Modifiers Card ================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-primary" />
                <h3 className="text-xs font-bold text-txt-primary">خيارات وإضافات الصنف</h3>
              </div>

              <PermissionGate permission="menu.manage">
                <Button
                  variant="outline"
                  size="sm"
                  icon={PlusCircle}
                  onClick={() => handleOpenModifierModal()}
                  className="border-white/10 text-xs h-7 px-2.5"
                >
                  إضافة خيار
                </Button>
              </PermissionGate>
            </div>

            <p className="text-xs text-txt-muted leading-relaxed">
              إتاحة أحجام، صوصات، أو إضافات خاصة (Add-ons) يختار منها العميل عند الطلب.
            </p>

            {modifiersQuery.isLoading ? (
              <LoadingSkeleton height={120} className="w-full" />
            ) : modifiersQuery.isError ? (
              <div className="p-4 bg-status-danger/10 border border-status-danger/30 rounded-lg text-xs text-status-danger text-center">
                {modifiersQuery.error?.message || 'تعذر جلب إضافات المنتج'}
              </div>
            ) : modifiers.length === 0 ? (
              <div className="py-6 text-center space-y-1 bg-bg-base/30 rounded-lg border border-border-subtle">
                <Layers className="w-5 h-5 text-txt-muted mx-auto" />
                <p className="text-xs font-semibold text-txt-primary">لا توجد إضافات لهذا الصنف بعد</p>
                <p className="text-[11px] text-txt-muted">مثل: جبنة إضافية (+15 ج.م)، حجم كبير (+20 ج.م).</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border-subtle">
                <table className="w-full text-right text-xs">
                  <thead className="bg-bg-base/60 border-b border-border-subtle text-txt-muted font-bold">
                    <tr>
                      <th className="p-2.5">الخيار</th>
                      <th className="p-2.5">الفرق</th>
                      <th className="p-2.5 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {modifiers.map((mod) => (
                      <tr key={mod.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-2.5">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-txt-primary block">{mod.name}</span>
                            {mod.isRequired && (
                              <span className="text-[10px] text-amber-400 font-medium">إجباري</span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 font-mono font-bold text-white whitespace-nowrap">
                          {Number(mod.priceDelta) > 0 ? `+${mod.priceDelta} ج.م` : 'مجاني'}
                        </td>
                        <td className="p-2.5 text-center">
                          <PermissionGate permission="menu.manage">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenModifierModal(mod)}
                                className="p-1 rounded-md text-txt-muted hover:text-white hover:bg-white/[0.06] transition-colors"
                                title="تعديل الإضافة"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setModifierToDelete(mod)}
                                className="p-1 rounded-md text-txt-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="حذف الإضافة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </PermissionGate>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modifier Add/Edit Modal */}
      <ModifierFormModal
        isOpen={isModifierModalOpen}
        onClose={() => {
          setIsModifierModalOpen(false);
          setModifierToEdit(null);
        }}
        productId={id}
        modifierToEdit={modifierToEdit}
      />

      <ConfirmDialog
        isOpen={Boolean(modifierToDelete)}
        onClose={() => setModifierToDelete(null)}
        title="حذف الإضافة"
        message={`هل أنت متأكد من حذف الإضافة "${modifierToDelete?.name}"؟`}
        confirmLabel="حذف"
        variant="danger"
        isLoading={deleteModifierMutation.isPending}
        onConfirm={handleDeleteModifier}
      />
    </div>
  );
};