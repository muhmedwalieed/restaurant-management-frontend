import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '../../../../shared/components/Button.jsx';
import { QrCode, Copy, Check, Download, Printer, ArrowUpRight } from 'lucide-react';
import { formatTableLabel } from '../../utils/tableLabel.js';

const QR_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" rx="14" fill="#f59e0b"/><text x="24" y="31" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#0f172a" text-anchor="middle">QR</text></svg>`;
const QR_LOGO_DATA_URL = `data:image/svg+xml,${encodeURIComponent(QR_LOGO_SVG)}`;

export const TableQrCard = ({ table, branchName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!table?.qrUrl) return;
    try {
      await navigator.clipboard.writeText(table.qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      void err;
    }
  };

  const handleDownloadQr = () => {
    const svg = document.getElementById('table-qr-code');
    if (!svg) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width + 40;
        canvas.height = img.height + 40;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `table-${table?.label || table?.id}-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      void err;
    }
  };

  const handlePrintQr = () => {
    const qrElem = document.getElementById('table-qr-print-area');
    if (!qrElem) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>${formatTableLabel(table?.label)} - رمز QR</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 40px; color: #0f172a; }
            .card { display: inline-block; padding: 32px; border: 2px solid #cbd5e1; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            h2 { margin: 0 0 6px; font-size: 26px; font-weight: 800; }
            p { margin: 0 0 20px; color: #64748b; font-size: 14px; }
            .qr-wrapper { background: #fff; padding: 12px; display: inline-block; border-radius: 12px; }
            .footer-tip { margin-top: 18px; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>${formatTableLabel(table?.label)}</h2>
            <p>${branchName || ''} • امسح الرمز لطلب الطعام مباشرة</p>
            <div class="qr-wrapper">${qrElem.innerHTML}</div>
            <div class="footer-tip">امسح بكاميرا الهاتف لفتح المنيو الذكي</div>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-brand-primary" />
          <h3 className="text-xs font-bold text-txt-primary">رمز الـ QR الخاص بالطلب الذاتي</h3>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-4 bg-bg-base/40 border border-border-subtle rounded-xl space-y-3">
        <div id="table-qr-print-area" className="p-3 bg-white rounded-xl shadow-inner inline-block">
          {table?.qrUrl ? (
            <QRCode
              id="table-qr-code"
              value={table.qrUrl}
              size={160}
              level="H"
              imageSettings={{
                src: QR_LOGO_DATA_URL,
                x: undefined,
                y: undefined,
                height: 32,
                width: 32,
                excavate: true,
              }}
            />
          ) : (
            <div className="w-40 h-40 flex items-center justify-center text-xs text-txt-muted">
              لا يوجد رابط QR
            </div>
          )}
        </div>

        <p className="text-[11px] text-txt-muted text-center max-w-xs leading-relaxed">
          يطبع هذا الرمز ويوضع على طاولة العميل لفتح المنيو والطلب الذاتي.
        </p>

        {table?.qrUrl && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 w-full">
            <Button
              size="sm"
              variant="outline"
              icon={copied ? Check : Copy}
              onClick={handleCopyLink}
              className="text-xs border-white/10"
            >
              {copied ? 'تم النسخ' : 'نسخ الرابط'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={Download}
              onClick={handleDownloadQr}
              className="text-xs border-white/10"
            >
              تحميل الصورة
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={Printer}
              onClick={handlePrintQr}
              className="text-xs border-white/10"
            >
              طباعة الـ QR
            </Button>
            <a
              href={table.qrUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand-primary hover:underline px-2 py-1"
            >
              <span>فتح الرابط</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
