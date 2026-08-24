import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const ContentContainer = ({ children, className = '' }) => {
  return (
    <main
      className={twMerge(
        clsx(
          'flex-1 w-full max-w-content-max mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8 space-y-6',
          className
        )
      )}
    >
      {children}
    </main>
  );
};
