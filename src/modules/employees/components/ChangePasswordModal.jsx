
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Lock } from 'lucide-react';

export const changePasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'كلمة المرور يجب أن لا تقل عن 6 أحرف'),
    confirmPassword: z.string().min(6, 'يرجى تأكيد كلمة المرور'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  });

export const ChangePasswordModal = ({
  isOpen,
  onClose,
  employee,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ newPassword: '', confirmPassword: '' });
    }
  }, [isOpen, reset]);

  const handleFormSubmit = (data) => {

    onSubmit({ newPassword: data.newPassword });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تغيير كلمة المرور"
      subtitle={`تغيير كلمة مرور الحساب الخاص بـ ${employee?.name || ''}`}
      size="sm"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-right" noValidate>
        <Input
          label="كلمة المرور الجديدة"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          required
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />

        <Input
          label="تأكيد كلمة المرور"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-subtle">
          <Button variant="outline" size="sm" onClick={onClose} isDisabled={isLoading}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            تغيير كلمة المرور
          </Button>
        </div>
      </form>
    </Modal>
  );
};
