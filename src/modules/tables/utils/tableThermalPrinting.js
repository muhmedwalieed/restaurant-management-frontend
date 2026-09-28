import { printHtml } from '../../../lib/print.js';

/**
 * Prints a thermal PIN slip for Dine-In self-ordering.
 */
export const printTablePinReceipt = ({ branchName = 'مطعمنا', displayNum, pin, waiterName }) => {
  const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date().toLocaleString('ar-EG');
  const waiterNote = waiterName ? `<div style="font-size:11px; color:#888; margin-top:8px;">طُبع بواسطة: ${waiterName}</div>` : '';

  printHtml(
    `
    <div style="text-align:center; padding:24px 12px; font-family:'Cairo', system-ui, sans-serif; direction:rtl;">
      <div style="font-size:14px; font-weight:bold; color:#333; margin-bottom:4px;">${branchName}</div>
      <div style="font-size:12px; color:#666;">رمز الدخول للطلب الذاتي (PIN)</div>
      <div style="border-top:2px dashed #ccc; margin:12px 0;"></div>
      <div style="font-size:13px; color:#444;">رقم الطاولة</div>
      <div style="font-size:32px; font-weight:800; margin:4px 0 12px; color:#000;">طاولة ${displayNum}</div>
      <div style="border-top:1px dashed #ccc; margin:12px 0;"></div>
      <div style="font-size:13px; color:#333; font-weight:600;">رمز الدخول للطلب الذاتي</div>
      <div style="font-size:56px; font-weight:900; letter-spacing:14px; color:#000; direction:ltr; margin:12px 0;">${pin}</div>
      <div style="font-size:11px; color:#666; margin-top:8px;">امسح رمز QR الطاولة وأدخل هذا الرمز لبدء طلبك</div>
      <div style="border-top:2px dashed #ccc; margin-top:16px; padding-top:8px; font-size:10px; color:#888;">
        <span>${dateStr || timeStr}</span>
        ${waiterNote}
      </div>
    </div>
  `,
    'printing-pin'
  );
};

/**
 * Prints a thermal bill receipt for a table.
 */
export const printTableBillReceipt = ({ branchName = 'مطعمنا', displayNum, items = [], total = 0, currency = 'ج.م' }) => {
  printHtml(
    `
    <div style="text-align:center; padding:20px 10px; font-family:'Cairo', system-ui, sans-serif; direction:rtl;">
      <div style="font-size:16px; font-weight:bold; color:#000;">${branchName}</div>
      <div style="font-size:12px; color:#666; margin-top:2px;">فاتورة حساب طاولة ${displayNum}</div>
      <div style="font-size:11px; color:#888; margin-top:2px;">التاريخ: ${new Date().toLocaleString('ar-EG')}</div>
      <div style="border-top:1px dashed #ccc; margin:10px 0;"></div>
      <table style="width:100%; font-size:12px; border-collapse:collapse; text-align:right;">
        <thead>
          <tr style="border-bottom:1px solid #ddd; font-weight:bold;">
            <th style="padding:4px 0;">الصنف</th>
            <th style="text-align:center; padding:4px 0;">العدد</th>
            <th style="text-align:left; padding:4px 0;">السعر</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
            <tr style="border-bottom:1px solid #eee;">
              <td style="padding:5px 0;">${item.name}</td>
              <td style="text-align:center; padding:5px 0;">${item.qty}</td>
              <td style="text-align:left; padding:5px 0; font-family:monospace;">${Number(item.price * item.qty).toFixed(2)} ${currency}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      <div style="border-top:1px dashed #ccc; margin:10px 0;"></div>
      <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:bold; margin-top:8px;">
        <span>المطلوب سداده:</span>
        <span style="font-family:monospace;">${Number(total).toFixed(2)} ${currency}</span>
      </div>
      <div style="border-top:1px dashed #ccc; margin:12px 0 8px;"></div>
      <div style="text-align:center; font-size:11px; color:#777;">شكراً لزيارتكم!</div>
    </div>
  `,
    'printing-bill'
  );
};
