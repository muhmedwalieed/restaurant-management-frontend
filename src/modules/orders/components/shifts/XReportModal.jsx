import React from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { useCurrency } from '../../../../shared/hooks/useCurrency.js';
import { useXReportQuery } from '../../hooks/useShifts.js';
import {
  Printer,
  Clock,
  User,
  Coins,
  Banknote,
  CreditCard,
  Smartphone,
  Bike,
  ArrowDownRight,
  TrendingUp,
  ShoppingBag,
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
      title="تقرير مبيعات الوردية"
      subtitle="مبيعات وحسابات الوردية الحالية"
      size="md"
    >
      {isLoading ? (
        <div className="py-12 text-center text-xs text-zinc-400">جاري تحميل بيانات الوردية...</div>
      ) : (
        <div className="space-y-3.5 text-right">
          {/* Staff & Time summary */}
          <div className="bg-zinc-50 dark:bg-zinc-900/70 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                <User size={14} />
              </div>
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                  {report?.employee?.name || 'الكاشير'}
                </span>
                <span className="text-[10px] text-zinc-400">كاشير الوردية</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs font-medium">
              <Clock size={13} className="text-zinc-400" />
              <span>بدأت: {new Date(report?.openedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Key Figures Table */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800/80 text-xs bg-white dark:bg-zinc-950">
            {/* 1. Starting Cash */}
            <div className="p-3 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Coins size={14} className="text-zinc-400" />
                <span className="font-semibold">عهدة البداية (الافتتاحي)</span>
              </div>
              <div className="flex items-baseline gap-1" dir="rtl">
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {Number(report?.startingCash || 0).toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-zinc-400">{currency}</span>
              </div>
            </div>

            {/* 2. Cash Sales */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Banknote size={14} className="text-zinc-400" />
                <span>مبيعات نقدي (كاش)</span>
              </div>
              <div className="flex items-baseline gap-1" dir="rtl">
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {Number(report?.cashSales || 0).toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-zinc-400">{currency}</span>
              </div>
            </div>

            {/* 3. Card Sales */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <CreditCard size={14} className="text-zinc-400" />
                <span>مبيعات بطاقات (فيزا)</span>
              </div>
              <div className="flex items-baseline gap-1" dir="rtl">
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {Number(report?.cardSales || 0).toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-zinc-400">{currency}</span>
              </div>
            </div>

            {/* 4. Electronic Wallets & Instapay */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Smartphone size={14} className="text-zinc-400" />
                <span>إنستاباي ومحافظ إلكترونية</span>
              </div>
              <div className="flex items-baseline gap-1" dir="rtl">
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {(Number(report?.instaPaySales || 0) + Number(report?.walletSales || 0)).toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-zinc-400">{currency}</span>
              </div>
            </div>

            {/* 5. Driver COD */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Bike size={14} className="text-zinc-400" />
                <span>تحصيل عهدة الدليفري (طيارين)</span>
              </div>
              <div className="flex items-baseline gap-1" dir="rtl">
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {Number(report?.driverSettlementCash || 0).toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-zinc-400">{currency}</span>
              </div>
            </div>

            {/* 6. Cash Out */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <ArrowDownRight size={14} className="text-zinc-400" />
                <span>مصروفات نثرية مسحوبة</span>
              </div>
              <div className="flex items-baseline gap-1" dir="rtl">
                <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  {Number(report?.cashOut || 0).toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-zinc-400">{currency}</span>
              </div>
            </div>

            {/* 7. Expected Cash In Drawer */}
            <div className="p-3.5 bg-zinc-100/90 dark:bg-zinc-900 flex items-center justify-between font-bold border-t-2 border-zinc-300 dark:border-zinc-700">
              <span className="text-zinc-900 dark:text-white font-bold text-xs">النقدية المفترضة في الدرج الآن:</span>
              <div className="flex items-baseline gap-1.5" dir="rtl">
                <span className="font-mono font-black text-base text-zinc-950 dark:text-white">
                  {Number(report?.expectedCash || 0).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{currency}</span>
              </div>
            </div>
          </div>

          {/* Bottom KPI Cards */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0">
                <TrendingUp size={15} />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block font-medium">إجمالي المبيعات</span>
                <div className="flex items-baseline gap-1" dir="rtl">
                  <span className="font-black text-zinc-900 dark:text-zinc-100 font-mono text-xs">
                    {Number(report?.totalSales || 0).toFixed(2)}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-400">{currency}</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0">
                <ShoppingBag size={15} />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block font-medium">عدد الطلبات المنجزة</span>
                <span className="font-black text-zinc-900 dark:text-zinc-100 font-mono text-xs">
                  {report?.ordersCount || 0} <span className="text-[10px] font-normal text-zinc-500 font-sans">طلب</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
            >
              إغلاق
            </button>
            {onPrintXReport && (
              <button
                type="button"
                onClick={() => onPrintXReport(report)}
                className="h-10 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer size={14} />
                <span>طباعة التقرير</span>
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

