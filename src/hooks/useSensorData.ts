import { useState, useEffect, useCallback, useRef } from 'react'
import { ref, onValue, off } from 'firebase/database'
import type { DataSnapshot, DatabaseReference } from 'firebase/database'
import { db } from '../lib/firebase'

export type SensorName = 'temperature' | 'moisture' | 'humidity' | 'waterLevel' | 'ph' | 'ammonia'

// Sensors sourced from Firebase Realtime Database (real hardware)
const FIREBASE_SENSORS = new Set<SensorName>(['temperature', 'humidity', 'waterLevel'])

// Sensors without hardware — values are simulated
const SIMULATED_SENSORS = new Set<SensorName>(['moisture', 'ph', 'ammonia'])

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
  isSimulated?: boolean
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

export type FeedingStatus = {
  status: 'Feed Now' | 'Feed Soon' | 'Well Fed' | 'Overfed'
  message: string
  color: string
  icon: string
  urgent: boolean
}

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
    isSimulated: true,
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
    isSimulated: true,
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
    isSimulated: true,
  },
]

/** Returns true when all required Firebase env vars are present */
function isFirebaseConfigured(): boolean {
  const key = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined
  return !!key && key !== 'YOUR_FIREBASE_API_KEY'
}

/** Generate a new simulated value within the ideal range ± small variance */
function simulateValue(r: SensorReading): number {
  const variance = (r.idealMax - r.idealMin) * 0.12
  const base = (r.idealMin + r.idealMax) / 2
  return Number((base + (Math.random() - 0.5) * 2 * variance).toFixed(1))
}

function generateSimulatedHistory(points = 24): SensorHistory[] {
  const now = new Date()
  return Array.from({ length: points }, (_, i) => {
    const t = new Date(now.getTime() - (points - 1 - i) * 60 * 60 * 1000)
    return {
      time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: Number((24 + Math.sin(i / 4) * 3 + Math.random() * 1.5).toFixed(1)),
      moisture: Number((65 + Math.cos(i / 6) * 8 + Math.random() * 3).toFixed(1)),
      humidity: Number((60 + Math.sin(i / 5) * 7 + Math.random() * 2).toFixed(1)),
      waterLevel: Number((70 + Math.cos(i / 8) * 10 + Math.random() * 2).toFixed(1)),
      ph: Number((7.0 + Math.sin(i / 7) * 0.3 + Math.random() * 0.15).toFixed(2)),
      ammonia: Number((15 + Math.sin(i / 3) * 5 + Math.random() * 2).toFixed(1)),
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

/**
 * Determines whether the worms need feeding based on sensor readings.
 *
 * Logic (biologically grounded):
 * - Overfed  → ammonia > 28 ppm  (too much protein waste decomposing)
 * - Feed Now → moisture < 55%    (bin drying out — food nearly gone)
 * - Feed Soon→ moisture 55–63%   (food being consumed, top up soon)
 * - Well Fed → moisture 63–80%   (healthy, check again in 2–3 days)
 */
export function computeFeedingStatus(readings: SensorReading[]): FeedingStatus {
  const moisture = readings.find((r) => r.name === 'moisture')?.value ?? 68
  const ammonia = readings.find((r) => r.name === 'ammonia')?.value ?? 18

  if (ammonia > 28) {
    return {
      status: 'Overfed',
      message: 'Too much food — high ammonia detected. Stop feeding & aerate the bin.',
      color: '#f43f5e',
      icon: '🚫',
      urgent: true,
    }
  }
  if (moisture < 55) {
    return {
      status: 'Feed Now',
      message: 'Moisture is low — food scraps are depleted. Add moist food waste immediately.',
      color: '#fb923c',
      icon: '🍎',
      urgent: true,
    }
  }
  if (moisture < 63) {
    return {
      status: 'Feed Soon',
      message: 'Worms are actively feeding. Add food scraps within the next 24 hours.',
      color: '#fbbf24',
      icon: '⏰',
      urgent: false,
    }
  }
  return {
    status: 'Well Fed',
    message: 'Bin has adequate food. Monitor and feed again in 2–3 days.',
    color: '#34d399',
    icon: '✅',
    urgent: false,
  }
}

type UseSensorDataOptions = {
  pollInterval?: number // interval for refreshing simulated sensors
}

export function useSensorData({ pollInterval = 30000 }: UseSensorDataOptions = {}) {
  const firebaseReady = isFirebaseConfigured()

  const [readings, setReadings] = useState<SensorReading[]>(fallbackReadings)
  const [history, setHistory] = useState<SensorHistory[]>(generateSimulatedHistory(24))
  const [isLoading, setIsLoading] = useState(firebaseReady)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /** Append a reading snapshot to the rolling 24-point history */
  const appendHistory = useCallback((live: SensorReading[]) => {
    const now = new Date()
    const byName = Object.fromEntries(live.map((r) => [r.name, r.value]))
    setHistory((prev) => [
      ...prev.slice(-23),
      {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: byName.temperature ?? 0,
        moisture: byName.moisture ?? 0,
        humidity: byName.humidity ?? 0,
        waterLevel: byName.waterLevel ?? 0,
        ph: byName.ph ?? 0,
        ammonia: byName.ammonia ?? 0,
      },
    ])
  }, [])

  const refresh = useCallback(async () => {}, [])

  // ── Simulated sensor ticker (moisture, ph, ammonia) ─────────────────────────
  // Runs regardless of Firebase mode — these sensors have no hardware
  useEffect(() => {
    const tickSimulated = () => {
      setReadings((prev) => {
        const updated = prev.map((r) =>
          SIMULATED_SENSORS.has(r.name) ? { ...r, value: simulateValue(r) } : r,
        )
        return updated
      })
      setLastUpdated(new Date())
    }

    tickSimulated() // initial tick
    simIntervalRef.current = setInterval(tickSimulated, pollInterval)
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current)
    }
  }, [pollInterval])

  // ── Firebase real-time listener (temperature, humidity, waterLevel) ──────────
  useEffect(() => {
    if (!firebaseReady || !db) {
      // Full simulation mode — also simulate the Firebase sensors
      const tickAll = () => {
        setReadings((prev) => prev.map((r) => ({ ...r, value: simulateValue(r) })))
        setLastUpdated(new Date())
      }
      tickAll()
      return
    }

    setIsLoading(true)
    setError(null)

    const sensorsRef: DatabaseReference = ref(db, 'sensors')

    const unsubscribe = onValue(
      sensorsRef,
      (snapshot: DataSnapshot) => {
        const data = snapshot.val() as Record<string, unknown> | null
        if (data) {
          setReadings((prev) => {
            const updated = prev.map((r) => {
              if (FIREBASE_SENSORS.has(r.name)) {
                const raw = data[r.name]
                return typeof raw === 'number' ? { ...r, value: raw } : r
              }
              return r // keep simulated value for moisture/ph/ammonia
            })
            // append history with merged values
            const byName = Object.fromEntries(updated.map((r) => [r.name, r.value]))
            const now = new Date()
            setHistory((prev) => [
              ...prev.slice(-23),
              {
                time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                temperature: byName.temperature ?? 0,
                moisture: byName.moisture ?? 0,
                humidity: byName.humidity ?? 0,
                waterLevel: byName.waterLevel ?? 0,
                ph: byName.ph ?? 0,
                ammonia: byName.ammonia ?? 0,
              },
            ])
            return updated
          })
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
  }, [firebaseReady, appendHistory])

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
