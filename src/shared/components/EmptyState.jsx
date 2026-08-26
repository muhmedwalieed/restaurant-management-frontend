import { Inbox } from 'lucide-react';
import { Button } from './Button.jsx';

export const EmptyState = ({
  title = 'لا توجد بيانات حالياً',
  description = 'لم يتم إضافة أي عناصر هنا بعد.',
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border-default rounded-lg bg-bg-surface/50 my-4 space-y-3">
      <Icon className="w-6 h-6 text-txt-muted" />
      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-semibold text-txt-primary">{title}</h3>
        <p className="text-xs text-txt-muted leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
