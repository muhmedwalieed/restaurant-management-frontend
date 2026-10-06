import React, { useState, useMemo } from 'react';
import { useBranch } from '../../auth/context/BranchContext.jsx';
import { useShiftsListQuery, useCurrentShiftQuery } from '../hooks/useShifts.js';
import { useCurrency } from '../../../shared/hooks/useCurrency.js';
import { ShiftThermalReceipt } from '../components/shifts/ShiftThermalReceipt.jsx';
import { OpenShiftModal } from '../components/shifts/OpenShiftModal.jsx';
import { CloseShiftModal } from '../components/shifts/CloseShiftModal.jsx';
import { CashMovementModal } from '../components/shifts/CashMovementModal.jsx';
import { XReportModal } from '../components/shifts/XReportModal.jsx';
import {
  Clock,
  User,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Calendar,
  Filter,
  Plus,
  Lock,
  History,
  FileText,
  RotateCcw,
  BarChart3,
  ArrowDownUp,
  Search,
  X,
} from 'lucide-react';

export const ShiftsListPage = () => {
  const { activeBranchId, activeBranch } = useBranch();
  const { currency } = useCurrency();
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'OPEN' | 'CLOSED'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShiftForDetails, setSelectedShiftForDetails] = useState(null);
  const [printableShift, setPrintableShift] = useState(null);
  const [printType, setPrintType] = useState('Z_REPORT');

  // Active Modals
  const [isOpenShiftOpen, setIsOpenShiftOpen] = useState(false);
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);
  const [isCashMovementOpen, setIsCashMovementOpen] = useState(false);
  const [isXReportOpen, setIsXReportOpen] = useState(false);

  const { data: currentShiftResponse, refetch: refetchCurrentShift } = useCurrentShiftQuery(activeBranchId);
  const activeShift = currentShiftResponse?.activeShift ?? currentShiftResponse?.data?.activeShift ?? null;

  const { data: listResponse, isLoading, refetch } = useShiftsListQuery(activeBranchId, {
    status: statusFilter || undefined,
  });

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

  // Overall statistics
  const stats = useMemo(() => {
    let totalSales = 0;
    let totalCash = 0;
    let totalDiscrepancy = 0;
    let closedCount = 0;

    for (const s of shifts) {
      totalSales += Number(s.totalSales) || 0;
      totalCash += Number(s.cashSales) || 0;
      if (s.status === 'CLOSED') {
        closedCount += 1;
        totalDiscrepancy += Number(s.cashDifference) || 0;
      }
    }

    return { totalSales, totalCash, totalDiscrepancy, closedCount };
  }, [shifts]);

  const handlePrintReceipt = (shift, type = 'Z_REPORT') => {
    setPrintableShift(shift);
    setPrintType(type);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-6 pb-12 text-right text-zinc-100" dir="rtl">
      {/* Printable Thermal Receipt Container */}
      <ShiftThermalReceipt
        shift={printableShift}
        reportType={printType}
        restaurantName={activeBranch?.name || 'مطعم برايم'}
        currency={currency}
      />

      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-950/80 p-5 rounded-3xl border border-zinc-850 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <History size={24} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-zinc-100">
              سجل وإدارة الورديات
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              متابعة عهد الكاشير، تقارير الإغلاق، ومطابقة النقدية بالدرج
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeShift ? (
            <>
              <button
                type="button"
                onClick={() => setIsXReportOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-zinc-200 hover:bg-zinc-850 border border-zinc-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <BarChart3 size={15} className="text-emerald-400" />
                <span>تقرير مبيعات الوردية</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCashMovementOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-zinc-200 hover:bg-zinc-850 border border-zinc-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ArrowDownUp size={15} className="text-amber-400" />
                <span>سحب / إيداع نقدية</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCloseShiftOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
              >
                <Lock size={15} />
                <span>إغلاق الوردية الحالية</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsOpenShiftOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
            >
              <Plus size={15} />
              <span>فتح وردية جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 shadow-sm space-y-2">
          <span className="text-xs text-zinc-400 font-medium block">الوردية الحالية</span>
          {activeShift ? (
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                مفتوحة #{activeShift.shiftNumber}
              </span>
              <div className="text-xs font-bold text-zinc-200 mt-1.5 truncate">
                {activeShift.employee?.name || 'الكاشير'}
              </div>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-900 text-zinc-500 border border-zinc-800">
              لا توجد وردية مفتوحة
            </span>
          )}
        </div>

        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs text-zinc-400 font-medium block">إجمالي المبيعات</span>
          <div className="text-lg font-black text-zinc-100 font-mono flex items-center gap-1" dir="rtl">
            <span>{stats.totalSales.toFixed(0)}</span>
            <span className="text-xs text-zinc-400 font-normal font-sans">{currency}</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs text-zinc-400 font-medium block">المبيعات النقدية (الكاش)</span>
          <div className="text-lg font-black text-emerald-400 font-mono flex items-center gap-1" dir="rtl">
            <span>{stats.totalCash.toFixed(0)}</span>
            <span className="text-xs text-zinc-400 font-normal font-sans">{currency}</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs text-zinc-400 font-medium block">صافي الفوارق (عجز/زيادة)</span>
          <div
            className={`text-lg font-black font-mono flex items-center gap-1 ${
              Math.abs(stats.totalDiscrepancy) < 0.01
                ? 'text-emerald-400'
                : stats.totalDiscrepancy > 0
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
            dir="rtl"
          >
            <span>{stats.totalDiscrepancy > 0 ? `+${stats.totalDiscrepancy.toFixed(0)}` : stats.totalDiscrepancy.toFixed(0)}</span>
            <span className="text-xs text-zinc-400 font-normal font-sans">{currency}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 p-3 rounded-2xl border border-zinc-850">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === ''
                ? 'bg-zinc-800 text-emerald-400 shadow-xs border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            كافة الورديات ({shifts.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('OPEN')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'OPEN'
                ? 'bg-zinc-800 text-emerald-400 shadow-xs border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            الورديات المفتوحة
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('CLOSED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'CLOSED'
                ? 'bg-zinc-800 text-emerald-400 shadow-xs border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            الورديات المغلقة
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالرقم أو اسم الكاشير..."
            className="w-full h-9 pr-9 pl-3 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Shifts Table */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-zinc-400">جاري تحميل سجل الورديات...</div>
        ) : shifts.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <History size={24} />
            </div>
            <h3 className="text-sm font-bold text-zinc-200">لا توجد ورديات مسجلة</h3>
            <p className="text-xs text-zinc-500">ابدأ بفتح وردية جديدة للكاشير</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-zinc-900/60 border-b border-zinc-850 text-zinc-400 font-bold">
                <tr>
                  <th className="py-3.5 px-4">رقم الوردية</th>
                  <th className="py-3.5 px-4">الكاشير / الموظف</th>
                  <th className="py-3.5 px-4">وقت البدء</th>
                  <th className="py-3.5 px-4">وقت الإغلاق</th>
                  <th className="py-3.5 px-4">عهدة البداية</th>
                  <th className="py-3.5 px-4">إجمالي المبيعات</th>
                  <th className="py-3.5 px-4">الفعلي المحصى</th>
                  <th className="py-3.5 px-4">الفارق (عجز/زيادة)</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/60">
                {shifts.map((s) => {
                  const starting = Number(s.startingCash) || 0;
                  const sales = Number(s.totalSales) || 0;
                  const actual = s.actualCash !== null ? Number(s.actualCash) : null;
                  const diff = s.cashDifference !== null ? Number(s.cashDifference) : 0;
                  const isOpen = s.status === 'OPEN';

                  return (
                    <tr key={s.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-zinc-100 font-mono">
                        #{s.shiftNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-200">
                          {s.employee?.name || 'الكاشير'}
                        </div>
                        {s.employee?.email && <div className="text-[10px] text-zinc-500 font-mono">{s.employee.email}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 font-mono">
                        {new Date(s.openedAt).toLocaleString('ar-EG', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 font-mono">
                        {s.closedAt
                          ? new Date(s.closedAt).toLocaleString('ar-EG', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        {starting.toFixed(0)} <span className="text-[10px] font-sans text-zinc-500">{currency}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-100">
                        {sales.toFixed(0)} <span className="text-[10px] font-sans text-zinc-500">{currency}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-100">
                        {actual !== null ? `${actual.toFixed(0)} ${currency}` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {isOpen ? (
                          <span className="text-zinc-500 text-[11px]">قيد العمل</span>
                        ) : (
                          <span
                            className={`font-mono font-bold ${
                              Math.abs(diff) < 0.01
                                ? 'text-emerald-400'
                                : diff > 0
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {diff > 0 ? `+${diff.toFixed(0)}` : diff.toFixed(0)} {currency}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isOpen
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-zinc-850 text-zinc-400 border-zinc-700/60'
                          }`}
                        >
                          {isOpen ? '🟢 مفتوحة' : '🔒 مغلقة'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedShiftForDetails(s)}
                            className="p-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="عرض التفاصيل"
                          >
                            <FileText size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrintReceipt(s, isOpen ? 'X_REPORT' : 'Z_REPORT')}
                            className="p-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="طباعة الإيصال الحراري"
                          >
                            <Printer size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <OpenShiftModal
        isOpen={isOpenShiftOpen}
        onClose={() => {
          setIsOpenShiftOpen(false);
          refetch();
          refetchCurrentShift();
        }}
        branchId={activeBranchId}
      />

      <CloseShiftModal
        isOpen={isCloseShiftOpen}
        onClose={() => {
          setIsCloseShiftOpen(false);
          refetch();
          refetchCurrentShift();
        }}
        branchId={activeBranchId}
        shift={activeShift}
        onPrintZReport={(finalShift) => handlePrintReceipt(finalShift, 'Z_REPORT')}
      />

      <CashMovementModal
        isOpen={isCashMovementOpen}
        onClose={() => {
          setIsCashMovementOpen(false);
          refetch();
          refetchCurrentShift();
        }}
        branchId={activeBranchId}
        shiftId={activeShift?.id}
      />

      <XReportModal
        isOpen={isXReportOpen}
        onClose={() => setIsXReportOpen(false)}
        branchId={activeBranchId}
        shiftId={activeShift?.id}
        onPrintXReport={(report) => handlePrintReceipt(report, 'X_REPORT')}
      />

      {/* Details View Modal */}
      {selectedShiftForDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn" dir="rtl">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-4 sm:p-5 space-y-4 text-xs animate-scaleUp">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-100">تفاصيل وردية #{selectedShiftForDetails.shiftNumber}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedShiftForDetails.status === 'OPEN'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700/60'
                  }`}
                >
                  {selectedShiftForDetails.status === 'OPEN' ? 'مفتوحة' : 'مغلقة'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedShiftForDetails(null)}
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
                  {Number(selectedShiftForDetails.startingCash || 0).toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>إجمالي المبيعات:</span>
                <span className="font-mono font-bold text-zinc-100" dir="ltr">
                  {Number(selectedShiftForDetails.totalSales || 0).toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>مبيعات نقدية (كاش):</span>
                <span className="font-mono font-bold text-emerald-400" dir="ltr">
                  {Number(selectedShiftForDetails.cashSales || 0).toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>مبيعات فيزا وبطاقات:</span>
                <span className="font-mono font-bold text-blue-400" dir="ltr">
                  {Number(selectedShiftForDetails.cardSales || 0).toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>إنستاباي ومحافظ:</span>
                <span className="font-mono font-bold text-indigo-400" dir="ltr">
                  {(Number(selectedShiftForDetails.instaPaySales || 0) + Number(selectedShiftForDetails.walletSales || 0)).toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-800 font-bold text-zinc-200">
                <span>النقدية المتوقعة بالدرج:</span>
                <span className="font-mono text-emerald-400" dir="ltr">
                  {Number(selectedShiftForDetails.expectedCash || 0).toFixed(2)} {currency}
                </span>
              </div>
              {selectedShiftForDetails.actualCash !== null && (
                <div className="flex justify-between font-bold text-zinc-200">
                  <span>النقدية الفعلية المحصاة:</span>
                  <span className="font-mono" dir="ltr">
                    {Number(selectedShiftForDetails.actualCash).toFixed(2)} {currency}
                  </span>
                </div>
              )}
              {selectedShiftForDetails.cashDifference !== null && (
                <div className="flex justify-between font-bold pt-2 border-t border-zinc-800">
                  <span>الفارق المالي (عجز/زيادة):</span>
                  <span
                    className={`font-mono ${
                      Number(selectedShiftForDetails.cashDifference) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                    dir="ltr"
                  >
                    {Number(selectedShiftForDetails.cashDifference).toFixed(2)} {currency}
                  </span>
                </div>
              )}
            </div>

            {/* Notes */}
            {selectedShiftForDetails.closeNotes && (
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850">
                <span className="text-[11px] font-bold text-zinc-400 block mb-1">ملاحظات الإغلاق:</span>
                <p className="text-zinc-300 text-[11px] leading-relaxed">{selectedShiftForDetails.closeNotes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => setSelectedShiftForDetails(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-800 text-zinc-300 hover:bg-zinc-850 transition-colors cursor-pointer"
              >
                رجوع
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePrintReceipt(
                    selectedShiftForDetails,
                    selectedShiftForDetails.status === 'OPEN' ? 'X_REPORT' : 'Z_REPORT'
                  );
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <Printer size={14} />
                <span>طباعة الإيصال الحراري</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftsListPage;
