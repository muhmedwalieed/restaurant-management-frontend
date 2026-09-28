import React from 'react';
import QRCode from 'react-qr-code';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { Printer } from 'lucide-react';
import { printHtml } from '../../../../lib/print.js';

export const PosTableQrModal = ({
  isOpen,
  onClose,
  table,
  activeBranch,
}) => {
  if (!isOpen || !table) return null;

  const url = `${window.location.origin}/t/${table.qrToken || ''}`;

  const handlePrint = () => {
    printHtml(
      `
      <div style="text-align:center; padding:30px 15px; font-family:'Cairo', sans-serif; direction:rtl;">
        <div style="font-size:18px; font-weight:bold; margin-bottom:6px;">${activeBranch?.name || 'مطعمنا'}</div>
        <div style="font-size:14px; color:#666; margin-bottom:16px;">قائمة الطعام والطلب الذاتي</div>
        <div style="font-size:32px; font-weight:900; margin-bottom:16px; border:2px solid #000; padding:8px 16px; display:inline-block; border-radius:8px;">
          طاولة ${table.displayNum}
        </div>
        <div style="margin:20px auto; display:flex; justify-content:center;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}" style="width:200px; height:200px;" />
        </div>
        <div style="font-size:13px; font-weight:bold; margin-top:12px;">امسح الكود بكاميرا هاتفك لعرض المنيو والطلب مباشرة</div>
      </div>
    `,
      'printing-table-qr'
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`رمز QR — طاولة ${table.displayNum}`}
      maxWidth="sm"
    >
      <div className="flex flex-col items-center justify-center p-4 space-y-4 text-center">
        <div className="p-4 bg-white rounded-2xl shadow-md">
          <QRCode value={url} size={180} />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-txt-primary block">
            رابط الطلب الذاتي للطاولة
          </span>
          <span className="text-[11px] text-txt-muted mono block truncate max-w-xs">
            {url}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2 w-full">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-white bg-brand-primary shadow-sm hover:bg-brand-primary-hover flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer size={15} />
            <span>طباعة لاصق QR للطاولة</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
