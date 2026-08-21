import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const LoadingSkeleton = ({
  className = '',
  width,
  height,
  circle = false,
}) => {
  return (
    <div
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
      className={twMerge(
        clsx(
          'animate-pulse bg-bg-surface-elevated/60 border border-border-subtle',
          circle ? 'rounded-full' : 'rounded-md',
          className
        )
      )}
    />
  );
};
