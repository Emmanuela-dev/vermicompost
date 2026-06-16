import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { useEffect, useMemo, useState } from 'react'

type SensorName = 'temperature' | 'moisture' | 'ph' | 'humidity' | 'ammonia'

type SensorReading = {
  name: SensorName
  label: string
  value: number
  unit: string
  min: number
  max: number
  idealMin: number
  idealMax: number
  description: string
}

type SensorHistory = {
  time: string
  temperature: number
  moisture: number
  ph: number
  humidity: number
  ammonia: number
}

type RecommendationState = {
  text: string
  generatedAt: string
}

const fallbackReadings: SensorReading[] = [
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
  },
  {
    name: 'ph',
    label: 'pH',
    value: 7.2,
    unit: '',
    min: 4,
    max: 9,
    idealMin: 6.5,
    idealMax: 7.5,
    description: 'pH shows whether the compost is acidic or alkaline.',
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
  },
]

const emptyHistory: SensorHistory[] = []

function formatValue(value: number, unit: string) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}${unit ? ` ${unit}` : ''}`
}

function getStatus(reading: SensorReading) {
  if (reading.value < reading.min || reading.value > reading.max) {
    return { label: 'Critical', className: 'bg-red-50 text-red-700 ring-red-200' }
  }

  if (reading.value < reading.idealMin || reading.value > reading.idealMax) {
    return { label: 'Watch', className: 'bg-amber-50 text-amber-700 ring-amber-200' }
  }

  return { label: 'Optimal', className: 'bg-leaf-50 text-leaf-700 ring-leaf-200' }
}

function getTrendLabel(value: number, min: number, max: number) {
  const midpoint = (min + max) / 2
  const distance = value - midpoint

  if (Math.abs(distance) < (max - min) * 0.1) return 'Stable'
  return distance > 0 ? 'Rising' : 'Falling'
}

function getEvents(readings: SensorReading[]) {
  return readings.flatMap((reading) => {
    const status = getStatus(reading)

    if (status.label === 'Optimal') return []

    if (reading.name === 'temperature' && reading.value > reading.idealMax) {
      return [`Temperature is above the ideal range (${formatValue(reading.value, reading.unit)}). Heat buildup may stress worms.`]
    }

    if (reading.name === 'temperature' && reading.value < reading.idealMin) {
      return [`Temperature is below the ideal range (${formatValue(reading.value, reading.unit)}). Worm feeding activity may slow down.`]
    }

    if (reading.name === 'moisture' && reading.value > reading.idealMax) {
      return [`Moisture is high (${formatValue(reading.value, reading.unit)}). The bin may be waterlogged or low on oxygen.`]
    }

    if (reading.name === 'moisture' && reading.value < reading.idealMin) {
      return [`Moisture is low (${formatValue(reading.value, reading.unit)}). Add lightly damp bedding or mist the bin.`]
    }

    if (reading.name === 'ph' && reading.value < reading.idealMin) {
      return [`pH is acidic (${formatValue(reading.value, reading.unit)}). Add crushed eggshells or agricultural lime.`]
    }

    if (reading.name === 'ph' && reading.value > reading.idealMax) {
      return [`pH is alkaline (${formatValue(reading.value, reading.unit)}). Add leaf litter or slightly acidic bedding.`]
    }

    if (reading.name === 'ammonia' && reading.value > reading.idealMax) {
      return [`Ammonia is elevated (${formatValue(reading.value, reading.unit)}). Reduce nitrogen-heavy food waste and mix in dry carbon bedding.`]
    }

    return [`${reading.label} is ${status.label.toLowerCase()} at ${formatValue(reading.value, reading.unit)}.`]
  })
}

function normalizeSensorReading(input: Partial<SensorReading> & { name: string; value: number }) {
  const fallback = fallbackReadings.find((reading) => reading.name === input.name)

  if (!fallback) {
    return null
  }

  return {
    ...fallback,
    ...input,
    unit: input.unit ?? fallback.unit,
    min: input.min ?? fallback.min,
    max: input.max ?? fallback.max,
    idealMin: input.idealMin ?? fallback.idealMin,
    idealMax: input.idealMax ?? fallback.idealMax,
  }
}

function normalizeHistory(input: Partial<SensorHistory>) {
  const temperature = typeof input.temperature === 'number' ? input.temperature : fallbackReadings[0].value
  const moisture = typeof input.moisture === 'number' ? input.moisture : fallbackReadings[1].value
  const ph = typeof input.ph === 'number' ? input.ph : fallbackReadings[2].value
  const humidity = typeof input.humidity === 'number' ? input.humidity : fallbackReadings[3].value
  const ammonia = typeof input.ammonia === 'number' ? input.ammonia : fallbackReadings[4].value

  return {
    time: input.time ?? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature,
    moisture,
    ph,
    humidity,
    ammonia,
  }
}

function normalizeReadingsResponse(data: unknown): { readings: SensorReading[]; history: SensorHistory[] } {
  const payload = data as {
    readings?: Partial<SensorReading>[]
    history?: Partial<SensorHistory>[]
    sensors?: Partial<SensorReading>[]
  }

  const source = payload.readings ?? payload.sensors ?? []
  const readings = source
    .map((item) => normalizeSensorReading(item as Partial<SensorReading> & { name: string; value: number }))
    .filter((item): item is SensorReading => Boolean(item))

  const history = (payload.history ?? []).map((item) => normalizeHistory(item))

  if (readings.length === 0 && payload.readings === undefined && payload.sensors === undefined) {
    const normalized = normalizeHistory(payload as Partial<SensorHistory>)
    return { readings: fallbackReadings, history: [normalized] }
  }

  return {
    readings: readings.length > 0 ? readings : fallbackReadings,
    history: history.length > 0 ? history : [normalizeHistory({})],
  }
}

function generateFallbackReadings(): { readings: SensorReading[]; history: SensorHistory[] } {
  const temperature = Number((25 + Math.random() * 5).toFixed(1))
  const moisture = Number((62 + Math.random() * 16).toFixed(1))
  const ph = Number((6.8 + (Math.random() - 0.5) * 0.8).toFixed(1))
  const humidity = Number((58 + Math.random() * 18).toFixed(1))
  const ammonia = Number((10 + Math.random() * 22).toFixed(1))

  return {
    readings: fallbackReadings.map((reading) => {
      const value = {
        temperature,
        moisture,
        ph,
        humidity,
        ammonia,
      }[reading.name]

      return {
        ...reading,
        value,
      }
    }),
    history: [
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature,
        moisture,
        ph,
        humidity,
        ammonia,
      },
    ],
  }
}

function buildPrompt(readings: SensorReading[], events: string[]) {
  const readingsText = readings
    .map((reading) => {
      const status = getStatus(reading)
      return `${reading.label}: ${formatValue(reading.value, reading.unit)} (range ${reading.min}-${reading.max}${reading.unit}, ideal ${reading.idealMin}-${reading.idealMax}${reading.unit}, ${status.label})`
    })
    .join('\n')

  return `You are a vermicomposting operations assistant. Analyze these IoT sensor readings and give practical, concise recommendations.

