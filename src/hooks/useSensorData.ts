import { useState, useEffect, useCallback } from 'react'

export type SensorName = 'temperature' | 'moisture' | 'humidity' | 'waterLevel' | 'ph' | 'ammonia'

export type SensorReading = {
  name: SensorName
  label: string
  value: number
  unit: string
  min: number
  max: number
  idealMin: number
  idealMax: number
  description: string
  icon: string
}

export type SensorHistory = {
  time: string
  temperature: number
  moisture: number
  humidity: number
  waterLevel: number
  ph: number
  ammonia: number
}

export type SensorStatus = 'Optimal' | 'Watch' | 'Critical'

export const fallbackReadings: SensorReading[] = [
  {
    name: 'temperature',
    label: 'Temperature',
    value: 26.8,
    unit: '°C',
    min: 10,
    max: 38,
    idealMin: 20,
    idealMax: 29,
    description: 'Bin temperature affects worm activity and microbial health.',
    icon: '🌡️',
  },
  {
    name: 'moisture',
    label: 'Moisture',
    value: 68,
    unit: '%',
    min: 30,
    max: 90,
    idealMin: 60,
    idealMax: 80,
    description: 'Moisture controls oxygen flow and worm comfort.',
    icon: '💧',
  },
  {
    name: 'humidity',
    label: 'Air Humidity',
    value: 62,
    unit: '%',
    min: 20,
    max: 100,
    idealMin: 50,
    idealMax: 75,
    description: 'Air humidity helps indicate drying or waterlogging risk.',
    icon: '🌫️',
  },
  {
    name: 'waterLevel',
    label: 'Water Level',
    value: 74,
    unit: '%',
    min: 0,
    max: 100,
    idealMin: 50,
    idealMax: 85,
    description: 'Water level in the reservoir for moisture regulation.',
    icon: '🪣',
  },
  {
    name: 'ph',
    label: 'pH Level',
    value: 7.2,
    unit: '',
    min: 4,
    max: 9,
    idealMin: 6.5,
    idealMax: 7.5,
    description: 'pH shows whether the compost is acidic or alkaline.',
    icon: '⚗️',
  },
  {
    name: 'ammonia',
    label: 'Ammonia',
    value: 18,
    unit: 'ppm',
    min: 0,
    max: 50,
    idealMin: 0,
    idealMax: 25,
    description: 'Ammonia indicates protein-rich waste decomposition intensity.',
    icon: '🧪',
  },
]

function generateSimulatedHistory(points = 24): SensorHistory[] {
  const now = new Date()
  return Array.from({ length: points }, (_, i) => {
    const t = new Date(now.getTime() - (points - 1 - i) * 60 * 60 * 1000)
    const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return {
      time: timeStr,
      temperature: Number((24 + Math.sin(i / 4) * 3 + Math.random() * 1.5).toFixed(1)),
      moisture: Number((65 + Math.cos(i / 6) * 8 + Math.random() * 3).toFixed(1)),
      humidity: Number((60 + Math.sin(i / 5) * 7 + Math.random() * 2).toFixed(1)),
      waterLevel: Number((70 + Math.cos(i / 8) * 10 + Math.random() * 2).toFixed(1)),
      ph: Number((7.0 + Math.sin(i / 7) * 0.3 + Math.random() * 0.15).toFixed(2)),
      ammonia: Number((15 + Math.sin(i / 3) * 5 + Math.random() * 2).toFixed(1)),
    }
  })
}

function generateLiveReadings(): SensorReading[] {
  return fallbackReadings.map((r) => {
    const variance = (r.idealMax - r.idealMin) * 0.12
    const base = (r.idealMin + r.idealMax) / 2
    return {
      ...r,
      value: Number((base + (Math.random() - 0.5) * 2 * variance).toFixed(1)),
    }
  })
}

export function getStatus(reading: SensorReading): SensorStatus {
  if (reading.value < reading.min || reading.value > reading.max) return 'Critical'
  if (reading.value < reading.idealMin || reading.value > reading.idealMax) return 'Watch'
  return 'Optimal'
}

export function formatValue(value: number, unit: string) {
  return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}${unit ? ` ${unit}` : ''}`
}

export function computeHealthScore(readings: SensorReading[]): number {
  const scores = readings.map((r) => {
    const status = getStatus(r)
    if (status === 'Critical') return 40
    if (status === 'Watch') return 75
    return 100
  })
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

type UseSensorDataOptions = {
  pollInterval?: number
  fetchHistory?: boolean
}

export function useSensorData({ pollInterval = 30000 }: UseSensorDataOptions = {}) {
  const [readings, setReadings] = useState<SensorReading[]>(fallbackReadings)
  const [history, setHistory] = useState<SensorHistory[]>(generateSimulatedHistory(24))
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const controller = new AbortController()

    try {
      const iotUrl = import.meta.env.VITE_IOT_API_URL as string | undefined
      const historyUrl = import.meta.env.VITE_IOT_HISTORY_URL as string | undefined

      if (iotUrl) {
        const res = await fetch(iotUrl, { signal: controller.signal })
        if (!res.ok) throw new Error(`IoT API responded with ${res.status}`)
        const data = (await res.json()) as Record<string, unknown>

        // Attempt to map API response to readings
        const mapped = fallbackReadings.map((r) => ({
          ...r,
          value: typeof data[r.name] === 'number' ? (data[r.name] as number) : r.value,
        }))
        setReadings(mapped)

        // History endpoint
        if (historyUrl) {
          const hRes = await fetch(`${historyUrl}`, { signal: controller.signal })
          if (hRes.ok) {
            const hData = (await hRes.json()) as SensorHistory[]
            setHistory(hData.slice(-24))
          }
        } else {
          const now = new Date()
          const newPoint: SensorHistory = {
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            temperature: mapped[0].value,
            moisture: mapped[1].value,
            humidity: mapped[2].value,
            waterLevel: mapped[3].value,
            ph: mapped[4].value,
            ammonia: mapped[5].value,
          }
          setHistory((prev) => [...prev.slice(-23), newPoint])
        }
      } else {
        // Simulated live data
        const live = generateLiveReadings()
        setReadings(live)
        const now = new Date()
        const newPoint: SensorHistory = {
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temperature: live[0].value,
          moisture: live[1].value,
          humidity: live[2].value,
          waterLevel: live[3].value,
          ph: live[4].value,
          ammonia: live[5].value,
        }
        setHistory((prev) => [...prev.slice(-23), newPoint])
      }

      setLastUpdated(new Date())
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setError((e as Error).message || 'Failed to fetch sensor data')
      }
    } finally {
      setIsLoading(false)
    }

    return controller
  }, [])

  useEffect(() => {
    let controller: AbortController | null = null

    const run = async () => {
      controller = await refresh()
    }

    void run()
    const interval = window.setInterval(() => void refresh(), pollInterval)

    return () => {
      window.clearInterval(interval)
      controller?.abort()
    }
  }, [refresh, pollInterval])

  return { readings, history, isLoading, lastUpdated, error, refresh }
}
