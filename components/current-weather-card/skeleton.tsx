export function CurrentWeatherSkeleton() {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="h-5 w-40 animate-pulse rounded-full bg-[var(--line)]" />
          <div className="mt-2 h-9 w-48 animate-pulse rounded-full bg-[var(--line)]" />
          <div className="mt-1 h-5 w-28 animate-pulse rounded-full bg-[var(--line)]" />
          <div className="mt-1 h-5 w-36 animate-pulse rounded-full bg-[var(--line)]" />
        </div>
        <div className="size-14 shrink-0 animate-pulse rounded-full bg-[var(--line)]" />
      </div>
      <div className="mt-10 h-[4.5rem] w-40 animate-pulse rounded-full bg-[var(--line)]" />
      <div className="mt-2 h-5 w-28 animate-pulse rounded-full bg-[var(--line)]" />
    </>
  );
}
