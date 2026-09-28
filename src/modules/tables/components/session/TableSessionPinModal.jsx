import React, { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { Button } from '../../../../shared/components/Button.jsx';
import { printHtml } from '../../../../lib/print.js';
import { Copy, Check, Printer } from 'lucide-react';

export const TableSessionPinModal = ({
  showPin,
  onClose,
  tableLabel = '—',
}) => {
  const [copied, setCopied] = useState(false);

  if (!showPin) return null;

  const handleCopyPin = async () => {
    try {
      await navigator.clipboard.writeText(showPin);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      void err;
    }
  };

  const handlePrintPin = () => {
    printHtml(
      `
      <div style="text-align:center; padding:24px; font-family:Arial, sans-serif;">
        <div style="font-size:14px; color:#333;">رقم الطاولة</div>
        <div style="font-size:34px; font-weight:800; margin:6px 0 22px; color:#000;">طاولة ${tableLabel}</div>
        <div style="border-top:2px dashed #ccc; margin-bottom:20px;"></div>
        <div style="font-size:13px; color:#333;">رمز الدخول للطلب الذاتي</div>
        <div style="font-size:72px; font-weight:900; letter-spacing:20px; color:#000; direction:ltr; margin:14px 0 10px;">${showPin}</div>
        <div style="font-size:12px; color:#94a3b8;">أدخل هذا الرمز مع اسمك في صفحة الـ QR لبدء الطلب</div>
      </div>
    `,
      'printing-pin'
    );
  };

  return (
    <Modal isOpen={Boolean(showPin)} onClose={onClose} title="رمز PIN جلسة الطاولة" size="sm">
      <div className="text-center space-y-4 py-2">
        <p className="text-xs text-txt-muted">قم بتزويد العميل بهذا الرمز السري للانضمام إلى جلسة الطاولة عبر رمز QR:</p>
        <div className="text-4xl font-bold tracking-[0.4em] text-brand-primary font-mono" dir="ltr">
          {showPin}
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" icon={copied ? Check : Copy} onClick={handleCopyPin}>
            {copied ? 'تم النسخ' : 'نسخ الرمز'}
          </Button>
          <Button size="sm" variant="outline" icon={Printer} onClick={handlePrintPin}>
            طباعة الـ PIN
          </Button>
          <Button size="sm" variant="primary" onClick={onClose}>إغلاق</Button>
        </div>
      </div>
    </Modal>
  );
};
