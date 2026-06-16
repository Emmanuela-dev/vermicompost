import { useState, useEffect, useCallback, useRef } from 'react'
import { ref, onValue, off } from 'firebase/database'
import type { DataSnapshot, DatabaseReference } from 'firebase/database'
import { db } from '../lib/firebase'

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

/** Returns true when all required Firebase env vars are present */
function isFirebaseConfigured(): boolean {
  const key = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined
  return !!key && key !== 'YOUR_FIREBASE_API_KEY'
}

/** Map a raw Firebase snapshot object onto our SensorReading array */
function mapFirebaseSnapshot(data: Record<string, unknown>): SensorReading[] {
  return fallbackReadings.map((r) => {
    const raw = data[r.name]
    const value = typeof raw === 'number' ? raw : r.value
    return { ...r, value }
  })
}

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
  pollInterval?: number // used only in simulated fallback mode
}

export function useSensorData({ pollInterval = 30000 }: UseSensorDataOptions = {}) {
  const firebaseReady = isFirebaseConfigured()

  const [readings, setReadings] = useState<SensorReading[]>(fallbackReadings)
  const [history, setHistory] = useState<SensorHistory[]>(generateSimulatedHistory(24))
  const [isLoading, setIsLoading] = useState(firebaseReady)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /** Append a reading snapshot to the rolling 24-point history */
  const appendHistory = useCallback((live: SensorReading[]) => {
    const now = new Date()
    const point: SensorHistory = {
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: live[0].value,
      moisture: live[1].value,
      humidity: live[2].value,
      waterLevel: live[3].value,
      ph: live[4].value,
      ammonia: live[5].value,
    }
    setHistory((prev) => [...prev.slice(-23), point])
  }, [])

  /** noop when Firebase is active — updates arrive via onValue() */
  const refresh = useCallback(async () => {}, [])

  useEffect(() => {
    if (firebaseReady && db) {
      // ── Firebase real-time mode ──────────────────────────────────
      setIsLoading(true)
      setError(null)

      const sensorsRef: DatabaseReference = ref(db, 'sensors')

      const unsubscribe = onValue(
        sensorsRef,
        (snapshot: DataSnapshot) => {
          const data = snapshot.val() as Record<string, unknown> | null
          if (data) {
            const mapped = mapFirebaseSnapshot(data)
            setReadings(mapped)
            appendHistory(mapped)
            setLastUpdated(new Date())
            setError(null)
          }
          setIsLoading(false)
        },
        (err: Error) => {
          setError(`Firebase: ${err.message}`)
          setIsLoading(false)
        },
      )

      return () => {
        off(sensorsRef)
        unsubscribe()
      }
    }

    // ── Simulated fallback mode ──────────────────────────────────
    setIsLoading(false)

    const tick = () => {
      const live = generateLiveReadings()
      setReadings(live)
      appendHistory(live)
      setLastUpdated(new Date())
    }

    tick()
    simulationRef.current = setInterval(tick, pollInterval)
    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current)
    }
  }, [pollInterval, appendHistory, firebaseReady])

  return {
    readings,
    history,
    isLoading,
    lastUpdated,
    error,
    refresh,
    usingFirebase: firebaseReady,
  }
}
