import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full', count = 1, style }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton-shimmer ${className}`}
          style={{ animationDelay: `${i * 100}ms`, ...style }}
        />
      ))}
    </>
  );
};

export const SkeletonCard: React.FC = () => (
  <div className="neo-card p-6 space-y-4">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
  <div className="neo-card overflow-hidden">
    <div className="p-4 border-b border-[var(--bg-secondary)]">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
    </div>
    <div className="divide-y divide-[var(--bg-secondary)]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton 
              key={j} 
              className="h-4 flex-1" 
              style={{ animationDelay: `${(i * cols + j) * 50}ms` }} 
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonChart: React.FC = () => (
  <div className="neo-card p-6">
    <Skeleton className="h-6 w-1/4 mb-6" />
    <div className="flex items-end justify-between gap-2 h-[200px]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="skeleton-shimmer w-full rounded-t-lg"
          style={{ 
            height: `${20 + ((i * 17) % 60)}%`,
            animationDelay: `${i * 80}ms`
          }}
        />
      ))}
    </div>
  </div>
);
