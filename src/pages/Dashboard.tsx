import { useSensorData, getStatus, formatValue, computeHealthScore, type SensorReading } from '../hooks/useSensorData'

const statusColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  Optimal: {
    bg: 'rgba(16,185,129,0.08)',
    text: '#34d399',
    border: 'rgba(16,185,129,0.25)',
    glow: '0 0 16px rgba(16,185,129,0.2)',
  },
  Watch: {
    bg: 'rgba(245,158,11,0.08)',
    text: '#fbbf24',
    border: 'rgba(245,158,11,0.25)',
    glow: '0 0 16px rgba(245,158,11,0.2)',
  },
  Critical: {
    bg: 'rgba(244,63,94,0.08)',
    text: '#fb7185',
    border: 'rgba(244,63,94,0.25)',
    glow: '0 0 16px rgba(244,63,94,0.2)',
  },
}

const sensorBarColors: Record<string, string> = {
  temperature: 'linear-gradient(90deg,#dc2626,#f59e0b,#10b981)',
  moisture: 'linear-gradient(90deg,#1e40af,#3b82f6,#06b6d4)',
  humidity: 'linear-gradient(90deg,#7c3aed,#8b5cf6,#a78bfa)',
  waterLevel: 'linear-gradient(90deg,#0369a1,#0ea5e9,#38bdf8)',
  ph: 'linear-gradient(90deg,#92400e,#d97706,#10b981)',
  ammonia: 'linear-gradient(90deg,#10b981,#f59e0b,#ef4444)',
}

function SensorCard({ reading }: { reading: SensorReading }) {
  const status = getStatus(reading)
  const colors = statusColors[status]
  const progress = Math.min(100, Math.max(0, ((reading.value - reading.min) / (reading.max - reading.min)) * 100))

  return (
    <div
      className="card-hover"
      style={{
        background: 'rgba(19,26,46,0.7)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        padding: '20px',
        boxShadow: colors.glow,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>{reading.icon}</div>
          <div style={{ fontSize: '12px', color: '#546a92', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {reading.label}
          </div>
        </div>
        <span
          style={{
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            background: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
          }}
        >
          {status}
        </span>
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: '36px',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: colors.text,
          lineHeight: 1,
          marginBottom: '16px',
        }}
      >
        {formatValue(reading.value, reading.unit)}
      </div>

      {/* Progress bar */}
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', height: '6px', marginBottom: '10px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: sensorBarColors[reading.name] || 'linear-gradient(90deg,#059669,#10b981)',
            borderRadius: '9999px',
            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>

      {/* Ideal range */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#546a92' }}>
        <span>Min {formatValue(reading.min, reading.unit)}</span>
        <span style={{ color: '#6ee7b7' }}>
          Ideal {formatValue(reading.idealMin, reading.unit)}–{formatValue(reading.idealMax, reading.unit)}
        </span>
        <span>Max {formatValue(reading.max, reading.unit)}</span>
      </div>
    </div>
  )
}

function HealthScoreRing({ score }: { score: number }) {
  const radius = 52
  const circ = 2 * Math.PI * radius
  const filled = (score / 100) * circ
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#f43f5e'

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`}
          strokeDashoffset={circ * 0.25}
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: 800, color, lineHeight: 1 }}>{score}%</div>
        <div style={{ fontSize: '10px', color: '#546a92', fontWeight: 600, letterSpacing: '0.06em' }}>HEALTH</div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string
  value: string
  sub: string
  accent: string
  icon: string
}) {
  return (
    <div
      style={{
        background: 'rgba(19,26,46,0.7)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '20px 24px',
        flex: 1,
      }}
    >
      <div style={{ fontSize: '22px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '11px', color: '#546a92', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 800, color: accent, letterSpacing: '-0.01em' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#9aaec8', marginTop: '2px' }}>{sub}</div>
    </div>
  )
}

export default function Dashboard() {
  const { readings, isLoading, lastUpdated, error, usingFirebase } = useSensorData({ pollInterval: 30000 })
  const health = computeHealthScore(readings)
  const healthLabel = health >= 85 ? 'Excellent' : health >= 70 ? 'Good' : health >= 50 ? 'Fair' : 'Needs Attention'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 20% 20%, rgba(16,185,129,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(245,158,11,0.05) 0%, transparent 60%), #080c14',
        padding: '40px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              background: 'rgba(16,185,129,0.1)',
              color: '#34d399',
              border: '1px solid rgba(16,185,129,0.2)',
              textTransform: 'uppercase',
            }}
          >
            Live IoT Dashboard
          </span>
          {isLoading && (
            <span style={{ fontSize: '12px', color: '#546a92' }}>Updating…</span>
          )}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              background: usingFirebase ? 'rgba(16,185,129,0.08)' : 'rgba(99,112,241,0.08)',
              color: usingFirebase ? '#34d399' : '#a5b8fc',
              border: `1px solid ${usingFirebase ? 'rgba(16,185,129,0.2)' : 'rgba(99,112,241,0.2)'}`,
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: usingFirebase ? '#34d399' : '#a5b8fc',
                animation: usingFirebase ? 'pulse 2s infinite' : 'none',
              }}
            />
            {usingFirebase ? 'Firebase Live' : 'Simulated'}
          </span>
        </div>
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#e8edf5',
            marginBottom: '8px',
          }}
        >
          Compost Overview
        </h1>
        <p style={{ color: '#546a92', fontSize: '15px' }}>
          Real-time sensor readings from your vermicompost bin •{' '}
          <span style={{ color: '#9aaec8' }}>
            Last updated {lastUpdated.toLocaleTimeString()}
          </span>
        </p>
      </div>

      {/* Error banner */}
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

      {/* Summary stats row */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div
          style={{
            background: 'rgba(19,26,46,0.7)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '16px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            boxShadow: '0 0 24px rgba(16,185,129,0.1)',
          }}
        >
          <HealthScoreRing score={health} />
          <div>
            <div style={{ fontSize: '11px', color: '#546a92', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
              Compost Health
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399', lineHeight: 1, marginBottom: '4px' }}>
              {healthLabel}
            </div>
            <div style={{ fontSize: '13px', color: '#7189ad' }}>Based on all sensor readings</div>
          </div>
        </div>

        <StatCard
          icon="🪱"
          label="Current Stage"
          value="Vermicomposting"
          sub="Active worm processing"
          accent="#34d399"
        />
        <StatCard
          icon="⏳"
          label="Days Until Harvest"
          value="14 Days"
          sub="Est. harvest date"
          accent="#fbbf24"
        />
        <StatCard
          icon="📊"
          label="Data Points"
          value="24h"
          sub="Rolling history window"
          accent="#22d3ee"
        />
      </div>

      {/* Sensor grid */}
      <div style={{ marginBottom: '12px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#9aaec8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Current Readings
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {readings.map((reading) => (
            <SensorCard key={reading.name} reading={reading} />
          ))}
        </div>
      </div>
    </div>
  )
}
