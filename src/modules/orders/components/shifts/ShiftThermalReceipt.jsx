import React from 'react';

export const ShiftThermalReceipt = ({
  shift,
  reportType = 'Z_REPORT', // 'Z_REPORT' | 'X_REPORT'
  restaurantName = 'Prime Restaurant',
  currency = 'ج.م',
}) => {
  if (!shift) return null;

  const isZReport = reportType === 'Z_REPORT';
  const startingCash = Number(shift.startingCash) || 0;
  const cashSales = Number(shift.cashSales) || 0;
  const cardSales = Number(shift.cardSales) || 0;
  const instaPaySales = Number(shift.instaPaySales) || 0;
  const walletSales = Number(shift.walletSales) || 0;
  const totalSales = Number(shift.totalSales) || (cashSales + cardSales + instaPaySales + walletSales);
  const driverSettlementCash = Number(shift.driverSettlementCash) || 0;
  const cashIn = Number(shift.cashIn) || 0;
  const cashOut = Number(shift.cashOut) || 0;
  const totalRefunds = Number(shift.totalRefunds) || 0;
  const expectedCash = Number(shift.expectedCash) || (startingCash + cashSales + driverSettlementCash + cashIn - totalRefunds - cashOut);
  const actualCash = isZReport ? (Number(shift.actualCash) || 0) : null;
  const discrepancy = isZReport ? (Number(shift.cashDifference) || (actualCash - expectedCash)) : 0;

  return (
    <div
      id="shift-thermal-receipt"
      className="hidden print:block w-[80mm] max-w-full p-4 mx-auto text-black font-mono text-[12px] leading-tight bg-white"
      dir="rtl"
    >
      <div className="text-center pb-2 border-b border-dashed border-black">
        <h2 className="text-base font-bold tracking-tight">{restaurantName}</h2>
        <div className="text-[11px] font-bold mt-1 uppercase">
          {isZReport ? '=== تقرير إغلاق وردية (Z-REPORT) ===' : '=== تقرير لحظي للوردية (X-REPORT) ==='}
        </div>
      </div>

      <div className="py-2 border-b border-dashed border-black space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>رقم الوردية:</span>
          <span className="font-bold">#{shift.shiftNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>الكاشير:</span>
          <span className="font-bold">{shift.employee?.name || 'الكاشير'}</span>
        </div>
        <div className="flex justify-between">
          <span>وقت البدء:</span>
          <span>{new Date(shift.openedAt).toLocaleString('ar-EG')}</span>
        </div>
        {isZReport && shift.closedAt && (
          <div className="flex justify-between">
            <span>وقت الإغلاق:</span>
            <span>{new Date(shift.closedAt).toLocaleString('ar-EG')}</span>
          </div>
        )}
      </div>

      {/* Sales Summary */}
      <div className="py-2 border-b border-dashed border-black space-y-1 text-[11px]">
        <div className="font-bold mb-1 underline">ملخص المبيعات:</div>
        <div className="flex justify-between">
          <span>عدد الطلبات:</span>
          <span className="font-bold">{shift.ordersCount || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>مبيعات كاش:</span>
          <span>{cashSales.toFixed(2)} {currency}</span>
        </div>
        <div className="flex justify-between">
          <span>مبيعات فيزا/بطاقات:</span>
          <span>{cardSales.toFixed(2)} {currency}</span>
        </div>
        <div className="flex justify-between">
          <span>إنستاباي ومحافظ:</span>
          <span>{(instaPaySales + walletSales).toFixed(2)} {currency}</span>
        </div>
        {totalRefunds > 0 && (
          <div className="flex justify-between text-red-600">
            <span>إجمالي المرتجعات:</span>
            <span>-{totalRefunds.toFixed(2)} {currency}</span>
          </div>
        )}
        <div className="flex justify-between font-bold pt-1 border-t border-dotted border-black">
          <span>إجمالي المبيعات:</span>
          <span>{totalSales.toFixed(2)} {currency}</span>
        </div>
      </div>

      {/* Cash Drawer Reconciliation */}
      <div className="py-2 border-b border-dashed border-black space-y-1 text-[11px]">
        <div className="font-bold mb-1 underline">حسابات الدرج النقدي:</div>
        <div className="flex justify-between">
          <span>عهدة البداية (Float):</span>
          <span>{startingCash.toFixed(2)} {currency}</span>
        </div>
        <div className="flex justify-between">
          <span>المقبوضات النقدية (+):</span>
          <span>+{cashSales.toFixed(2)} {currency}</span>
        </div>
        {driverSettlementCash > 0 && (
          <div className="flex justify-between">
            <span>عهدة طيارين محصلة (+):</span>
            <span>+{driverSettlementCash.toFixed(2)} {currency}</span>
          </div>
        )}
        {cashIn > 0 && (
          <div className="flex justify-between">
            <span>إيداع فكّة إضافية (+):</span>
            <span>+{cashIn.toFixed(2)} {currency}</span>
          </div>
        )}
        {cashOut > 0 && (
          <div className="flex justify-between">
            <span>سحب مصروفات (-):</span>
            <span>-{cashOut.toFixed(2)} {currency}</span>
          </div>
        )}
        <div className="flex justify-between font-bold pt-1 border-t border-dotted border-black">
          <span>المتوقع بالدرج:</span>
          <span>{expectedCash.toFixed(2)} {currency}</span>
        </div>

        {isZReport && (
          <>
            <div className="flex justify-between font-bold">
              <span>الفعلي المحصي:</span>
              <span>{actualCash.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between font-black pt-1 border-t border-black text-[12px]">
              <span>الفارق (عجز/زيادة):</span>
              <span>
                {discrepancy >= 0 ? `+${discrepancy.toFixed(2)}` : discrepancy.toFixed(2)} {currency}
              </span>
            </div>
          </>
        )}
      </div>

      {shift.closeNotes && (
        <div className="py-2 border-b border-dashed border-black text-[11px]">
          <span className="font-bold">ملاحظات:</span> {shift.closeNotes}
        </div>
      )}

      {/* Footer Signatures */}
      <div className="pt-4 text-center text-[10px] space-y-4">
        <div className="flex justify-between px-2">
          <span>توقيع الكاشير: ...............</span>
          <span>توقيع المدير: ...............</span>
        </div>
        <div className="text-zinc-500">تمت الطباعة بواسطة نظام المطعم SaaS</div>
      </div>
    </div>
  );
};
