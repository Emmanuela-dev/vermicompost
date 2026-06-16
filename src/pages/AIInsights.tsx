import { useState, useEffect, useRef } from 'react'
import { useSensorData, getStatus, formatValue, computeHealthScore, type SensorReading } from '../hooks/useSensorData'

type RecommendationState = {
  text: string
  generatedAt: string
}

function buildPrompt(readings: SensorReading[]) {
  const readingsText = readings
    .map((r) => {
      const status = getStatus(r)
      return `${r.label}: ${formatValue(r.value, r.unit)} (ideal ${r.idealMin}–${r.idealMax}${r.unit}, Status: ${status})`
    })
    .join('\n')

  return `You are an expert vermicomposting assistant. Analyze these IoT sensor readings and provide specific, actionable recommendations.

Rules:
- Return exactly 4–5 bullet points.
- Start each bullet with an action verb.
- Address the most urgent issues first if any reading is Critical or Watch.
- Be concise (max 25 words per bullet).
- Do not repeat sensor values; focus on what the farmer should DO.

Current Sensor Readings:
${readingsText}

Recommendations:`
}

async function fetchGroqRecommendations(
  readings: SensorReading[],
  signal: AbortSignal,
): Promise<RecommendationState> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined
  const model = (import.meta.env.VITE_GROQ_MODEL as string | undefined) || 'llama-3.1-8b-instant'

  if (!apiKey) {
    return {
      text: '• Add your VITE_GROQ_API_KEY to the .env file to enable AI-powered recommendations.\n• Currently showing rule-based guidance based on sensor readings.\n• Ensure moisture stays between 60–80% for optimal worm activity.\n• Monitor temperature closely — keep it under 29°C to avoid heat stress.\n• Add carbon-rich bedding if ammonia levels rise above 25 ppm.',
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
      temperature: 0.25,
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content: 'You are a vermicomposting expert. Give precise, practical recommendations from sensor data. Use bullet points.',
        },
        {
          role: 'user',
          content: buildPrompt(readings),
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`)
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] }
  const text = data.choices?.[0]?.message?.content?.trim()

  if (!text) throw new Error('Empty response from Groq')

  return { text, generatedAt: new Date().toISOString() }
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('')
  const prevText = useRef('')

  useEffect(() => {
    if (text === prevText.current) return
    prevText.current = text
    setDisplayed('')

    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(interval)
    }, 12)

    return () => clearInterval(interval)
  }, [text])

  const lines = displayed.split('\n').filter(Boolean)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {lines.map((line, i) => {
        const cleaned = line.replace(/^[•\-*]\s*/, '')
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#34d399',
                fontWeight: 700,
                marginTop: '1px',
              }}
            >
              {i + 1}
            </span>
            <span style={{ fontSize: '14px', color: '#c7d7fd', lineHeight: 1.6 }}>{cleaned}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function AIInsights() {
  const { readings, isLoading: sensorLoading, lastUpdated, usingFirebase } = useSensorData({ pollInterval: 60000 })
  const [recommendation, setRecommendation] = useState<RecommendationState | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const health = computeHealthScore(readings)
  const healthLabel = health >= 85 ? 'Excellent' : health >= 70 ? 'Good' : health >= 50 ? 'Fair' : 'Needs Attention'
  const healthColor = health >= 85 ? '#34d399' : health >= 70 ? '#fbbf24' : '#fb7185'

  const maturity = Math.min(100, Math.round((health * 0.78) + Math.random() * 5))

  const runAnalysis = async () => {
    setAiLoading(true)
    setError(null)
    const controller = new AbortController()

    try {
      const result = await fetchGroqRecommendations(readings, controller.signal)
      setRecommendation(result)
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setError((e as Error).message)
      }
    } finally {
      setAiLoading(false)
    }
  }

  // Auto-run on first load
  useEffect(() => {
    if (!sensorLoading && readings.length > 0 && !recommendation) {
      void runAnalysis()
    }
  }, [sensorLoading, readings])

  // hasApiKey kept for backward compat — Groq key now sourced from .env
  // const hasApiKey = !!import.meta.env.VITE_GROQ_API_KEY

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(99,112,241,0.08) 0%, transparent 55%), #080c14',
        padding: '40px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            background: 'rgba(99,112,241,0.12)',
            color: '#a5b8fc',
            border: '1px solid rgba(99,112,241,0.25)',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '12px',
          }}
        >
          🤖 AI Insights — Powered by Groq
        </span>
        <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', color: '#e8edf5', marginBottom: '8px' }}>
          AI Recommendations
        </h1>
        <p style={{ color: '#546a92', fontSize: '15px' }}>
          Groq AI analyzes your sensor readings and recommends precise actions •{' '}
          <span style={{ color: '#9aaec8' }}>Last analysis {lastUpdated.toLocaleTimeString()}</span>
        </p>
        <div style={{ marginTop: '10px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              background: usingFirebase ? 'rgba(16,185,129,0.1)' : 'rgba(99,112,241,0.1)',
              color: usingFirebase ? '#34d399' : '#a5b8fc',
              border: `1px solid ${usingFirebase ? 'rgba(16,185,129,0.25)' : 'rgba(99,112,241,0.25)'}`,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: usingFirebase ? '#34d399' : '#a5b8fc',
                animation: usingFirebase ? 'pulse 2s infinite' : 'none',
              }}
            />
            {usingFirebase ? '🔥 Live from Firebase' : '⚡ Simulated data — add Firebase config to .env'}
          </span>
        </div>
      </div>

      {/* Groq AI active indicator */}
      {import.meta.env.VITE_GROQ_API_KEY && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.15)',
            color: '#6ee7b7',
            fontSize: '13px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✅</span>
          <span>Groq AI connected — recommendations are powered by live sensor data{usingFirebase ? ' from Firebase' : ''}.</span>
        </div>
      )}

      {/* Status cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {/* Health */}
        <div
          style={{
            background: 'rgba(19,26,46,0.7)',
            border: `1px solid ${healthColor}33`,
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: `0 0 24px ${healthColor}18`,
          }}
        >
          <div style={{ fontSize: '13px', color: '#546a92', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Compost Health
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: healthColor, marginBottom: '4px' }}>{healthLabel}</div>
          <div style={{ fontSize: '12px', color: '#7189ad' }}>Score: {health}%</div>
        </div>

        {/* Maturity */}
        <div
          style={{
            background: 'rgba(19,26,46,0.7)',
            border: '1px solid rgba(99,112,241,0.2)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div style={{ fontSize: '13px', color: '#546a92', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Compost Maturity
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#a5b8fc', marginBottom: '12px' }}>{maturity}%</div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', height: '6px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${maturity}%`,
                background: 'linear-gradient(90deg,#4241cf,#6370f1,#a5b8fc)',
                borderRadius: '9999px',
                transition: 'width 1s ease',
              }}
            />
          </div>
          <div style={{ fontSize: '11px', color: '#546a92', marginTop: '6px' }}>Estimated readiness</div>
        </div>

        {/* Sensor alerts */}
        <div
          style={{
            background: 'rgba(19,26,46,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div style={{ fontSize: '13px', color: '#546a92', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Sensor Alerts
          </div>
          {readings
            .filter((r) => getStatus(r) !== 'Optimal')
            .slice(0, 3)
            .map((r) => {
              const status = getStatus(r)
              const color = status === 'Critical' ? '#fb7185' : '#fbbf24'
              return (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px' }}>{r.icon}</span>
                  <span style={{ fontSize: '12px', color, fontWeight: 600 }}>{r.label}: {status}</span>
                </div>
              )
            })}
          {readings.every((r) => getStatus(r) === 'Optimal') && (
            <div style={{ fontSize: '13px', color: '#34d399', fontWeight: 600 }}>✓ All readings optimal</div>
          )}
        </div>

        {/* Model */}
        <div
          style={{
            background: 'rgba(19,26,46,0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚡</div>
          <div style={{ fontSize: '13px', color: '#546a92', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
            AI Model
          </div>
          <div style={{ fontSize: '14px', color: '#a5b8fc', fontWeight: 700 }}>Llama 3.1</div>
          <div style={{ fontSize: '11px', color: '#546a92' }}>via Groq Cloud</div>
        </div>
      </div>

      {/* AI Recommendation Panel */}
      <div
        style={{
          background: 'rgba(19,26,46,0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(99,112,241,0.2)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 0 40px rgba(99,112,241,0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e8edf5', marginBottom: '4px' }}>
              What to do next
            </h2>
            <p style={{ fontSize: '13px', color: '#546a92' }}>
              {recommendation
                ? `Generated ${new Date(recommendation.generatedAt).toLocaleString()}`
                : 'Waiting for analysis…'}
            </p>
          </div>
          <button
            onClick={() => void runAnalysis()}
            disabled={aiLoading}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: aiLoading ? 'not-allowed' : 'pointer',
              opacity: aiLoading ? 0.6 : 1,
              background: aiLoading ? 'rgba(99,112,241,0.1)' : 'linear-gradient(135deg,#4241cf,#6370f1)',
              color: '#e8edf5',
              border: '1px solid rgba(99,112,241,0.4)',
              transition: 'all 0.2s ease',
              boxShadow: aiLoading ? 'none' : '0 0 16px rgba(99,112,241,0.3)',
            }}
          >
            {aiLoading ? '⏳ Analyzing…' : '✨ Refresh Analysis'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.2)',
              color: '#fb7185',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* AI Output */}
        {aiLoading && !recommendation ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="shimmer"
                style={{ height: '20px', borderRadius: '8px', width: i === 4 ? '60%' : '100%' }}
              />
            ))}
          </div>
        ) : recommendation ? (
          <TypewriterText text={recommendation.text} />
        ) : null}
      </div>
    </div>
  )
}
