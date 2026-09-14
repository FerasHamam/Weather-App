export function ForecastCardSkeleton() {
  return (
    <div className="flex h-40 min-h-0 flex-col items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className="space-y-2 text-center">
        <div className="mx-auto h-4 w-14 animate-pulse rounded-full bg-[var(--line)]" />
        <div className="mx-auto h-3 w-10 animate-pulse rounded-full bg-[var(--line)]" />
      </div>
      <div className="size-11 animate-pulse rounded-full bg-[var(--line)]" />
      <div className="mt-auto h-5 w-16 animate-pulse rounded-full bg-[var(--line)]" />
    </div>
  );
}
