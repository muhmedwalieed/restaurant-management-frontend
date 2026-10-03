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
  Layers,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../shared/components/Button.jsx';
import { Modal } from '../../../shared/components/Modal.jsx';

export const ShiftsListPage = () => {
  const { activeBranchId, activeBranch } = useBranch();
  const { currency } = useCurrency();
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'OPEN' | 'CLOSED'
  const [selectedShiftForDetails, setSelectedShiftForDetails] = useState(null);
  const [printableShift, setPrintableShift] = useState(null);
  const [printType, setPrintType] = useState('Z_REPORT');

  // Active Modals
  const [isOpenShiftOpen, setIsOpenShiftOpen] = useState(false);
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);
  const [isCashMovementOpen, setIsCashMovementOpen] = useState(false);
  const [isXReportOpen, setIsXReportOpen] = useState(false);

  const { data: currentShiftResponse } = useCurrentShiftQuery(activeBranchId);
  const activeShift = currentShiftResponse?.data?.activeShift;

  const { data: listResponse, isLoading, refetch } = useShiftsListQuery(activeBranchId, {
    status: statusFilter || undefined,
  });

  const shifts = useMemo(() => {
    if (!listResponse) return [];
    if (Array.isArray(listResponse)) return listResponse;
    if (Array.isArray(listResponse?.data)) return listResponse.data;
    if (Array.isArray(listResponse?.items)) return listResponse.items;
    return [];
  }, [listResponse]);

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
    <div className="space-y-6 pb-12 text-right">
      {/* Printable Thermal Receipt Container */}
      <ShiftThermalReceipt
        shift={printableShift}
        reportType={printType}
        restaurantName={activeBranch?.name || 'مطعم برايم'}
        currency={currency}
      />

      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary-500" />
            سجل وإدارة الورديات (Shift Management)
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            متابعة عهد الكاشير، تقارير الإغلاق اليومية (Z-Reports)، ومطابقة النقدية
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeShift ? (
            <>
              <button
                type="button"
                onClick={() => setIsXReportOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-primary-500" />
                تقرير لحظي (X-Report)
              </button>

              <button
                type="button"
                onClick={() => setIsCashMovementOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 transition-colors flex items-center gap-1.5"
              >
                <DollarSign className="w-4 h-4 text-amber-500" />
                حركة نقدية بالدرج
              </button>

              <button
                type="button"
                onClick={() => setIsCloseShiftOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Lock className="w-4 h-4" />
                إغلاق الوردية الحالية
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsOpenShiftOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              فتح وردية جديدة
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-zinc-400 font-medium block mb-1">الوردية الحالية</span>
          {activeShift ? (
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                🟢 مفتوحة #{activeShift.shiftNumber}
              </span>
              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1.5">
                {activeShift.employee?.name}
              </div>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              ⚪ لا توجد وردية مفتوحة
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-zinc-400 font-medium block mb-1">إجمالي المبيعات</span>
          <div className="text-lg font-black text-zinc-900 dark:text-zinc-100">
            {stats.totalSales.toFixed(2)} <span className="text-xs text-zinc-400 font-normal">{currency}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-zinc-400 font-medium block mb-1">المبيعات النقدية (الكاش)</span>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
            {stats.totalCash.toFixed(2)} <span className="text-xs text-zinc-400 font-normal">{currency}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-zinc-400 font-medium block mb-1">صافي الفوارق (عجز/زيادة)</span>
          <div
            className={`text-lg font-black ${
              Math.abs(stats.totalDiscrepancy) < 0.01
                ? 'text-emerald-600 dark:text-emerald-400'
                : stats.totalDiscrepancy > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {stats.totalDiscrepancy > 0 ? `+${stats.totalDiscrepancy.toFixed(2)}` : stats.totalDiscrepancy.toFixed(2)}{' '}
            <span className="text-xs text-zinc-400 font-normal">{currency}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          type="button"
          onClick={() => setStatusFilter('')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === ''
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          كافة الورديات ({shifts.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('OPEN')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'OPEN'
              ? 'bg-emerald-600 text-white'
              : 'text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
          }`}
        >
          الورديات المفتوحة
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('CLOSED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'CLOSED'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          الورديات المغلقة
        </button>
      </div>

      {/* Shifts Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-zinc-400">جاري تحميل سجل الورديات...</div>
        ) : shifts.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">لا توجد ورديات مسجلة</h3>
            <p className="text-xs text-zinc-400">ابدأ بفتح وردية جديدة للكاشير</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">رقم الوردية</th>
                  <th className="py-3.5 px-4">الكاشير / الموظف</th>
                  <th className="py-3.5 px-4">وقت البدء</th>
                  <th className="py-3.5 px-4">وقت الإغلاق</th>
                  <th className="py-3.5 px-4">عهدة البداية</th>
                  <th className="py-3.5 px-4">إجمالي المبيعات</th>
                  <th className="py-3.5 px-4">الفعلي المحصي</th>
                  <th className="py-3.5 px-4">الفارق (عجز/زيادة)</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {shifts.map((s) => {
                  const starting = Number(s.startingCash) || 0;
                  const sales = Number(s.totalSales) || 0;
                  const actual = s.actualCash !== null ? Number(s.actualCash) : null;
                  const diff = s.cashDifference !== null ? Number(s.cashDifference) : 0;
                  const isOpen = s.status === 'OPEN';

                  return (
                    <tr key={s.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        #{s.shiftNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {s.employee?.name || 'الكاشير'}
                        </div>
                        <div className="text-[10px] text-zinc-400">{s.employee?.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                        {new Date(s.openedAt).toLocaleString('ar-EG', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                        {s.closedAt
                          ? new Date(s.closedAt).toLocaleString('ar-EG', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-700 dark:text-zinc-300">
                        {starting.toFixed(2)} {currency}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {sales.toFixed(2)} {currency}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {actual !== null ? `${actual.toFixed(2)} ${currency}` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {isOpen ? (
                          <span className="text-zinc-400 text-[11px]">قيد العمل</span>
                        ) : (
                          <span
                            className={`font-bold inline-flex items-center gap-1 ${
                              Math.abs(diff) < 0.01
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : diff > 0
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)} {currency}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isOpen
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
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
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            title="عرض التفاصيل"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrintReceipt(s, isOpen ? 'X_REPORT' : 'Z_REPORT')}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            title="طباعة الإيصال الحراري"
                          >
                            <Printer className="w-4 h-4" />
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
        }}
        branchId={activeBranchId}
      />

      <CloseShiftModal
        isOpen={isCloseShiftOpen}
        onClose={() => {
          setIsCloseShiftOpen(false);
          refetch();
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
        <Modal
          isOpen={Boolean(selectedShiftForDetails)}
          onClose={() => setSelectedShiftForDetails(null)}
          title={`تفاصيل الوردية #${selectedShiftForDetails.shiftNumber}`}
          subtitle={`الكاشير: ${selectedShiftForDetails.employee?.name} | الحالة: ${selectedShiftForDetails.status === 'OPEN' ? 'مفتوحة' : 'مغلقة'}`}
          size="md"
        >
          <div className="space-y-4 text-right text-xs">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">رصيد عهدة البداية:</span>
                <span className="font-bold">{Number(selectedShiftForDetails.startingCash || 0).toFixed(2)} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">إجمالي المبيعات:</span>
                <span className="font-bold">{Number(selectedShiftForDetails.totalSales || 0).toFixed(2)} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">مبيعات نقدية (كاش):</span>
                <span className="font-bold text-emerald-600">{Number(selectedShiftForDetails.cashSales || 0).toFixed(2)} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">مبيعات فيزا وبطاقات:</span>
                <span className="font-bold text-blue-600">{Number(selectedShiftForDetails.cardSales || 0).toFixed(2)} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">إنستاباي ومحافظ:</span>
                <span className="font-bold text-purple-600">{(Number(selectedShiftForDetails.instaPaySales || 0) + Number(selectedShiftForDetails.walletSales || 0)).toFixed(2)} {currency}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700 font-bold">
                <span className="text-zinc-700 dark:text-zinc-300">النقدية المتوقعة:</span>
                <span>{Number(selectedShiftForDetails.expectedCash || 0).toFixed(2)} {currency}</span>
              </div>
              {selectedShiftForDetails.actualCash !== null && (
                <div className="flex justify-between font-bold">
                  <span className="text-zinc-700 dark:text-zinc-300">النقدية الفعلية:</span>
                  <span>{Number(selectedShiftForDetails.actualCash).toFixed(2)} {currency}</span>
                </div>
              )}
              {selectedShiftForDetails.cashDifference !== null && (
                <div className="flex justify-between font-black pt-1 border-t border-zinc-200 dark:border-zinc-700">
                  <span>الفارق المالي:</span>
                  <span className={Number(selectedShiftForDetails.cashDifference) >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {Number(selectedShiftForDetails.cashDifference).toFixed(2)} {currency}
                  </span>
                </div>
              )}
            </div>

            {selectedShiftForDetails.openNotes && (
              <div>
                <span className="font-bold block text-zinc-500 mb-0.5">ملاحظات الافتتاح:</span>
                <p className="text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg">
                  {selectedShiftForDetails.openNotes}
                </p>
              </div>
            )}

            {selectedShiftForDetails.closeNotes && (
              <div>
                <span className="font-bold block text-zinc-500 mb-0.5">ملاحظات الإغلاق:</span>
                <p className="text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg">
                  {selectedShiftForDetails.closeNotes}
                </p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSelectedShiftForDetails(null)}>
                إغلاق
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => handlePrintReceipt(selectedShiftForDetails, selectedShiftForDetails.status === 'OPEN' ? 'X_REPORT' : 'Z_REPORT')}
                className="bg-zinc-900 dark:bg-zinc-700 hover:bg-zinc-800 text-white font-bold"
              >
                <Printer className="w-4 h-4 ml-1.5" />
                طباعة الإيصال الحراري
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
