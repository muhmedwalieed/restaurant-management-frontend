import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export const MobileNavSection = ({
  section,
  isOpen,
  onToggle,
  onClose,
}) => {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2.5 py-1.5 mt-3 first:mt-0 mb-1 text-[11px] font-bold text-txt-muted hover:text-txt-primary transition-colors focus-visible:outline-none select-none text-right rounded-md group"
        aria-expanded={isOpen}
      >
        <span className="truncate">{section.title}</span>
        <ChevronDown
          className={clsx(
            'w-3.5 h-3.5 text-txt-muted group-hover:text-txt-primary transition-transform duration-200 shrink-0',
            isOpen ? 'rotate-0' : '-rotate-90'
          )}
        />
      </button>

      {isOpen && (
        <div className="space-y-1">
          {section.items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center gap-2.5 px-3 h-9 rounded-md text-xs transition-colors duration-150',
                    isActive
                      ? 'bg-brand-primary text-txt-inverted font-semibold shadow-xs'
                      : 'text-txt-muted font-medium hover:text-txt-primary hover:bg-bg-surface-elevated'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={clsx(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-txt-inverted' : 'text-txt-muted group-hover:text-txt-primary'
                      )}
                    />
                    <span className="flex-1 truncate leading-none">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};
