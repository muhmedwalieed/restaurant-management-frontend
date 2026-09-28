import React from 'react';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { ORDER_STATUS_LABELS, orderStatusPill } from '../../orders/schemas/order.schema.js';
import { PackageSearch, AlertCircle } from 'lucide-react';

export const WebsiteOrderTrackingTab = ({
  trackNumber,
  setTrackNumber,
  trackPhone,
  setTrackPhone,
  trackResult,
  trackError,
  tracking,
  onTrack,
}) => {
  return (
    <div className="max-w-md mx-auto bg-bg-surface border border-border-default rounded-xl p-6 space-y-4 shadow-sm">
      <h2 className="text-base font-bold text-txt-primary flex items-center gap-2">
        <PackageSearch className="w-5 h-5 text-brand-primary" />
        <span>تتبع حالة الطلب</span>
      </h2>

      <Input
        label="رقم الطلب"
        type="number"
        dir="ltr"
        placeholder="مثال: 104"
        value={trackNumber}
        onChange={(e) => setTrackNumber(e.target.value)}
      />

      <Input
        label="رقم الهاتف"
        dir="ltr"
        placeholder="مثال: 01012345678"
        value={trackPhone}
        onChange={(e) => setTrackPhone(e.target.value)}
      />

      {trackError && (
        <div className="p-3 rounded-md text-xs font-medium bg-status-danger-bg text-status-danger border border-status-danger/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{trackError}</span>
        </div>
      )}

      {trackResult && (
        <div className="bg-bg-base border border-border-default rounded-xl p-4 space-y-2 text-right">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-txt-primary">#{trackResult.orderNumber}</span>
            <StatusPill status={orderStatusPill(trackResult.status)}>
              {ORDER_STATUS_LABELS[trackResult.status] || trackResult.status}
            </StatusPill>
          </div>
          <p className="text-xs text-txt-muted">
            الإجمالي: <strong className="text-txt-primary">{Number(trackResult.total || 0).toFixed(2)} EGP</strong>
          </p>
          <p className="text-xs text-txt-muted">
            {new Date(trackResult.createdAt).toLocaleString('ar-EG')}
          </p>
        </div>
      )}

      <div className="flex justify-center pt-2">
        <Button variant="primary" isLoading={tracking} onClick={onTrack} className="w-full">
          تتبع الطلب
        </Button>
      </div>
    </div>
  );
};
