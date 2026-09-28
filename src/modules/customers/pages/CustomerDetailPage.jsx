import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useCustomerQuery,
  useCustomerAddressesQuery,
  useCustomerOrdersQuery,
  useDeleteCustomerMutation,
  useDeleteAddressMutation,
} from '../hooks/useCustomers.js';
import { CustomerFormModal } from '../components/CustomerFormModal.jsx';
import { AddressFormModal } from '../components/AddressFormModal.jsx';
import { CustomerInfoCard } from '../components/detail/CustomerInfoCard.jsx';
import { CustomerAddressesCard } from '../components/detail/CustomerAddressesCard.jsx';
import { CustomerOrdersHistoryTable } from '../components/detail/CustomerOrdersHistoryTable.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import {
  User,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Trash2,
} from 'lucide-react';

export const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actionSuccess, setActionSuccess] = useAutoDismiss();
  const [actionError, setActionError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const { data: customer, isLoading, isError, error, refetch } = useCustomerQuery(id);
  const { data: addresses, isLoading: isAddrLoading } = useCustomerAddressesQuery(id);
  const { data: ordersResponse, isLoading: isOrdersLoading } = useCustomerOrdersQuery(id, { page: 1, limit: 20 });
  const deleteMutation = useDeleteCustomerMutation();
  const deleteAddressMutation = useDeleteAddressMutation();

  const runAction = async (fn) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await fn();
      setActionSuccess('تم تنفيذ العملية بنجاح.');
      return true;
    } catch (err) {
      setActionError(err?.message || 'حدث خطأ أثناء تنفيذ العملية.');
      return false;
    }
  };

  const handleDeleteCustomer = async () => {
    const ok = await runAction(() => deleteMutation.mutateAsync(id));
    if (ok) {
      setIsDeleteOpen(false);
      navigate('/customers');
    }
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;
    const ok = await runAction(() =>
      deleteAddressMutation.mutateAsync({ customerId: id, addressId: addressToDelete.id })
    );
    if (ok) setAddressToDelete(null);
  };

  const openEditAddress = (addr) => {
    setAddressToEdit(addr);
    setIsAddressOpen(true);
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
        <h3 className="text-base font-bold text-txt-primary">فشل في تحميل بيانات العميل</h3>
        <p className="text-xs text-txt-muted">{error?.message || 'تعذر التواصل مع الخادم.'}</p>
        <Button size="sm" variant="outline" onClick={refetch}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-default">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={() => navigate('/customers')} icon={ChevronRight}>
            العودة للعملاء
          </Button>
          <div>
            <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
              <User className="w-5 h-5 text-brand-primary" />
              <span>{customer?.name || 'ملف العميل'}</span>
            </h1>
            <p className="text-xs text-txt-muted mt-0.5 dir-ltr text-right">
              {customer?.phone || 'بدون رقم هاتف'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PermissionGate permission="customers.update">
            <Button size="sm" variant="outline" icon={Edit3} onClick={() => setIsEditOpen(true)}>
              تعديل البيانات
            </Button>
          </PermissionGate>
          <PermissionGate permission="customers.delete">
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف العميل</span>
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          <CustomerOrdersHistoryTable
            ordersResponse={ordersResponse}
            isLoading={isOrdersLoading}
          />
        </div>

        <div className="lg:col-span-4 space-y-5">
          <CustomerInfoCard customer={customer} />
          <CustomerAddressesCard
            addresses={addresses || []}
            isLoading={isAddrLoading}
            onAddAddress={() => {
              setAddressToEdit(null);
              setIsAddressOpen(true);
            }}
            onEditAddress={openEditAddress}
            onDeleteAddress={(addr) => setAddressToDelete(addr)}
          />
        </div>
      </div>

      {/* Modals */}
      <CustomerFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        customer={customer}
      />

      <AddressFormModal
        isOpen={isAddressOpen}
        onClose={() => {
          setIsAddressOpen(false);
          setAddressToEdit(null);
        }}
        customerId={id}
        address={addressToEdit}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="حذف العميل نهائيًا"
        message={`هل أنت متأكد من حذف العميل "${customer?.name}"؟ سيتم حذف جميع بياناته وعناوينه المسجلة.`}
        confirmLabel="نعم، حذف العميل"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteCustomer}
      />

      <ConfirmDialog
        isOpen={Boolean(addressToDelete)}
        onClose={() => setAddressToDelete(null)}
        title="حذف العنوان"
        message="هل أنت متأكد من رغبتك في حذف هذا العنوان من سجل العميل؟"
        confirmLabel="حذف"
        variant="danger"
        isLoading={deleteAddressMutation.isPending}
        onConfirm={handleDeleteAddress}
      />
    </div>
  );
};
