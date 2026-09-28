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
        className="w-full flex items-center justify-between px-3 py-1.5 mt-3 first:mt-0 mb-1 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none select-none text-right rounded-md group"
        aria-expanded={isOpen}
      >
        <span className="truncate">{section.title}</span>
        <ChevronDown
          className={clsx(
            'w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform duration-200 shrink-0',
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
                    'group flex items-center gap-3 px-3 h-9 rounded-md text-xs transition-colors duration-150',
                    isActive
                      ? 'bg-white/[0.08] text-white font-medium'
                      : 'text-slate-400 font-normal hover:text-slate-100 hover:bg-white/[0.03]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={clsx(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
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
