import React from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { Button } from '../../../../shared/components/Button.jsx';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { useXReportQuery } from '../../hooks/useShifts.js';
import {
  FileText,
  Printer,
  DollarSign,
  CreditCard,
  Smartphone,
  Wallet,
  Clock,
  User,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react';

export const XReportModal = ({
  isOpen,
  onClose,
  branchId,
  shiftId,
  onPrintXReport,
}) => {
  const { currency } = useCurrency();
  const { data: response, isLoading } = useXReportQuery(branchId, shiftId, isOpen);
  const report = response?.data || response;

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تقرير الوردية اللحظي #${report?.shiftNumber || ''} (X-Report)`}
      subtitle="مبيعات وحسابات الوردية الحالية بدون إغلاق الوردية"
      size="md"
    >
      {isLoading ? (
        <div className="py-12 text-center text-xs text-zinc-400">جاري تحميل أرقام الوردية...</div>
      ) : (
        <div className="space-y-4 text-right">
          {/* Staff & Time summary */}
          <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary-500" />
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {report?.employee?.name || 'الكاشير'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>بدأت: {new Date(report?.openedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Key Figures Table */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
            <div className="p-3 bg-zinc-100/60 dark:bg-zinc-800/40 flex items-center justify-between font-bold">
              <span className="text-zinc-500">عهدة البداية (Starting Float):</span>
              <span className="text-zinc-900 dark:text-zinc-100">
                {Number(report?.startingCash || 0).toFixed(2)} {currency}
              </span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">مبيعات نقدية (Cash Sales):</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +{Number(report?.cashSales || 0).toFixed(2)} {currency}
              </span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">مبيعات فيزا / بطاقات (Cards):</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {Number(report?.cardSales || 0).toFixed(2)} {currency}
              </span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">إنستاباي ومحافظ إلكترونية:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {(Number(report?.instaPaySales || 0) + Number(report?.walletSales || 0)).toFixed(2)} {currency}
              </span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">استلام عهدة طيارين (COD):</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +{Number(report?.driverSettlementCash || 0).toFixed(2)} {currency}
              </span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">مصروفات نثرية مسحوبة (Cash Out):</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                -{Number(report?.cashOut || 0).toFixed(2)} {currency}
              </span>
            </div>

            <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-between font-bold text-sm">
              <span className="text-emerald-700 dark:text-emerald-300">النقدية المفترضة في الدرج الآن:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">
                {Number(report?.expectedCash || 0).toFixed(2)} {currency}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <span className="text-[11px] text-zinc-400 block">إجمالي المبيعات</span>
              <span className="font-black text-zinc-900 dark:text-zinc-100 text-sm">
                {Number(report?.totalSales || 0).toFixed(2)} {currency}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <span className="text-[11px] text-zinc-400 block">عدد الطلبات المنجزة</span>
              <span className="font-black text-zinc-900 dark:text-zinc-100 text-sm">
                {report?.ordersCount || 0} طلب
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={onClose}>
              إغلاق
            </Button>
            {onPrintXReport && (
              <Button
                type="button"
                variant="primary"
                onClick={() => onPrintXReport(report)}
                className="bg-zinc-900 dark:bg-zinc-700 hover:bg-zinc-800 text-white font-bold"
              >
                <Printer className="w-4 h-4 ml-1.5" />
                طباعة تقرير X-Report
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
