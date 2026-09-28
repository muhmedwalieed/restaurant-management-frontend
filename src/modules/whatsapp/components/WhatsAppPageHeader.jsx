import React from 'react';
import { Phone, Settings, LogOut } from 'lucide-react';
import { Button } from '../../../shared/components/Button.jsx';
import { StatusPill } from '../../../shared/components/StatusPill.jsx';
import { PermissionGate } from '../../../shared/components/PermissionGate.jsx';
import {
  CONNECTION_STATUS_LABELS,
  connectionStatusPill,
  PROVIDER_LABELS,
} from '../schemas/whatsapp.schema.js';

export const WhatsAppPageHeader = ({
  connection,
  onOpenSettings,
  onOpenDisconnect,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-txt-primary flex items-center gap-2">
          <Phone className="w-6 h-6 text-brand-primary" />
          <span>خدمة عملاء وتذاكر الواتساب</span>
        </h1>
        <p className="text-xs text-txt-muted mt-1">
          إدارة تذاكر الدعم والشكاوى المعزولة، الرد على العملاء، وإعدادات ربط رقم الواتساب الخاص بالمطعم
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {connection && (
          <div className="flex items-center gap-2">
            <StatusPill status={connectionStatusPill(connection.status)}>
              {CONNECTION_STATUS_LABELS[connection.status] || connection.status}
            </StatusPill>
            <span className="text-xs text-txt-muted bg-bg-surface px-2.5 py-1 rounded-md border border-border-default">
              {PROVIDER_LABELS[connection.provider] || connection.provider}
            </span>
          </div>
        )}

        <PermissionGate permission="whatsapp.manage">
          {connection && connection.status === 'CONNECTED' && (
            <>
              <Button
                size="sm"
                variant="outline"
                icon={Settings}
                onClick={onOpenSettings}
              >
                تعديل المفاتيح
              </Button>
              <Button
                size="sm"
                variant="danger"
                icon={LogOut}
                onClick={onOpenDisconnect}
              >
                فصل الرقم
              </Button>
            </>
          )}
        </PermissionGate>
      </div>
    </div>
  );
};
