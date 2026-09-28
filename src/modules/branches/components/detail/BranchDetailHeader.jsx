import React from 'react';
import { ChevronRight, BadgeCheck } from 'lucide-react';
import { Button } from '../../../../shared/components/Button.jsx';

export const BranchDetailHeader = ({ branch, onBack }) => {
  return (
    <div className="flex items-center gap-3 pb-2">
      <Button
        size="sm"
        variant="outline"
        onClick={onBack}
        icon={ChevronRight}
      >
        العودة للفروع
      </Button>
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-txt-primary">{branch?.name || 'تفاصيل الفرع'}</h1>
        {branch?.isMain && branch?.status === 'ACTIVE' && (
          <span title="الفرع الرئيسي، نشط" aria-label="الفرع الرئيسي، نشط">
            <BadgeCheck className="w-5 h-5 text-status-success" />
          </span>
        )}
      </div>
    </div>
  );
};
