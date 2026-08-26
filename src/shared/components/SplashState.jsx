import { Utensils, Loader2 } from 'lucide-react';

export const SplashState = ({ message = 'جاري تهيئة نظام المطعم...' }) => {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-4 text-center">
      <div className="flex flex-col items-center space-y-4 max-w-sm">
        <Utensils className="w-8 h-8 text-brand-primary" />
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-txt-primary">Restaurant SaaS</h1>
          <p className="text-xs text-txt-muted">نظام إدارة المطاعم المتكامل</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-brand-primary pt-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
};
