import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import { useSensorData, type SensorHistory } from '../hooks/useSensorData'

type ChartConfig = {
  key: keyof Omit<SensorHistory, 'time'>
  label: string
  unit: string
  color: string
  gradientId: string
  idealMin: number
  idealMax: number
  icon: string
  description: string
}

const chartConfigs: ChartConfig[] = [
  {
    key: 'temperature',
    label: 'Temperature',
    unit: '°C',
    color: '#f59e0b',
    gradientId: 'gradTemp',
    idealMin: 20,
    idealMax: 29,
    icon: '🌡️',
    description: 'Ideal range: 20–29°C for optimal worm activity',
  },
  {
    key: 'moisture',
    label: 'Moisture',
    unit: '%',
    color: '#38bdf8',
    gradientId: 'gradMoisture',
    idealMin: 60,
    idealMax: 80,
    icon: '💧',
    description: 'Ideal range: 60–80% for healthy decomposition',
  },
  {
    key: 'humidity',
    label: 'Air Humidity',
    unit: '%',
    color: '#a78bfa',
    gradientId: 'gradHumidity',
    idealMin: 50,
    idealMax: 75,
    icon: '🌫️',
    description: 'Ideal range: 50–75% relative air humidity',
  },
]

type TooltipPayload = {
  value: number
  dataKey: string
  color: string
}

function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
  unit: string
}) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div
      style={{
        background: 'rgba(13,18,32,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '13px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ color: '#546a92', marginBottom: '4px', fontSize: '11px' }}>{label}</div>
      <div style={{ color: payload[0].color, fontWeight: 700, fontSize: '18px' }}>
        {val.toFixed(1)}{unit}
      </div>
    </div>
  )
}

function TrendChart({ config, history }: { config: ChartConfig; history: SensorHistory[] }) {
  const values = history.map((h) => h[config.key] as number)
  const latest = values[values.length - 1] ?? 0
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 0

  return (
    <div
      style={{
        background: 'rgba(19,26,46,0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '20px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '20px' }}>{config.icon}</span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#e8edf5' }}>{config.label} Trend</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#546a92' }}>{config.description}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: config.color, lineHeight: 1 }}>
            {latest.toFixed(1)}{config.unit}
          </div>
          <div style={{ fontSize: '11px', color: '#546a92', marginTop: '2px' }}>Current</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Average', value: avg.toFixed(1) + config.unit },
          { label: 'Min', value: min.toFixed(1) + config.unit },
          { label: 'Max', value: max.toFixed(1) + config.unit },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.05)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', color: '#546a92', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              {label}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: config.color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#546a92', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={Math.floor(history.length / 6)}
            />
            <YAxis tick={{ fill: '#546a92', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip unit={config.unit} />} />
            <ReferenceLine
              y={config.idealMin}
              stroke={config.color}
              strokeDasharray="4 4"
              strokeOpacity={0.3}
              label={{ value: 'Min ideal', fill: config.color, fontSize: 10, opacity: 0.6 }}
            />
            <ReferenceLine
              y={config.idealMax}
              stroke={config.color}
              strokeDasharray="4 4"
              strokeOpacity={0.3}
              label={{ value: 'Max ideal', fill: config.color, fontSize: 10, opacity: 0.6 }}
            />
            <Line
              type="monotone"
              dataKey={config.key}
              stroke={config.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: config.color, stroke: '#0d1220', strokeWidth: 2 }}
              style={{ filter: `drop-shadow(0 0 4px ${config.color}60)` }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function Monitoring() {
  const { history, isLoading, lastUpdated, error } = useSensorData({ pollInterval: 30000 })

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 60% 10%, rgba(56,189,248,0.05) 0%, transparent 50%), #080c14',
        padding: '40px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              background: 'rgba(56,189,248,0.1)',
              color: '#38bdf8',
              border: '1px solid rgba(56,189,248,0.2)',
              textTransform: 'uppercase',
            }}
          >
            Sensor Monitoring
          </span>
          {isLoading && <span style={{ fontSize: '12px', color: '#546a92' }}>Refreshing…</span>}
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', color: '#e8edf5', marginBottom: '8px' }}>
          Historical Trends
        </h1>
        <p style={{ color: '#546a92', fontSize: '15px' }}>
          Last 24 hours of sensor data •{' '}
          <span style={{ color: '#9aaec8' }}>Updated {lastUpdated.toLocaleTimeString()}</span>
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(244,63,94,0.08)',
            border: '1px solid rgba(244,63,94,0.2)',
            color: '#fb7185',
            fontSize: '13px',
            marginBottom: '24px',
          }}
        >
          ⚠️ {error} — Showing simulated data.
        </div>
      )}

      {chartConfigs.map((config) => (
        <TrendChart key={config.key} config={config} history={history} />
      ))}
    </div>
  )
}
