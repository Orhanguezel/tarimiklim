import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-line-soft', className)} />;
}

export function SkeletonCard({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-line bg-surface-strong p-5', className)}>
      <Skeleton className="h-5 w-2/3" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: Math.max(1, lines - 1) }).map((_, index) => (
          <Skeleton key={index} className="h-3.5 w-full" />
        ))}
      </div>
    </div>
  );
}
