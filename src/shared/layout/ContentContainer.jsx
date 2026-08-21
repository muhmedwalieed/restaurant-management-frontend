import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const ContentContainer = ({ children, className = '' }) => {
  return (
    <main
      className={twMerge(
        clsx(
          'flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6',
          className
        )
      )}
    >
      {children}
    </main>
  );
};
