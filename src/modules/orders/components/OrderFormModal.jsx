import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { orderFormSchema, ORDER_TYPE_OPTIONS } from '../schemas/order.schema.js';
import { useCreateOrderMutation } from '../hooks/useOrders.js';
import { useProductsQuery } from '../../menu/hooks/useMenu.js';
import { Plus, Trash2, ShoppingCart, Users, Phone } from 'lucide-react';

export const OrderFormModal = ({ isOpen, onClose, branchId }) => {
  const createMutation = useCreateOrderMutation();
  const { data: productsResponse } = useProductsQuery({ page: 1, limit: 100, status: 'ACTIVE' });
  const products = productsResponse?.items || [];

  const productOptions = products.map((p) => ({ value: p.id, label: `${p.name} (${Number(p.price).toFixed(2)} EGP)` }));

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      type: 'DINE_IN',
      tableId: '',
      customerPhone: '',
      notes: '',
      items: [{ productId: '', quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const orderType = watch('type');

  useEffect(() => {
    if (isOpen) {
      reset({ type: 'DINE_IN', tableId: '', customerPhone: '', notes: '', items: [{ productId: '', quantity: 1 }] });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        type: data.type,
        tableId: data.type === 'DINE_IN' && data.tableId ? data.tableId : undefined,
        customerPhone: data.customerPhone || undefined,
        notes: data.notes || undefined,
        items: data.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      };
      const idempotencyKey = `order-${Date.now()}`;
      await createMutation.mutateAsync({ branchId, payload, idempotencyKey });
      onClose();
    } catch (err) {
      // Handled by interceptor / error state
    }
  };

  const isPending = createMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إنشاء طلب جديد"
      subtitle="أنشئ طلب يدوي للكاشير أو استقبال طلب مباشر"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="نوع الطلب"
          options={ORDER_TYPE_OPTIONS}
          error={errors.type?.message}
          {...register('type')}
        />

        {orderType === 'DINE_IN' && (
          <Input
            label="رقم الترابيزة (اختياري — بيتم التحقق منها تلقائيًا)"
            placeholder="مثال: T1"
            icon={Users}
            error={errors.tableId?.message}
            {...register('tableId')}
          />
        )}

        <Input
          label="رقم هاتف العميل (اختياري — بيتسجل تلقائيًا لو مش موجود)"
          placeholder="+2010..."
          icon={Phone}
          dir="ltr"
          error={errors.customerPhone?.message}
          {...register('customerPhone')}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-txt-primary flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-brand-primary" />
              الأصناف
            </label>
            <Button type="button" size="sm" variant="outline" icon={Plus} onClick={() => append({ productId: '', quantity: 1 })}>
              إضافة صنف
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[1fr_110px_auto] gap-2 items-center">
              <Select
                placeholder="اختر المنتج..."
                options={productOptions}
                error={errors.items?.[index]?.productId?.message}
                {...register(`items.${index}.productId`)}
              />
              <Input
                type="number"
                min="1"
                placeholder="كمية"
                error={errors.items?.[index]?.quantity?.message}
                {...register(`items.${index}.quantity`)}
              />
              <Button
                type="button"
                size="sm"
                variant="danger"
                icon={Trash2}
                disabled={fields.length <= 1}
                onClick={() => remove(index)}
              />
            </div>
          ))}
          {errors.items?.message && (
            <p className="text-xs text-status-danger font-medium">{errors.items.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full text-right">
          <label className="text-xs font-medium text-txt-primary">ملاحظات (اختياري)</label>
          <textarea
            rows={2}
            placeholder="ملاحظات على الطلب..."
            className="w-full bg-bg-surface text-txt-primary placeholder:text-txt-muted border border-border-default rounded-md text-sm px-3 py-2 transition-colors focus-visible:outline-none focus-visible:border-brand-primary"
            {...register('notes')}
          />
        </div>

        {createMutation.isError && (
          <div className="p-3 bg-status-danger/10 border border-status-danger/30 rounded-md text-xs text-status-danger">
            {createMutation.error?.message || 'حدث خطأ أثناء إنشاء الطلب.'}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" isLoading={isPending}>
            إنشاء الطلب
          </Button>
        </div>
      </form>
    </Modal>
  );
};