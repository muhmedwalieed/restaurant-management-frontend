import { ShoppingCart, Trash2, Utensils, ShoppingBag, Bike, Phone, Users, MapPin, History, MessageSquarePlus, ChevronUp, Plus, Minus } from 'lucide-react';
import { OrderSourcePicker } from './OrderSourcePicker.jsx';
import { TableQuickPicker } from './TableQuickPicker.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';

export const PosOrderTicket = ({
  cart,
  itemCount,
  total,
  source,
  setSource,
  orderType,
  setOrderType,
  tables,
  tableId,
  setTableId,
  customerPhone,
  setCustomerPhone,
  customerName,
  setCustomerName,
  address,
  setAddress,
  caller,
  showNotes,
  setShowNotes,
  notes,
  setNotes,
  showClearConfirm,
  setShowClearConfirm,
  handleClearCart,
  changeQty,
  handleSubmit,
  isPending,
}) => {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-2.5 border-b border-border-default bg-bg-base/60 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-bold text-txt-primary">تذكرة الطلب ({itemCount})</h3>
          </div>
          {cart.length > 0 && (
            <div>
              {showClearConfirm ? (
                <div className="flex items-center gap-1 animate-fadeIn">
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="px-2 py-0.5 text-[10px] font-bold bg-status-danger text-white rounded hover:bg-red-600 transition-colors"
                  >
                    تأكيد
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-0.5 text-[10px] font-medium bg-white/10 text-txt-muted rounded hover:bg-white/20 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="text-[11px] font-medium text-txt-muted hover:text-red-400 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تفريغ</span>
                </button>
              )}
            </div>
          )}
        </div>

        <OrderSourcePicker value={source} onChange={setSource} />

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-txt-primary block">نوع الطلب</label>
          <div className="grid grid-cols-3 gap-1 p-0.5 bg-bg-base/80 border border-border-default rounded-lg">
            <button
              type="button"
              onClick={() => setOrderType('DINE_IN')}
              className={`py-1 px-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                orderType === 'DINE_IN'
                  ? 'bg-brand-primary text-slate-950 shadow-sm'
                  : 'text-txt-muted hover:text-txt-primary hover:bg-white/[0.04]'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>صالة</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType('PICKUP')}
              className={`py-1 px-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                orderType === 'PICKUP'
                  ? 'bg-brand-primary text-slate-950 shadow-sm'
                  : 'text-txt-muted hover:text-txt-primary hover:bg-white/[0.04]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>استلام</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType('DELIVERY')}
              className={`py-1 px-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                orderType === 'DELIVERY'
                  ? 'bg-brand-primary text-slate-950 shadow-sm'
                  : 'text-txt-muted hover:text-txt-primary hover:bg-white/[0.04]'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>توصيل</span>
            </button>
          </div>
        </div>

        {orderType === 'DINE_IN' ? (
          <TableQuickPicker tables={tables} value={tableId} onChange={setTableId} required />
        ) : (
          <div className="space-y-1.5 pt-0.5">
            <Input
              label="رقم هاتف العميل"
              dir="ltr"
              icon={Phone}
              placeholder="01x xxxx xxxx"
              required={orderType === 'DELIVERY' || orderType === 'PICKUP'}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="text-xs h-7 min-h-[28px]"
            />
            <Input
              label="اسم العميل"
              icon={Users}
              placeholder="أحمد علي"
              required={orderType === 'DELIVERY'}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="text-xs h-7 min-h-[28px]"
            />
            {orderType === 'DELIVERY' && (
              <Input
                label="عنوان التوصيل"
                icon={MapPin}
                placeholder="عنوان الشارع / المبنى..."
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="text-xs h-7 min-h-[28px]"
              />
            )}
          </div>
        )}

        {caller?.recentOrders && caller.recentOrders.length > 0 && (
          <div className="p-1.5 bg-bg-surface-elevated/60 border border-border-default rounded space-y-1 text-xs">
            <div className="flex items-center justify-between font-bold text-txt-primary">
              <span className="flex items-center gap-1 text-brand-primary text-[10px]">
                <History className="w-3 h-3" />
                <span>آخر طلبات العميل ({caller.recentOrders.length})</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2 space-y-1.5 bg-bg-base/10">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-6 text-center text-txt-muted">
            <ShoppingCart className="w-8 h-8 opacity-20 mb-1.5" />
            <p className="text-xs font-medium">السلة فارغة</p>
            <p className="text-[10px] opacity-70">اضغط على الأصناف من القائمة لإضافتها</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.lineKey}
              className="flex items-center justify-between gap-2.5 bg-bg-base/70 border border-border-subtle rounded-lg p-2.5 hover:border-white/10 transition-colors"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-txt-primary truncate leading-normal">{item.name}</p>
                  <span className="text-xs font-mono font-bold text-brand-primary shrink-0 tabular-nums">
                    {(item.unitPrice * item.quantity).toFixed(2)} EGP
                  </span>
                </div>
                {item.modifierNames && item.modifierNames.length > 0 && (
                  <p className="text-[10px] text-brand-primary leading-tight truncate">
                    {item.modifierNames.join(' + ')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0 bg-bg-surface px-1.5 py-1 rounded border border-border-default">
                <button
                  type="button"
                  onClick={() => changeQty(item.lineKey, -1)}
                  className="w-5 h-5 rounded bg-white/[0.05] hover:bg-white/[0.15] flex items-center justify-center text-txt-primary text-xs transition-colors"
                  title="إنقاص"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 text-center text-xs font-mono font-bold text-txt-primary">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => changeQty(item.lineKey, 1)}
                  className="w-5 h-5 rounded bg-white/[0.05] hover:bg-white/[0.15] flex items-center justify-center text-txt-primary text-xs transition-colors"
                  title="زيادة"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-border-default bg-bg-base/90 space-y-2.5 shrink-0 shadow-inner mt-auto">
        <div>
          {showNotes ? (
            <div className="space-y-1 animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold text-txt-muted">ملاحظات الطلب</label>
                <button
                  type="button"
                  onClick={() => setShowNotes(false)}
                  className="text-[10px] text-txt-muted hover:text-txt-primary flex items-center gap-0.5"
                >
                  <span>إخفاء</span>
                  <ChevronUp className="w-3 h-3" />
                </button>
              </div>
              <textarea
                rows={2}
                placeholder="أي طلبات خاصة..."
                className="w-full bg-bg-surface text-txt-primary placeholder:text-txt-muted border border-border-default rounded text-xs p-1.5 focus-visible:outline-none focus-visible:border-brand-primary resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNotes(true)}
              className="text-[11px] font-medium text-txt-muted hover:text-brand-primary flex items-center gap-1 transition-colors py-0.5"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>{notes.trim() ? 'تعديل ملاحظات الطلب' : '+ إضافة ملاحظات الطلب'}</span>
              {notes.trim() && <span className="w-1.5 h-1.5 rounded-full bg-brand-primary inline-block" />}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
          <span className="text-xs font-semibold text-txt-muted">الإجمالي النهائي:</span>
          <span className="text-base font-bold text-white font-mono tabular-nums">{total.toFixed(2)} EGP</span>
        </div>

        <PermissionGate permission="orders.create">
          <Button
            size="md"
            className="w-full bg-brand-primary text-slate-950 font-bold hover:bg-amber-400 disabled:bg-white/10 disabled:text-txt-muted disabled:cursor-not-allowed border-none shadow-md transition-all h-9 text-xs"
            disabled={cart.length === 0 || isPending}
            isLoading={isPending}
            onClick={handleSubmit}
          >
            إرسال الطلب ({total.toFixed(2)} EGP)
          </Button>
        </PermissionGate>
      </div>
    </div>
  );
};

export default PosOrderTicket;