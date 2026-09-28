import React from 'react';
import { createPortal } from 'react-dom';
import { ReceiptHeader } from './receipt/ReceiptHeader.jsx';
import { ReceiptItemsTable } from './receipt/ReceiptItemsTable.jsx';
import { ReceiptFinancialSummary } from './receipt/ReceiptFinancialSummary.jsx';

export const ReceiptPrintTemplate = ({ order, activeBranch, branch, isPreview = false }) => {
  if (!order) return null;

  const currentBranch = order.branch || activeBranch || branch;
  const branchName = currentBranch?.name || '';
  const restaurantName =
    order.restaurant?.name ||
    currentBranch?.restaurant?.name ||
    'مطاعم برايم';

  const customerName =
    order.customer?.name || (order.customer?.phone ? 'عميل مسجل' : 'عميل مباشر');

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  const currency =
    order.restaurant?.currency ||
    currentBranch?.restaurant?.currency ||
    currentBranch?.settings?.currency ||
    'EGP';

  const tableLabel =
    order.table?.label ||
    order.table?.name ||
    order.table?.tableNumber ||
    order.tableLabel ||
    (order.tableId ? order.tableId : null);

  const receiptContent = (
    <div
      dir="rtl"
      className={
        isPreview
          ? 'w-full max-w-[340px] mx-auto bg-white text-black font-sans text-xs p-5 rounded-lg shadow-md border border-gray-200 text-right overflow-hidden'
          : 'printable-receipt'
      }
    >
      <ReceiptHeader
        order={order}
        restaurantName={restaurantName}
        branchName={branchName}
        formattedDate={formattedDate}
        customerName={customerName}
        tableLabel={tableLabel}
      />

      <ReceiptItemsTable items={order.items || []} />

      <ReceiptFinancialSummary order={order} currency={currency} />

      <div className="pt-2.5 text-center text-[10px] text-gray-600">
        <p className="font-semibold text-black" dir="rtl">
          شكراً لزيارتكم!
        </p>
      </div>
    </div>
  );

  if (isPreview) {
    return receiptContent;
  }

  if (typeof document !== 'undefined') {
    return createPortal(receiptContent, document.body);
  }

  return receiptContent;
};

export default ReceiptPrintTemplate;
