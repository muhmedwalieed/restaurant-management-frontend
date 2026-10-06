import React, { useState, useMemo } from 'react';
import {
  History,
  X,
  Printer,
  FileText,
  Calendar,
  Clock,
  User,
  ArrowDownUp,
  Coins,
  CheckCircle2,
  Lock,
  ChevronLeft,
  Search,
} from 'lucide-react';
import { useShiftsListQuery } from '../../hooks/useShifts.js';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';

export const ShiftsHistoryModal = ({
  isOpen,
  onClose,
  branchId,
  onPrintReceipt,
  restaurantName = 'مطعم برايم',
}) => {
  const { currency } = useCurrency();
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'OPEN' | 'CLOSED'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShift, setSelectedShift] = useState(null);
  const { data: listResponse, isLoading, refetch } = useShiftsListQuery(
    branchId,
    {
      status: statusFilter || undefined,
    },
    {
      enabled: Boolean(isOpen && branchId),
    }
  );

  const shifts = useMemo(() => {
    if (!listResponse) return [];
    let items = [];
    if (Array.isArray(listResponse)) items = listResponse;
    else if (Array.isArray(listResponse?.data)) items = listResponse.data;
    else if (Array.isArray(listResponse?.items)) items = listResponse.items;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter(
        (s) =>
          String(s.shiftNumber).includes(q) ||
          s.employee?.name?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [listResponse, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn" dir="rtl">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-zinc-100 animate-scaleUp">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-850 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">سجل وأرشيف الورديات</h3>
              <p className="text-xs text-zinc-400 font-medium">
                متابعة عهد الكاشير، تقارير الإغلاق، ومطابقة النقدية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-850/80 bg-zinc-900/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === ''
                  ? 'bg-zinc-800 text-emerald-400 shadow-xs border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              الكل ({shifts.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('OPEN')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'OPEN'
                  ? 'bg-zinc-800 text-emerald-400 shadow-xs border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              المفتوحة
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('CLOSED')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'CLOSED'
                  ? 'bg-zinc-800 text-emerald-400 shadow-xs border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              المغلقة
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الوردية أو الكاشير..."
              className="w-full h-9 pr-9 pl-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Content Body / Shifts List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-zinc-400">جاري تحميل سجل الورديات...</div>
          ) : shifts.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                <History size={22} />
              </div>
              <h4 className="text-sm font-bold text-zinc-200">لا توجد ورديات مطابقة</h4>
              <p className="text-xs text-zinc-500">لم يتم العثور على أي وردية وفق معايير البحث الحالية</p>
            </div>
          ) : (
            <div className="space-y-2">
              {shifts.map((s) => {
                const starting = Number(s.startingCash) || 0;
                const sales = Number(s.totalSales) || 0;
                const actual = s.actualCash !== null ? Number(s.actualCash) : null;
                const diff = s.cashDifference !== null ? Number(s.cashDifference) : 0;
                const isOpenShift = s.status === 'OPEN';

                return (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-2xl border border-zinc-850/80 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    {/* Shift & Employee Details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 font-mono font-bold text-sm text-zinc-100 flex items-center justify-center shrink-0">
                        #{s.shiftNumber}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-100 text-sm truncate">
                            {s.employee?.name || 'الكاشير'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isOpenShift
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700/60'
                            }`}
                          >
                            {isOpenShift ? 'نشطة الآن' : 'مغلقة'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1 font-mono">
                          <Clock size={12} className="text-zinc-500 shrink-0" />
                          <span>
                            {new Date(s.openedAt).toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' })}
                            {' - '}
                            {new Date(s.openedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {s.closedAt && (
                            <>
                              <span>←</span>
                              <span>
                                {new Date(s.closedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Financial Numbers & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-850">
                      <div className="flex items-center gap-3 text-left" dir="ltr">
                        {/* Sales */}
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-500 block">المبيعات</span>
                          <span className="font-mono font-bold text-zinc-100 text-xs">
                            {sales.toFixed(0)} <span className="text-[10px] font-normal text-zinc-400">{currency}</span>
                          </span>
                        </div>

                        {/* Discrepancy */}
                        {!isOpenShift && (
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 block">الفارق</span>
                            <span
                              className={`font-mono font-bold text-xs ${
                                Math.abs(diff) < 0.01
                                  ? 'text-emerald-400'
                                  : diff > 0
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {diff > 0 ? `+${diff.toFixed(0)}` : diff.toFixed(0)}{' '}
                              <span className="text-[10px] font-normal text-zinc-400">{currency}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedShift(s)}
                          className="px-2.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileText size={13} className="text-emerald-400" />
                          <span>التفاصيل</span>
                        </button>

                        {onPrintReceipt && (
                          <button
                            type="button"
                            onClick={() => onPrintReceipt(s, isOpenShift ? 'X_REPORT' : 'Z_REPORT')}
                            className="p-1.5 rounded-xl border border-zinc-800 bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                            title="طباعة الإيصال الحراري"
                          >
                            <Printer size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-850 flex items-center justify-end bg-zinc-900/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-800 text-zinc-300 hover:bg-zinc-850 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Selected Shift Details Modal */}
      {selectedShift && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 animate-fadeIn" dir="rtl">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-4 sm:p-5 space-y-4 text-xs animate-scaleUp">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-100">تفاصيل وردية #{selectedShift.shiftNumber}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedShift.status === 'OPEN'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700/60'
                  }`}
                >
                  {selectedShift.status === 'OPEN' ? 'مفتوحة' : 'مغلقة'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedShift(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Financial Grid */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-2">
              <div className="flex justify-between text-zinc-400">
                <span>عهدة البداية:</span>
                <span className="font-mono font-bold text-zinc-200" dir="ltr">
                  {Number(selectedShift.startingCash || 0).toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>إجمالي المبيعات:</span>
                <span className="font-mono font-bold text-zinc-100" dir="ltr">
                  {Number(selectedShift.totalSales || 0).toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>مبيعات نقدية (كاش):</span>
                <span className="font-mono font-bold text-emerald-400" dir="ltr">
                  {Number(selectedShift.cashSales || 0).toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>إنستاباي ومحافظ:</span>
                <span className="font-mono font-bold text-indigo-400" dir="ltr">
                  {(Number(selectedShift.instaPaySales || 0) + Number(selectedShift.walletSales || 0)).toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-800 font-bold text-zinc-200">
                <span>النقدية المتوقعة بالدرج:</span>
                <span className="font-mono text-emerald-400" dir="ltr">
                  {Number(selectedShift.expectedCash || 0).toFixed(2)} {currency}
                </span>
              </div>
              {selectedShift.actualCash !== null && (
                <div className="flex justify-between font-bold text-zinc-200">
                  <span>النقدية الفعلية المحصاة:</span>
                  <span className="font-mono" dir="ltr">
                    {Number(selectedShift.actualCash).toFixed(2)} {currency}
                  </span>
                </div>
              )}
              {selectedShift.cashDifference !== null && (
                <div className="flex justify-between font-bold pt-2 border-t border-zinc-800">
                  <span>الفارق المالي (عجز/زيادة):</span>
                  <span
                    className={`font-mono ${
                      Number(selectedShift.cashDifference) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                    dir="ltr"
                  >
                    {Number(selectedShift.cashDifference).toFixed(2)} {currency}
                  </span>
                </div>
              )}
            </div>

            {/* Notes */}
            {selectedShift.closeNotes && (
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850">
                <span className="text-[11px] font-bold text-zinc-400 block mb-1">ملاحظات الإغلاق:</span>
                <p className="text-zinc-300 text-[11px] leading-relaxed">{selectedShift.closeNotes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => setSelectedShift(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-800 text-zinc-300 hover:bg-zinc-850 transition-colors cursor-pointer"
              >
                رجوع
              </button>
              {onPrintReceipt && (
                <button
                  type="button"
                  onClick={() => {
                    onPrintReceipt(selectedShift, selectedShift.status === 'OPEN' ? 'X_REPORT' : 'Z_REPORT');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <Printer size={14} />
                  <span>طباعة الإيصال الحراري</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftsHistoryModal;
