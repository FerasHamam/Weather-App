import type { ReactNode } from "react";

type StatItemProps = {
  icon: ReactNode;
  label: string;
  value: string;
  isLoading: boolean;
};

export function StatItem({ icon, label, value, isLoading }: StatItemProps) {
  return (
    <div className="flex h-[6.5rem] min-h-0 flex-col items-start gap-2 overflow-hidden rounded-2xl bg-[var(--stat-surface)] p-3">
      {icon}
      <div className="w-full min-w-0">
        <p className="truncate text-[var(--ink-muted)]">{label}</p>
        <p className="mt-0.5 truncate text-base font-semibold">
          {isLoading ? (
            <span className="inline-block h-6 w-12 animate-pulse rounded-full bg-[var(--line)]" />
          ) : (
            value
          )}
        </p>
      </div>
    </div>
  );
}
