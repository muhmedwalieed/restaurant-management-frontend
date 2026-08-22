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
import { ADDRESS_LABELS } from '../schemas/customer.schema.js';
import { ORDER_STATUS_LABELS, orderStatusPill } from '../../orders/schemas/order.schema.js';
import { Button } from '../../../shared/components/Button.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { Modal } from '../../../shared/components/Modal.jsx';
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { useAutoDismiss } from '../../../shared/hooks/useAutoDismiss.js';
import {
  User,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  StickyNote,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Trash2,
  Plus,
  ReceiptText,
  Star,
} from 'lucide-react';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-3">
    <span className="p-1.5 rounded-md bg-bg-base text-brand-primary shrink-0">
      <Icon className="w-4 h-4" />
    </span>
    <div className="min-w-0">
      <p className="text-[11px] text-txt-muted">{label}</p>
      <p className="text-sm font-semibold text-txt-primary truncate">{value || '—'}</p>
    </div>
  </div>
);

export const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [actionSuccess, setActionSuccess] = useAutoDismiss();
  const [actionError, setActionError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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

  const handleDeleteAddress = async (addressId, label) => {
    if (!window.confirm(`هل أنت متأكد من حذف العنوان (${ADDRESS_LABELS[label] || label})؟`)) return;
    await runAction(() => deleteAddressMutation.mutateAsync({ customerId: id, addressId }));
  };

  const openAddAddress = () => {
    setAddressToEdit(null);
    setIsAddressOpen(true);
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
        <AlertCircle className="w-8 h-8 text-status-danger mx-auto" />
        <h3 className="text-base font-bold text-txt-primary">فشل في تحميل بيانات العميل</h3>
        <p className="text-xs text-txt-muted">{error?.message || 'تعذر التواصل مع الخادم.'}</p>
        <Button size="sm" variant="outline" onClick={refetch}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const addressList = addresses || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => navigate('/customers')} icon={ChevronRight}>
          العودة للعملاء
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <User className="w-5 h-5 text-brand-primary" />
            <span>{customer?.name || 'ملف العميل'}</span>
          </h1>
          <PermissionGate permission="customers.update">
            <Button size="sm" variant="outline" icon={Edit3} onClick={() => setIsEditOpen(true)}>
              تعديل البيانات
            </Button>
          </PermissionGate>
          <PermissionGate permission="customers.delete">
            <Button size="sm" variant="danger" icon={Trash2} onClick={() => setIsDeleteOpen(true)}>
              حذف العميل
            </Button>
          </PermissionGate>
        </div>
      </div>

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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border-default bg-bg-surface px-4 pt-2 rounded-t-lg">
        {[
          { key: 'profile', label: 'بيانات العميل', icon: User },
          { key: 'addresses', label: `العناوين (${addressList.length})`, icon: MapPin },
          { key: 'orders', label: 'الطلبات', icon: ReceiptText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-txt-muted hover:text-txt-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-bg-surface border border-border-default border-t-0 rounded-b-lg p-6">
        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden max-w-2xl">
            <div className="px-4 py-3 border-b border-border-default flex items-center gap-2">
              <User className="w-4 h-4 text-brand-primary" />
              <h3 className="text-sm font-bold text-txt-primary">معلومات العميل</h3>
            </div>
            <div className="px-4 py-2 divide-y divide-border-subtle">
              <InfoRow icon={User} label="الاسم" value={customer?.name} />
              <InfoRow icon={Phone} label="رقم الهاتف" value={customer?.phone} />
              <InfoRow icon={Mail} label="البريد الإلكتروني" value={customer?.email} />
              <InfoRow icon={StickyNote} label="ملاحظات" value={customer?.notes} />
              <InfoRow icon={ReceiptText} label="عدد الطلبات" value={String(customer?._count?.orders ?? 0)} />
            </div>
          </div>
        )}

        {/* Tab 2: Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-end">
              <PermissionGate permission="customers.update">
                <Button variant="primary" size="sm" icon={Plus} onClick={openAddAddress}>
                  إضافة عنوان
                </Button>
              </PermissionGate>
            </div>

            {isAddrLoading ? (
              <LoadingSkeleton height={120} className="w-full" />
            ) : addressList.length === 0 ? (
              <div className="p-6 text-center space-y-1">
                <MapPin className="w-8 h-8 text-txt-muted mx-auto" />
                <p className="text-sm font-bold text-txt-primary">لا توجد عناوين</p>
                <p className="text-xs text-txt-muted">أضف عنوان توصيل لهذا العميل.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addressList.map((addr) => (
                  <div key={addr.id} className="bg-bg-base border border-border-default rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-txt-primary flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                        {ADDRESS_LABELS[addr.label] || addr.label}
                        {addr.isDefault && (
                          <Star className="w-3.5 h-3.5 text-brand-primary fill-brand-primary" />
                        )}
                      </span>
                      <div className="flex items-center gap-1">
                        <PermissionGate permission="customers.update">
                          <Button variant="outline" size="sm" icon={Edit3} onClick={() => openEditAddress(addr)} />
                          <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDeleteAddress(addr.id, addr.label)} />
                        </PermissionGate>
                      </div>
                    </div>
                    <p className="text-xs text-txt-muted">{addr.street || ''}</p>
                    <p className="text-xs text-txt-muted">
                      {[addr.city, addr.state, addr.postalCode].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Orders */}
        {activeTab === 'orders' && (
          <div>
            {isOrdersLoading ? (
              <LoadingSkeleton height={150} className="w-full" />
            ) : !ordersResponse?.items || ordersResponse.items.length === 0 ? (
              <div className="p-6 text-center space-y-1">
                <ReceiptText className="w-8 h-8 text-txt-muted mx-auto" />
                <p className="text-sm font-bold text-txt-primary">لا توجد طلبات لهذا العميل</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-bg-surface-elevated border-b border-border-default text-txt-muted font-bold">
                    <tr>
                      <th className="p-3">رقم الطلب</th>
                      <th className="p-3">الحالة</th>
                      <th className="p-3">الفرع</th>
                      <th className="p-3">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    {ordersResponse.items.map((order) => (
                      <tr key={order.id} className="hover:bg-bg-surface-elevated/40 transition-colors">
                        <td className="p-3">
                          <button
                            onClick={() => navigate(`/orders/${order.id}`)}
                            className="font-mono font-bold text-brand-primary hover:underline"
                          >
                            #{order.orderNumber}
                          </button>
                        </td>
                        <td className="p-3">
                          <StatusPill status={orderStatusPill(order.status)}>{ORDER_STATUS_LABELS[order.status] || order.status}</StatusPill>
                        </td>
                        <td className="p-3 text-txt-muted">{order.branch?.name || '—'}</td>
                        <td className="p-3 font-bold text-txt-primary">{Number(order.total || 0).toFixed(2)} EGP</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <CustomerFormModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} customerToEdit={customer} />
      <AddressFormModal isOpen={isAddressOpen} onClose={() => setIsAddressOpen(false)} customerId={id} addressToEdit={addressToEdit} />

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="تأكيد حذف العميل" size="sm">
        <div className="space-y-4 text-right">
          <p className="text-xs text-txt-muted">
            هل أنت متأكد من حذف العميل <span className="font-bold text-txt-primary">{customer?.name}</span>؟ سيتم إخفاؤه من القائمة مع الحفاظ على طلباته.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)} disabled={deleteMutation.isPending}>
              تراجع
            </Button>
            <Button variant="danger" size="sm" isLoading={deleteMutation.isPending} onClick={handleDeleteCustomer}>
              حذف العميل
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};