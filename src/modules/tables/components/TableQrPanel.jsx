import { useState } from 'react';
import QRCode from 'react-qr-code';
import { QrCode, Copy, Check, Download, Printer } from 'lucide-react';
import { Button } from '../../../shared/components/Button.jsx';

const QR_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" rx="14" fill="#f59e0b"/><text x="24" y="31" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#0f172a" text-anchor="middle">QR</text></svg>`;
const QR_LOGO_DATA_URL = `data:image/svg+xml,${encodeURIComponent(QR_LOGO_SVG)}`;

export const TableQrPanel = ({ table, branchName, size = 180 }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!table?.qrUrl) return;
    try {
      await navigator.clipboard.writeText(table.qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
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
        downloadLink.download = `table-${table?.label || 'table'}-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch {
      /* fallback */
    }
  };

  const handlePrintQr = () => {
    const qrElem = document.getElementById('table-qr-print-area');
    if (!qrElem) return;
    const html = `
      <html dir="rtl">
        <head>
          <title>طاولة ${table?.label || ''} - رمز QR</title>
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
            <h2>طاولة ${table?.label || ''}</h2>
            <p>${branchName || ''} • امسح الرمز لطلب الطعام مباشرة</p>
            <div class="qr-wrapper">${qrElem.innerHTML}</div>
            <div class="footer-tip">امسح بكاميرا الهاتف لفتح المنيو الذكي</div>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html.replace('</body>', '<script>window.onload = function() { window.print(); window.close(); }</script></body>'));
      printWindow.document.close();
      return;
    }
    // Fallback if the popup was blocked: print from a hidden iframe (no popup needed).
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-brand-primary" />
          <h3 className="text-xs font-bold text-txt-primary">رمز QR</h3>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-5 bg-bg-base/60 border border-border-subtle rounded-xl">
        <div id="table-qr-print-area" className="p-4 bg-white rounded-xl ring-1 ring-border-default shadow-sm inline-block">
          {table?.qrUrl ? (
            <div className="relative inline-block">
              <QRCode
                id="table-qr-code"
                value={table.qrUrl}
                size={size}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="H"
                className="rounded-md"
              />
              <img
                src={QR_LOGO_DATA_URL}
                alt=""
                className="absolute inset-0 m-auto w-9 h-9 rounded-md pointer-events-none"
              />
            </div>
          ) : (
            <div className="w-[180px] h-[180px] flex items-center justify-center">
              <QrCode className="w-12 h-12 text-txt-muted" />
            </div>
          )}
        </div>
        <div className="text-center mt-3">
          <h4 className="text-sm font-bold text-txt-primary font-mono">طاولة #{table?.label}</h4>
          <p className="text-[11px] text-txt-muted">{branchName || 'الفرع الحالي'}</p>
        </div>
      </div>

      {table?.qrUrl && (
        <div className="bg-bg-base border border-border-subtle rounded-lg p-2 flex items-center justify-between gap-2">
          <span className="text-[11px] text-txt-muted dir-ltr truncate font-mono select-all">{table.qrUrl}</span>
          <Button
            size="sm"
            variant="outline"
            icon={copied ? Check : Copy}
            onClick={handleCopyLink}
            className="border-white/10 text-xs shrink-0 h-7 px-2.5"
          >
            {copied ? 'تم النسخ' : 'نسخ'}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.06]">
        <Button
          size="sm"
          variant="outline"
          icon={Download}
          onClick={handleDownloadQr}
          className="border-white/10 hover:bg-white/[0.06] text-xs"
        >
          تحميل (PNG)
        </Button>
        <Button
          size="sm"
          variant="outline"
          icon={Printer}
          onClick={handlePrintQr}
          className="border-white/10 hover:bg-white/[0.06] text-xs"
        >
          طباعة الرمز
        </Button>
      </div>
    </div>
  );
};

export default TableQrPanel;