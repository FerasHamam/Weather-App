/** Particles that stay lowercase inside a title-cased name ("Rio de Janeiro"). */
const LOWERCASE_PARTICLES = new Set([
  "al",
  "bin",
  "da",
  "das",
  "de",
  "del",
  "der",
  "des",
  "di",
  "do",
  "dos",
  "el",
  "ibn",
  "la",
  "le",
  "of",
  "the",
  "van",
  "von",
]);

export function normalizeCity(city: string): string {
  return city.trim().replace(/\s+/g, " ");
}

function capitalizeWord(word: string): string {
  // Split on internal separators but keep them, so "winston-salem" becomes
  // "Winston-Salem" rather than "Winston-salem".
  return word
    .split(/([-'’])/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Title-cases a name the user typed ("san francisco" -> "San Francisco") but
 * leaves alone any name that already carries its own casing ("São Paulo",
 * "L'Aquila", "Rio de Janeiro"), which is how the provider returns them.
 * Re-casing those would corrupt them, so uniform-case input is the only signal
 * that the caller wants this function to decide the casing.
 */
export function formatCityName(city: string): string {
  const normalizedCity = normalizeCity(city);
  const isUniformCase =
    normalizedCity === normalizedCity.toLowerCase() ||
    normalizedCity === normalizedCity.toUpperCase();

  if (!isUniformCase) {
    return normalizedCity;
  }

  return normalizedCity
    .toLowerCase()
    .split(" ")
    .map((word, index) =>
      index > 0 && LOWERCASE_PARTICLES.has(word) ? word : capitalizeWord(word),
    )
    .join(" ");
}

/** Case- and whitespace-insensitive key used by the cache and de-duplication. */
export function cityKey(city: string): string {
  return normalizeCity(city).toLowerCase();
}