Rules:
- Use only the readings below.
- Return 3-5 bullet points.
- Each bullet should start with an action verb.
- Mention urgent actions first if any reading is critical.
- Keep the answer under 120 words.
- Do not invent sensor values.

Readings:
${readingsText}

Current dashboard events:
${events.join('\n') || 'All readings are within the ideal range.'}

Recommendations:`
}

async function fetchGroqRecommendations(readings: SensorReading[], events: string[], signal: AbortSignal) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  const model = import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant'

  if (!apiKey) {
    return {
      text: 'Add VITE_GROQ_API_KEY to your environment file to enable AI recommendations. The dashboard is still using rule-based guidance from the sensor readings.',
      generatedAt: new Date().toISOString(),
    }
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: 'You provide concise vermicomposting recommendations from sensor readings.',
        },
        {
          role: 'user',
          content: buildPrompt(readings, events),
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || `Groq request failed with status ${response.status}`)
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const text = data.choices?.[0]?.message?.content?.trim()

  if (!text) {
    throw new Error('Groq returned an empty recommendation response.')
  }

  return {
    text,
    generatedAt: new Date().toISOString(),
  }
}

function getFallbackRecommendations(events: string[]) {
  const bullets = events.slice(0, 4)

  if (bullets.length === 0) {
    bullets.push('Keep monitoring. All sensor readings are currently within the ideal range.')
    bullets.push('Maintain the current feeding schedule and bedding balance.')
  }

  return {
    text: bullets.map((event) => `- ${event}`).join('\n'),
    generatedAt: new Date().toISOString(),
  }
}

function DashboardCards({ readings }: { readings: SensorReading[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {readings.map((reading) => {
        const status = getStatus(reading)
        const trend = getTrendLabel(reading.value, reading.min, reading.max)
        const progress = ((reading.value - reading.min) / (reading.max - reading.min)) * 100
        const safeProgress = Math.min(100, Math.max(0, progress))

        return (
          <div key={reading.name} className="rounded-2xl border border-earth-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-earth-600">{reading.label}</p>
                <div className="mt-2 text-3xl font-bold tracking-tight text-earth-900">
                  {formatValue(reading.value, reading.unit)}
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${status.className}`}>
                {status.label}
              </span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-earth-100">
              <div
                className={`h-2 rounded-full ${status.label === 'Optimal' ? 'bg-leaf-500' : status.label === 'Watch' ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${safeProgress}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-earth-600">
              <span>{trend}</span>
              <span>
                Ideal {formatValue(reading.idealMin, reading.unit)}-{formatValue(reading.idealMax, reading.unit)}
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-earth-700">{reading.description}</p>
          </div>
        )
      })}
    </div>
  )
}

function SensorChart({ history }: { history: SensorHistory[] }) {
  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 10, right: 20, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#f5e9d8" />
          <XAxis dataKey="time" tick={{ fill: '#6e4e36', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8b6544', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e8d3b5',
              background: '#fefdfb',
              boxShadow: '0 10px 25px rgba(140, 100, 60, 0.1)',
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="temperature" name="Temperature °C" stroke="#4a9060" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="moisture" name="Moisture %" stroke="#3a734d" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="ph" name="pH" stroke="#a67c52" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="humidity" name="Humidity %" stroke="#c19563" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="ammonia" name="Ammonia ppm" stroke="#8b6544" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function RecommendationPanel({
  recommendation,
  isLoading,
  error,
  onRefresh,
}: {
  recommendation: RecommendationState
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}) {
  return (
    <section className="rounded-3xl border border-leaf-200 bg-gradient-to-br from-leaf-50 to-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-block rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-leaf-700 ring-1 ring-leaf-200">
            AI Recommendations
          </span>
          <h2 className="mt-4 text-xl font-semibold text-earth-900">What to do next</h2>
          <p className="mt-2 text-sm text-earth-700">
            Recommendations are generated from the latest sensor readings.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="rounded-full bg-earth-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-earth-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Generating...' : 'Refresh AI'}
        </button>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-leaf-100">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm leading-relaxed text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-earth-800">
          {recommendation.text}
        </div>
        <div className="mt-4 border-t border-earth-100 pt-3 text-xs text-earth-600">
          {isLoading ? 'Waiting for Groq...' : `Generated ${new Date(recommendation.generatedAt).toLocaleString()}`}
        </div>
      </div>
    </section>
  )
}

export default function Data() {
  const [readings, setReadings] = useState<SensorReading[]>(fallbackReadings)
  const [history, setHistory] = useState<SensorHistory[]>(emptyHistory)
  const [isLoading, setIsLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<RecommendationState>(getFallbackRecommendations([]))
  const [error, setError] = useState<string | null>(null)

  const events = useMemo(() => getEvents(readings), [readings])

  const refreshRecommendationsFor = async (sourceReadings: SensorReading[], sourceEvents: string[]) => {
    const controller = new AbortController()

    setIsLoading(true)
    setError(null)

    try {
      const aiRecommendation = await fetchGroqRecommendations(sourceReadings, sourceEvents, controller.signal)
      setRecommendation(aiRecommendation)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unable to generate recommendations.'
      setRecommendation(getFallbackRecommendations(sourceEvents))
      setError(`${message} Showing rule-based recommendations instead.`)
    } finally {
      setIsLoading(false)
    }

    return controller
  }

  const refreshReadings = async () => {
    setIsLoading(true)
    setError(null)

    const controller = new AbortController()

    try {
      const iotUrl = import.meta.env.VITE_IOT_API_URL

      if (iotUrl) {
        const response = await fetch(iotUrl, { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`IoT API request failed with status ${response.status}`)
        }

        const data = await response.json()
        const normalized = normalizeReadingsResponse(data)

        setReadings(normalized.readings)
        setHistory((current) => [...current.slice(-23), ...normalized.history])
        await refreshRecommendationsFor(normalized.readings, getEvents(normalized.readings))
      } else {
        const generated = generateFallbackReadings()
        setReadings(generated.readings)
        setHistory((current) => [...current.slice(-23), ...generated.history])
        await refreshRecommendationsFor(generated.readings, getEvents(generated.readings))
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unable to load sensor readings.'
      setRecommendation(getFallbackRecommendations(events))
      setError(message)
    } finally {
      setIsLoading(false)
    }

    return controller
  }

  useEffect(() => {
    let controller: AbortController | null = null

    const loadInitial = async () => {
      controller = await refreshReadings()
    }

    void loadInitial()

    const interval = window.setInterval(() => {
      void refreshReadings()
    }, 30000)

    return () => {
      window.clearInterval(interval)
      controller?.abort()
    }
  }, [])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      <section className="text-center">
        <span className="inline-block rounded-full bg-leaf-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-leaf-700">
          Live IoT Dashboard
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-earth-900 sm:text-4xl">
          Vermicompost Sensor Dashboard
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-earth-700">
          Monitor temperature, moisture, pH, humidity, and ammonia while the AI assistant turns readings into practical actions.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-800 ring-1 ring-amber-200">
          {error}
        </div>
      )}

      <DashboardCards readings={readings} />

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-earth-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-earth-900">Sensor Trends</h2>
              <p className="mt-1 text-sm text-earth-700">Latest readings from the vermicompost bin.</p>
            </div>
            <div className="text-sm text-earth-600">
              {isLoading ? 'Updating readings...' : `Last update ${new Date().toLocaleTimeString()}`}
            </div>
          </div>
          <SensorChart history={history.length > 0 ? history : [normalizeHistory({})]} />
        </div>

        <div className="rounded-3xl border border-earth-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-earth-900">What is happening</h2>
          <p className="mt-1 text-sm text-earth-700">
            Events are interpreted directly from the current sensor values.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            {events.length > 0 ? (
              events.map((event, index) => (
                <div key={`${event}-${index}`} className="rounded-2xl bg-earth-50 p-4 text-sm leading-relaxed text-earth-800 ring-1 ring-earth-100">
                  {event}
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-leaf-50 p-4 text-sm leading-relaxed text-leaf-800 ring-1 ring-leaf-100">
                All readings are within their ideal ranges. Keep the current feeding and bedding routine.
              </div>
            )}
          </div>
        </div>
      </section>

      <RecommendationPanel
        recommendation={recommendation}
        isLoading={isLoading}
        error={error}
        onRefresh={() => void refreshRecommendationsFor(readings, events)}
      />
    </div>
  )
}
