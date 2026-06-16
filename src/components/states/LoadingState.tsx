export function TableSkeleton({
  rows = 8,
  cols = 6,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="bg-stone-100 h-12" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 h-[60px] border-b border-stone-100"
        >
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-4 bg-stone-100 rounded animate-pulse"
              style={{ width: `${Math.random() * 40 + 40}%`, flex: 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-[140px] bg-white rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
