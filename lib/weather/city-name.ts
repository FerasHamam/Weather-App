export function normalizeCity(city: string): string {
  return city.trim().replace(/\s+/g, " ");
}

function capitalizeWord(word: string): string {
  return word
    .split(/([-'’])/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function formatCityName(city: string): string {
  const normalizedCity = normalizeCity(city);
  const isUniformCase =
    normalizedCity === normalizedCity.toLowerCase() ||
    normalizedCity === normalizedCity.toUpperCase();

  if (!isUniformCase) {
    return normalizedCity;
  }

  return normalizedCity.toLowerCase().split(" ").map(capitalizeWord).join(" ");
}

/** Case- and whitespace-insensitive key used by the cache and de-duplication. */
export function toCityKey(city: string): string {
  return normalizeCity(city).toLowerCase();
}
