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
} from 'lucide-react';

const formatArabicOrderDate = (dateString) => {
  if (!dateString) return 'غير محدد';
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `اليوم، ${timeStr}`;
  if (isYesterday) return `أمس، ${timeStr}`;
  return `${date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric', year: 'numeric' })}، ${timeStr}`;
};

const InfoRow = ({ icon: Icon, label, value, isPhone }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border-subtle/40 last:border-b-0 text-xs">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-brand-primary shrink-0" />
      <span className="font-medium text-txt-muted">{label}:</span>
    </div>
    <span className={`font-semibold text-txt-primary text-left ${isPhone ? 'font-mono dir-ltr' : ''}`}>
      {value || 'غير محدد'}
    </span>
  </div>
);

export const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
        <AlertCircle className="w-6 h-6 text-status-danger mx-auto" />
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
      {/* Top Header & Actions */}
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
              className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف العميل</span>
            </button>
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

      {/* Single Profile Hub — 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Right Main Column (65% width): Orders History */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-bg-surface border border-border-default rounded-lg p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border-default pb-3">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-brand-primary" />
                <h3 className="text-sm font-bold text-txt-primary">سجل الطلبات</h3>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-bg-surface-elevated text-txt-muted border border-border-subtle">
                  {ordersResponse?.pagination?.total || ordersResponse?.items?.length || 0}
                </span>
              </div>
            </div>

            {isOrdersLoading ? (
              <LoadingSkeleton height={180} className="w-full" />
            ) : !ordersResponse?.items || ordersResponse.items.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <ReceiptText className="w-8 h-8 text-txt-muted mx-auto opacity-50" />
                <p className="text-sm font-bold text-txt-primary">لا توجد طلبات سابقة لهذا العميل</p>
                <p className="text-xs text-txt-muted">عند إنشاء طلب جديد للكاشير أو الواتساب سيظهر هنا فوراً.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-bg-base border-b border-border-default text-txt-muted font-bold">
                    <tr>
                      <th className="p-3">رقم الطلب</th>
                      <th className="p-3">التاريخ والوقت</th>
                      <th className="p-3">الحالة</th>
                      <th className="p-3">الفرع</th>
                      <th className="p-3">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {ordersResponse.items.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                      >
                        <td className="p-3 font-mono font-bold text-brand-primary group-hover:underline">
                          #{order.orderNumber}
                        </td>
                        <td className="p-3 text-txt-muted">
                          {formatArabicOrderDate(order.createdAt)}
                        </td>
                        <td className="p-3">
                          <StatusPill status={orderStatusPill(order.status)}>
                            {ORDER_STATUS_LABELS[order.status] || order.status}
                          </StatusPill>
                        </td>
                        <td className="p-3 text-xs text-slate-400 truncate max-w-[140px]">
                          {order.branch?.name || 'غير محدد'}
                        </td>
                        <td className="p-3 font-mono font-bold tabular-nums text-txt-primary">
                          {Number(order.total || 0).toFixed(2)} EGP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Left Side Column (35% width): Profile Info Card & Saved Addresses Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Customer Profile Card (RTL Label/Value Alignment, Uniform p-5) */}
          <div className="bg-bg-surface border border-border-default rounded-lg p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border-default pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-brand-primary" />
                <h3 className="text-sm font-bold text-txt-primary">معلومات الحساب</h3>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <InfoRow icon={Phone} label="رقم الهاتف" value={customer?.phone} isPhone />
              <InfoRow icon={Mail} label="البريد الإلكتروني" value={customer?.email} />
              {customer?.notes && <InfoRow icon={StickyNote} label="ملاحظات الحساب" value={customer?.notes} />}
              <InfoRow icon={ReceiptText} label="إجمالي الطلبات" value={`${customer?._count?.orders ?? 0} طلبات`} />
            </div>
          </div>

          {/* Card 2: Saved Addresses Card (Uniform p-5 padding & refined badge hierarchy) */}
          <div className="bg-bg-surface border border-border-default rounded-lg p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border-default pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-primary" />
                <h3 className="text-sm font-bold text-txt-primary">العناوين المسجلة</h3>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-bg-surface-elevated text-txt-muted border border-border-subtle">
                  {addressList.length}
                </span>
              </div>
              <PermissionGate permission="customers.update">
                <button
                  onClick={openAddAddress}
                  className="text-xs text-brand-primary hover:underline font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة عنوان</span>
                </button>
              </PermissionGate>
            </div>

            {isAddrLoading ? (
              <LoadingSkeleton height={100} className="w-full" />
            ) : addressList.length === 0 ? (
              <div className="py-6 text-center space-y-1 border border-dashed border-border-default rounded-lg bg-bg-base">
                <MapPin className="w-5 h-5 text-txt-muted mx-auto" />
                <p className="text-xs font-bold text-txt-primary">لا توجد عناوين مسجلة</p>
                <p className="text-[11px] text-txt-muted">أضف عنوان توصيل لهذا العميل لتسهيل الطلبات.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addressList.map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-bg-base border border-border-default rounded-lg p-3.5 space-y-2 transition-colors hover:border-border-subtle"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">
                          {ADDRESS_LABELS[addr.label] || addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[11px] text-slate-400 bg-white/[0.04] border border-white/10 px-1.5 py-0.5 rounded font-normal">
                            العنوان الرئيسي
                          </span>
                        )}
                      </div>

                      {/* Flat Action Icons (16px, vertically aligned) */}
                      <div className="flex items-center gap-1">
                        <PermissionGate permission="customers.update">
                          <button
                            onClick={() => openEditAddress(addr)}
                            className="p-1 text-txt-muted hover:text-white transition-colors rounded"
                            title="تعديل العنوان"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </PermissionGate>
                        <PermissionGate permission="customers.delete">
                          <button
                            onClick={() => handleDeleteAddress(addr.id, addr.label)}
                            className="p-1 text-txt-muted hover:text-red-400 transition-colors rounded"
                            title="حذف العنوان"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </PermissionGate>
                      </div>
                    </div>

                    <p className="text-xs text-txt-muted leading-relaxed">{addr.street || 'عنوان التوصيل'}</p>
                    {(addr.city || addr.state || addr.postalCode) && (
                      <p className="text-[11px] text-txt-muted">
                        {[addr.city, addr.state, addr.postalCode].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CustomerFormModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} customerToEdit={customer} />
      <AddressFormModal isOpen={isAddressOpen} onClose={() => setIsAddressOpen(false)} customerId={id} addressToEdit={addressToEdit} />

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="تأكيد حذف العميل" size="sm">
        <div className="space-y-4 text-right">
          <p className="text-xs text-txt-muted">
            هل أنت متأكد من حذف العميل <span className="font-bold text-txt-primary">{customer?.name}</span>؟ سيتم إخفاؤه من القائمة مع الحفاظ على طلباته السابقة.
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