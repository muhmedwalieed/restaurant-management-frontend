import React from 'react';
import { Button } from '../../../shared/components/Button.jsx';
import { WhatsAppNewConnectionForm } from './connection/WhatsAppNewConnectionForm.jsx';
import { WhatsAppActiveConnectionCard } from './connection/WhatsAppActiveConnectionCard.jsx';
import { WhatsAppWebhookConfigCard } from './connection/WhatsAppWebhookConfigCard.jsx';

export const WhatsAppConnectionTab = ({
  connection,
  isLoading,
  noConnection,
  onConnect,
  isConnecting,
  onRetryWebhooks,
  isRetrying,
  onRefetch,
}) => {
  if (isLoading) {
    return <p className="text-sm text-txt-muted">جاري تحميل بيانات الاتصال...</p>;
  }

  if (noConnection) {
    return (
      <WhatsAppNewConnectionForm
        onConnect={onConnect}
        isConnecting={isConnecting}
      />
    );
  }

  if (!connection) {
    return (
      <div className="p-4 bg-status-danger/10 border border-status-danger/30 rounded-md text-xs text-status-danger text-center">
        تعذر تحميل بيانات الاتصال.
        <Button size="sm" variant="outline" className="mr-2" onClick={onRefetch}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <WhatsAppActiveConnectionCard connection={connection} />

      {connection.provider === 'META' && (
        <WhatsAppWebhookConfigCard
          connection={connection}
          onRetryWebhooks={onRetryWebhooks}
          isRetrying={isRetrying}
        />
      )}
    </div>
  );
};

export default WhatsAppConnectionTab;
