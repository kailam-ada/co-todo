/* ----------------------------------------------------------------------
   Service météo Co-Todo — Open-Meteo (API gratuite, sans clé, RGPD-friendly).
   Géocodage par ville + prévision courante, et logique d'habillement pure
   (règles CLAUDE.md), testable en Phase 5.
---------------------------------------------------------------------- */

export interface WeatherNow {
  temperature: number
  weatherCode: number
  precipitation: number
}

export interface GeoResult {
  name: string
  latitude: number
  longitude: number
  postalCode: string | null
}

export interface ClothingAdvice {
  text: string
  icon: string
}

/** Codes WMO impliquant des précipitations (bruine, pluie, averses, neige, orage). */
const PRECIP_CODES = new Set([
  51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86,
  95, 96, 99,
])

export function isRainy(weather: WeatherNow): boolean {
  return weather.precipitation > 0 || PRECIP_CODES.has(weather.weatherCode)
}

export function isSunny(weatherCode: number): boolean {
  return weatherCode === 0 || weatherCode === 1
}

/** Conseil d'habillement pour enfants selon la météo (règles métier). */
export function recommendClothing(weather: WeatherNow): ClothingAdvice {
  if (isRainy(weather)) {
    return { text: 'Imperméable ou parapluie', icon: '🌂' }
  }
  if (weather.temperature < 12) {
    return { text: 'Gros manteau requis', icon: '🧥' }
  }
  if (weather.temperature <= 18) {
    return { text: 'Veste légère ou pull nécessaire', icon: '🧥' }
  }
  if (weather.temperature > 22 && isSunny(weather.weatherCode)) {
    return { text: 'Casquette & crème solaire', icon: '🧢' }
  }
  return { text: 'Tenue légère, rien de particulier', icon: '👕' }
}

/** Emoji représentant l'état du ciel (décoratif, doublé d'un texte accessible). */
export function skyIcon(weatherCode: number): string {
  if (weatherCode === 0 || weatherCode === 1) return '☀️'
  if (weatherCode === 2) return '⛅'
  if (weatherCode === 3) return '☁️'
  if (weatherCode === 45 || weatherCode === 48) return '🌫️'
  if (weatherCode >= 71 && weatherCode <= 77) return '🌨️'
  if (weatherCode >= 85 && weatherCode <= 86) return '🌨️'
  if (weatherCode >= 95) return '⛈️'
  if (PRECIP_CODES.has(weatherCode)) return '🌧️'
  return '🌡️'
}

export async function geocodeCity(name: string): Promise<GeoResult | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    name,
  )}&count=1&language=fr&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Échec du géocodage de la ville')
  const data: unknown = await res.json()
  const results = (data as { results?: unknown[] }).results
  if (!results || results.length === 0) return null
  const first = results[0] as {
    name: string
    latitude: number
    longitude: number
    postcodes?: string[]
  }
  return {
    name: first.name,
    latitude: first.latitude,
    longitude: first.longitude,
    postalCode: first.postcodes?.[0] ?? null,
  }
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherNow> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,precipitation`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Échec de la récupération de la météo')
  const data: unknown = await res.json()
  const current = (data as {
    current?: {
      temperature_2m: number
      weather_code: number
      precipitation: number
    }
  }).current
  if (!current) throw new Error('Réponse météo invalide')
  return {
    temperature: current.temperature_2m,
    weatherCode: current.weather_code,
    precipitation: current.precipitation,
  }
}
