import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { tableFormSchema, TABLE_STATUS_OPTIONS } from '../schemas/table.schema.js';
import { useCreateTableMutation, useUpdateTableMutation } from '../hooks/useTables.js';
import { Grid3x3, Users, Edit3 } from 'lucide-react';

export const TableFormModal = ({ isOpen, onClose, branchId, tableToEdit = null }) => {
  const isEditing = Boolean(tableToEdit);
  const createMutation = useCreateTableMutation();
  const updateMutation = useUpdateTableMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tableFormSchema),
    defaultValues: {
      label: '',
      capacity: 2,
      status: 'AVAILABLE',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (tableToEdit) {
        reset({
          label: tableToEdit.label || '',
          capacity: tableToEdit.capacity ?? 2,
          status: tableToEdit.status || 'AVAILABLE',
        });
      } else {
        reset({ label: '', capacity: 2, status: 'AVAILABLE' });
      }
    }
  }, [isOpen, tableToEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ branchId, id: tableToEdit.id, payload: data });
      } else {
        await createMutation.mutateAsync({ branchId, payload: data });
      }
      onClose();
    } catch (err) {
      // Handled by query/interceptor error state
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'تعديل الترابيزة' : 'إضافة ترابيزة جديدة'}
      subtitle={isEditing ? 'تعديل اسم/رقم الترابيزة والسعة والحالة' : 'أدخل بيانات الترابيزة الجديدة لإضافتها للفرع'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="اسم / رقم الترابيزة"
          placeholder="مثال: T1، طاولة 5، شباك 2..."
          required
          icon={isEditing ? Edit3 : Grid3x3}
          error={errors.label?.message}
          {...register('label')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="السعة (عدد الأفراد)"
            type="number"
            min="1"
            helperText="أقصى عدد أفراد على الترابيزة"
            icon={Users}
            error={errors.capacity?.message}
            {...register('capacity')}
          />

          <Select
            label="حالة الترابيزة"
            options={TABLE_STATUS_OPTIONS}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        {(createMutation.isError || updateMutation.isError) && (
          <div className="p-3 bg-status-danger/10 border border-status-danger/30 rounded-md text-xs text-status-danger">
            {createMutation.error?.message ||
              updateMutation.error?.message ||
              'حدث خطأ أثناء حفظ الترابيزة، يرجى المحاولة مرة أخرى'}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" isLoading={isPending}>
            {isEditing ? 'حفظ التعديلات' : 'إضافة الترابيزة'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};