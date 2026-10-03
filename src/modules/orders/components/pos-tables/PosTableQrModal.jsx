import React from 'react';
import QRCode from 'react-qr-code';
import { Modal } from '../../../../shared/components/Modal.jsx';
import { ExternalLink } from 'lucide-react';
import { formatTableLabel } from '../../../tables/utils/tableLabel.js';

export const PosTableQrModal = ({
  isOpen,
  onClose,
  table,
}) => {
  if (!isOpen || !table) return null;

  const url = table.qrUrl || `${window.location.origin}/menu/table/${table.qrToken || ''}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`رمز QR — ${formatTableLabel(table.displayNum)}`}
      size="sm"
    >
      <div className="flex flex-col items-center justify-center p-4 space-y-4 text-center">
        <div className="p-4 bg-white rounded-2xl shadow-md">
          <QRCode value={url} size={180} />
        </div>

        <div className="w-full space-y-1">
          <span className="text-xs font-bold text-txt-primary block">
            رابط الطلب الذاتي للطاولة
          </span>
          {/* Single line, LTR: the start of the URL stays visible and the tail gets clipped */}
          <span
            dir="ltr"
            title={url}
            className="block w-full text-[11px] text-txt-muted mono text-left truncate select-text"
          >
            {url}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2 w-full">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-txt-inverted bg-brand-primary shadow-sm hover:bg-brand-primary-hover flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ExternalLink size={15} />
            <span>الذهاب لصفحة الطاولة</span>
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default PosTableQrModal;
