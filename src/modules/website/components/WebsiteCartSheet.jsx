import React from 'react';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Select } from '../../../shared/components/Select.jsx';
import { ShoppingCart, Plus, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';

const ORDER_TYPES = [
  { value: 'DELIVERY', label: 'توصيل للمنزل' },
  { value: 'PICKUP', label: 'استلام من المطعم' },
];

export const WebsiteCartSheet = ({
  cart = [],
  cartTotal = 0,
  cartCount = 0,
  onChangeQty,
  name,
  setName,
  phone,
  setPhone,
  orderType,
  setOrderType,
  address,
  setAddress,
  placing = false,
  placedOrder,
  submitError,
  onPlaceOrder,
}) => {
  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border-default pb-3">
        <h2 className="text-sm font-bold text-txt-primary flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-brand-primary" />
          <span>سلة المشتريات</span>
        </h2>
        <span className="text-xs text-txt-muted">{cartCount} أصناف</span>
      </div>

      {placedOrder ? (
        <div className="bg-status-success-bg border border-status-success/30 rounded-xl p-4 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-status-success mx-auto" />
          <h3 className="text-sm font-bold text-txt-primary">تم استلام طلبك بنجاح!</h3>
          <p className="text-xs text-txt-muted">
            رقم الطلب: <strong className="text-txt-primary font-mono text-base">#{placedOrder.orderNumber}</strong>
          </p>
          <p className="text-[11px] text-txt-muted">
            احتفظ برقم الطلب لتتبعه لاحقًا من خانة «تتبع الطلب».
          </p>
        </div>
      ) : cart.length === 0 ? (
        <p className="text-xs text-txt-muted text-center py-6">السلة فارغة حالياً.</p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2 divide-y divide-border-subtle max-h-48 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.productId} className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-txt-primary truncate">{item.name}</p>
                  <p className="text-txt-muted text-[11px] font-mono">
                    {item.quantity} × {item.unitPrice} = {(item.quantity * item.unitPrice).toFixed(2)} EGP
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onChangeQty(item.productId, -1)}
                    className="w-5 h-5 rounded border border-border-default flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-mono font-bold text-xs">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onChangeQty(item.productId, 1)}
                    className="w-5 h-5 rounded border border-border-default flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border-default flex items-center justify-between text-xs font-bold">
            <span className="text-txt-muted">المجموع الإجمالي:</span>
            <span className="font-mono text-base text-brand-primary">{cartTotal.toFixed(2)} EGP</span>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-border-default">
            <Input
              label="الاسم الكامل"
              placeholder="مثال: أحمد محمد"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="رقم الهاتف"
              placeholder="مثال: 01012345678"
              dir="ltr"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Select
              label="نوع الطلب"
              value={orderType}
              onChange={setOrderType}
              options={ORDER_TYPES}
            />
            {orderType === 'DELIVERY' && (
              <Input
                label="عنوان التوصيل"
                placeholder="الشارع، رقم العمارة، الشقة..."
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            )}
          </div>

          {submitError && (
            <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <Button
            variant="primary"
            className="w-full"
            isLoading={placing}
            onClick={onPlaceOrder}
          >
            تأكيد وإرسال الطلب
          </Button>
        </div>
      )}
    </div>
  );
};
