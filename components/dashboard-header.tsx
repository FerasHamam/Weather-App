export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b border-[var(--line)] pb-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-[var(--accent)] text-xl text-white shadow-sm">
          ✦
        </span>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent-dark)]">
            Skyline
          </p>
          <p className="text-xs text-[var(--ink-muted)]">Weather desk</p>
        </div>
      </div>
      <p className="hidden text-right text-sm text-[var(--ink-muted)] sm:block">
        A clear view of what&apos;s ahead
      </p>
    </header>
  );
}
