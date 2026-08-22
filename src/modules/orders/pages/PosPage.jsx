import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductsQuery } from '../../menu/hooks/useMenu.js';
import { useTablesQuery } from '../../tables/hooks/useTables.js';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useCreatePosOrderMutation } from '../hooks/useOrders.js';
import { Select } from '../../../shared/components/Select.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { ORDER_TYPE_OPTIONS } from '../schemas/order.schema.js';
import {
  Utensils,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Users,
  Phone,
} from 'lucide-react';

export const PosPage = () => {
  const navigate = useNavigate();
  const { activeBranchId, activeBranch } = useBranch();
  const { data: productsResponse, isLoading } = useProductsQuery({ page: 1, limit: 100, status: 'ACTIVE' });
  const { data: tablesResponse } = useTablesQuery(activeBranchId, { page: 1, limit: 100, status: 'AVAILABLE' });
  const createPosMutation = useCreatePosOrderMutation();

  const products = productsResponse?.items || [];
  const tables = tablesResponse?.items || [];

  const [cart, setCart] = useState([]); // [{ productId, name, unitPrice, quantity }]
  const [orderType, setOrderType] = useState('DINE_IN');
  const [tableId, setTableId] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const addToCart = (product) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId: product.id, name: product.name, unitPrice: Number(product.price), quantity: 1 }];
    });
  };

  const changeQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const total = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleSubmit = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (cart.length === 0) {
      setErrorMsg('أضف منتجات للسلة قبل الإرسال.');
      return;
    }
    if (orderType === 'DINE_IN' && !tableId) {
      setErrorMsg('اختر الترابيزة للطلبات الداخلية.');
      return;
    }
    if ((orderType === 'DELIVERY' || orderType === 'PICKUP') && !customerPhone) {
      setErrorMsg('أدخل رقم هاتف العميل للتوصيل/الاستلام.');
      return;
    }
    try {
      const payload = {
        type: orderType,
        tableId: orderType === 'DINE_IN' ? tableId : undefined,
        customerPhone: customerPhone || undefined,
        customerName: customerName || undefined,
        notes: notes || undefined,
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      };
      const res = await createPosMutation.mutateAsync({
        branchId: activeBranchId,
        payload,
        idempotencyKey: `pos-${Date.now()}`,
      });
      setSuccessMsg(`تم إنشاء الطلب #${res.orderNumber} بنجاح.`);
      setCart([]);
      setTableId('');
      setCustomerPhone('');
      setCustomerName('');
      setNotes('');
    } catch (err) {
      setErrorMsg(err?.message || 'حدث خطأ أثناء إنشاء الطلب.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
            <Utensils className="w-6 h-6 text-brand-primary" />
            <span>نقطة البيع (POS)</span>
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            إنشاء طلب مباشر من الكاشير — {activeBranch?.name || ''}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
          عرض الطلبات
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-success-bg text-status-success border border-status-success/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-txt-primary">المنتجات</h3>
          {isLoading ? (
            <p className="text-sm text-txt-muted">جاري تحميل المنتجات...</p>
          ) : products.length === 0 ? (
            <EmptyState title="لا توجد منتجات" description="أضف منتجات للمنيو أولًا." icon={Utensils} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addToCart(p)}
                  className="bg-bg-surface border border-border-default rounded-xl p-3 text-right hover:border-brand-primary/50 hover:bg-bg-surface-elevated transition-colors"
                >
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                  ) : (
                    <div className="w-full h-20 bg-bg-surface-elevated rounded-lg flex items-center justify-center mb-2">
                      <Utensils className="w-6 h-6 text-txt-muted" />
                    </div>
                  )}
                  <p className="text-xs font-bold text-txt-primary truncate">{p.name}</p>
                  <p className="text-[11px] font-bold text-brand-primary">{Number(p.price).toFixed(2)} EGP</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart panel */}
        <div className="space-y-4">
          <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-txt-primary flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-brand-primary" />
                السلة ({itemCount})
              </h3>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setCart([])} title="تفريغ السلة" />
              )}
            </div>

            {cart.length === 0 ? (
              <p className="text-xs text-txt-muted text-center py-6">السلة فارغة — اضغط على منتج لإضافته.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-2 bg-bg-base border border-border-default rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-txt-primary truncate">{item.name}</p>
                      <p className="text-[11px] text-txt-muted">
                        {item.unitPrice.toFixed(2)} EGP × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="outline" size="sm" icon={Minus} onClick={() => changeQty(item.productId, -1)} />
                      <span className="w-7 text-center text-xs font-bold text-txt-primary">{item.quantity}</span>
                      <Button variant="outline" size="sm" icon={Plus} onClick={() => changeQty(item.productId, 1)} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-border-default flex items-center justify-between">
              <span className="text-sm font-semibold text-txt-primary">الإجمالي</span>
              <span className="text-lg font-bold text-brand-primary">{total.toFixed(2)} EGP</span>
            </div>
          </div>

          {/* Order info */}
          <div className="bg-bg-surface border border-border-default rounded-xl p-4 space-y-3">
            <Select
              label="نوع الطلب"
              options={ORDER_TYPE_OPTIONS}
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
            />

            {orderType === 'DINE_IN' ? (
              <Select
                label="الترابيزة"
                placeholder="اختر الترابيزة..."
                options={tables.map((t) => ({ value: t.id, label: t.label }))}
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
              />
            ) : (
              <>
                <Input label="هاتف العميل" dir="ltr" icon={Phone} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                <Input label="اسم العميل (اختياري)" icon={Users} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </>
            )}

            <textarea
              rows={2}
              placeholder="ملاحظات (اختياري)"
              className="w-full bg-bg-base text-txt-primary placeholder:text-txt-muted border border-border-default rounded-md text-xs px-3 py-2 focus-visible:outline-none focus-visible:border-brand-primary"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <PermissionGate permission="orders.create">
              <Button variant="primary" className="w-full" isLoading={createPosMutation.isPending} onClick={handleSubmit}>
                إرسال الطلب
              </Button>
            </PermissionGate>
          </div>
        </div>
      </div>
    </div>
  );
};