export function normalizeCity(city: string): string {
  return city.trim().replace(/\s+/g, " ");
}

export function formatCityName(city: string): string {
  const normalizedCity = normalizeCity(city).toLowerCase();
  return normalizedCity.charAt(0).toUpperCase() + normalizedCity.slice(1);
}
