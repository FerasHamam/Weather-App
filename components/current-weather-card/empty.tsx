export function CurrentWeatherEmpty() {
  return (
    <>
      <p className="text-sm font-medium uppercase tracking-[0.15em] text-[var(--ink-muted)]">
        Your next view
      </p>
      <p className="mt-6 text-5xl">☼</p>
      <h2 className="mt-6 max-w-sm text-3xl font-semibold leading-tight">
        The sky is waiting for a city.
      </h2>
      <p className="mt-3 max-w-sm leading-7 text-[var(--ink-muted)]">
        Your current weather and five-day forecast will land here.
      </p>
    </>
  );
}
