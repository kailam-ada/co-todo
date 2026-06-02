import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFamily } from '../hooks/useFamily'
import {
  fetchWeather,
  recommendClothing,
  skyIcon,
  type WeatherNow,
} from '../lib/weather'

export function WeatherWidget() {
  const { family, loading } = useFamily()
  const [weather, setWeather] = useState<WeatherNow | null>(null)

  const lat = family?.latitude ?? null
  const lon = family?.longitude ?? null

  useEffect(() => {
    if (lat == null || lon == null) return
    let active = true
    fetchWeather(lat, lon)
      .then((w) => {
        if (active) setWeather(w)
      })
      .catch(() => {
        if (active) setWeather(null)
      })
    return () => {
      active = false
    }
  }, [lat, lon])

  if (loading) return null

  if (!family || lat == null || lon == null) {
    return (
      <Link
        to="/compte"
        className="flex min-h-[36px] items-center gap-1.5 rounded-full border border-dashed border-line-strong bg-surface px-3 text-sm font-bold text-muted hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream"
      >
        <span aria-hidden="true">📍</span>
        <span className="hidden sm:inline">Définir la ville</span>
      </Link>
    )
  }

  if (!weather) return null

  const temp = Math.round(weather.temperature)
  // Conseil basé sur la température affichée (arrondie) pour rester cohérent.
  const advice = recommendClothing({ ...weather, temperature: temp })

  return (
    <div
      role="img"
      aria-label={`Météo à ${family.city ?? 'votre ville'} : ${temp} degrés. Conseil habillage enfants : ${advice.text}.`}
      className="flex min-h-[36px] items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm text-ink-2"
    >
      <span aria-hidden="true">{skyIcon(weather.weatherCode)}</span>
      <span className="font-bold">{temp}°</span>
      {family.city && (
        <span className="hidden text-muted sm:inline">{family.city}</span>
      )}
      <span aria-hidden="true" className="text-line-strong">
        ·
      </span>
      <span aria-hidden="true">{advice.icon}</span>
      <span aria-hidden="true" className="hidden md:inline">
        {advice.text}
      </span>
    </div>
  )
}
