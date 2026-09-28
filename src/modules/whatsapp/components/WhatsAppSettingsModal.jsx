import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../shared/components/Modal.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { updateConnectionSchema } from '../schemas/whatsapp.schema.js';
import { WhatsAppMetaCredentialsFields } from './settings/WhatsAppMetaCredentialsFields.jsx';
import {
  Settings,
  Phone,
  MessageSquare,
} from 'lucide-react';

export const WhatsAppSettingsModal = ({
  isOpen,
  onClose,
  connection,
  onUpdate,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateConnectionSchema),
    defaultValues: {
      displayName: '',
      provider: 'META',
      providerPhoneNumberId: '',
      apiToken: '',
      webhookSecret: '',
      verifyToken: '',
      status: 'ACTIVE',
    },
  });

  const selectedProvider = watch('provider');

  useEffect(() => {
    if (connection && isOpen) {
      reset({
        displayName: connection.displayName || '',
        provider: connection.provider || 'META',
        providerPhoneNumberId: connection.providerPhoneNumberId || '',
        apiToken: '',
        webhookSecret: '',
        verifyToken: connection.verifyToken || '',
        status: connection.status || 'ACTIVE',
      });
    }
  }, [connection, isOpen, reset]);

  const onSubmit = async (data) => {
    const payload = {};
    if (data.displayName !== undefined) payload.displayName = data.displayName;
    if (data.provider) payload.provider = data.provider;
    if (data.providerPhoneNumberId) payload.providerPhoneNumberId = data.providerPhoneNumberId;
    if (data.status) payload.status = data.status;
    if (data.verifyToken !== undefined) payload.verifyToken = data.verifyToken;
    if (data.apiToken && data.apiToken.trim() !== '') payload.apiToken = data.apiToken.trim();
    if (data.webhookSecret && data.webhookSecret.trim() !== '') payload.webhookSecret = data.webhookSecret.trim();

    const success = await onUpdate(payload);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل إعدادات الواتساب"
      subtitle="تعديل بيانات الاتصال وMeta Cloud API والتحقق الرقمي"
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-brand-primary" />
            <span>البيانات الأساسية</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="اسم العرض للاتصال"
              placeholder="مثال: الفرع الرئيسي"
              icon={MessageSquare}
              error={errors.displayName?.message}
              {...register('displayName')}
            />

            <Select
              label="نوع المزود (Provider)"
              options={[
                { value: 'META', label: 'Meta Cloud API (الرسمي الإنتاجي)' },
                { value: 'MOCK', label: 'Mock (اختباري محلي)' },
              ]}
              {...register('provider')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number ID"
              dir="ltr"
              placeholder="مثال: 1233113343227409"
              icon={Phone}
              error={errors.providerPhoneNumberId?.message}
              {...register('providerPhoneNumberId')}
            />

            <Select
              label="حالة الاتصال"
              options={[
                { value: 'ACTIVE', label: 'نشط (مفعل)' },
                { value: 'DISCONNECTED', label: 'مفصول (معطل مؤقتاً)' },
              ]}
              {...register('status')}
            />
          </div>
        </div>

        {selectedProvider === 'META' && (
          <WhatsAppMetaCredentialsFields
            connection={connection}
            register={register}
            errors={errors}
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            حفظ التغييرات
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default WhatsAppSettingsModal;
