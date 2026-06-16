const STAGES = [
  {
    id: 0,
    label: 'Fresh Waste',
    emoji: '🗑️',
    description: 'Raw organic material added to the bin. High moisture and microbial activity begins.',
    duration: 'Days 1–3',
    color: '#f59e0b',
    tips: ['Shred materials into small pieces', 'Maintain 60–70% moisture', 'Avoid citrus and onion peel'],
  },
  {
    id: 1,
    label: 'Active Decomposition',
    emoji: '🔥',
    description: 'Microbes break down complex organics. Temperature rises as biological activity peaks.',
    duration: 'Days 4–10',
    color: '#f97316',
    tips: ['Monitor temperature — keep below 35°C', 'Turn bedding to aerate', 'Add carbon materials if smelly'],
  },
  {
    id: 2,
    label: 'Vermicomposting',
    emoji: '🪱',
    description: 'Worms actively process pre-decomposed material. Castings begin to accumulate.',
    duration: 'Days 11–25',
    color: '#10b981',
    tips: ['Feed worms every 3–4 days', 'Keep pH between 6.5 and 7.5', 'Avoid overfeeding'],
  },
  {
    id: 3,
    label: 'Near Harvest',
    emoji: '⏳',
    description: 'Dark, earthy castings form throughout the bin. Worm population stabilizes.',
    duration: 'Days 26–35',
    color: '#06b6d4',
    tips: ['Reduce feeding to encourage migration', 'Begin separating castings', 'Check moisture — add dry bedding if needed'],
  },
  {
    id: 4,
    label: 'Ready for Harvest',
    emoji: '✅',
    description: 'Rich vermicompost ready for use. Dark, crumbly, and earthy-smelling castings.',
    duration: 'Day 35+',
    color: '#a78bfa',
    tips: ['Harvest top 2/3 of castings', 'Return remaining worms to bin', 'Cure harvested compost for 2 weeks before use'],
  },
]

const CURRENT_STAGE = 2 // Vermicomposting
const DAYS_ELAPSED = 21
const TOTAL_DAYS = 35

export default function Lifecycle() {
  const progress = Math.round((DAYS_ELAPSED / TOTAL_DAYS) * 100)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 30% 50%, rgba(16,185,129,0.06) 0%, transparent 55%), #080c14',
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
            background: 'rgba(16,185,129,0.1)',
            color: '#34d399',
            border: '1px solid rgba(16,185,129,0.2)',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '12px',
          }}
        >
          🔄 Compost Lifecycle
        </span>
        <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', color: '#e8edf5', marginBottom: '8px' }}>
          Compost Journey Tracker
        </h1>
        <p style={{ color: '#546a92', fontSize: '15px' }}>
          Track your compost through each biological stage from fresh waste to harvest-ready castings.
        </p>
      </div>

      {/* Overall progress bar */}
      <div
        style={{
          background: 'rgba(19,26,46,0.7)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          padding: '28px',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#546a92', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Overall Progress
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#34d399' }}>Day {DAYS_ELAPSED} of {TOTAL_DAYS}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '40px', fontWeight: 800, color: '#34d399', lineHeight: 1 }}>{progress}%</div>
            <div style={{ fontSize: '12px', color: '#546a92' }}>Complete</div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', height: '10px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg,#059669,#10b981,#34d399)',
              borderRadius: '9999px',
              transition: 'width 1.2s ease',
              boxShadow: '0 0 12px rgba(16,185,129,0.4)',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#3d5278' }}>
          <span>Start</span>
          <span>14 days remaining</span>
          <span>Harvest</span>
        </div>
      </div>

      {/* Stage pipeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {STAGES.map((stage, idx) => {
          const isActive = stage.id === CURRENT_STAGE
          const isDone = stage.id < CURRENT_STAGE
          const isPending = stage.id > CURRENT_STAGE

          return (
            <div key={stage.id} style={{ display: 'flex', gap: '0' }}>
              {/* Timeline connector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '20px', flexShrink: 0 }}>
                {/* Circle */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0,
                    zIndex: 1,
                    background: isDone
                      ? 'rgba(16,185,129,0.15)'
                      : isActive
                      ? `${stage.color}22`
                      : 'rgba(255,255,255,0.04)',
                    border: isDone
                      ? '2px solid rgba(16,185,129,0.5)'
                      : isActive
                      ? `2px solid ${stage.color}`
                      : '2px solid rgba(255,255,255,0.08)',
                    boxShadow: isActive ? `0 0 20px ${stage.color}50` : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isDone ? '✓' : stage.emoji}
                </div>
                {/* Vertical line */}
                {idx < STAGES.length - 1 && (
                  <div
                    style={{
                      width: '2px',
                      flex: 1,
                      minHeight: '32px',
                      background: isDone
                        ? 'linear-gradient(to bottom, rgba(16,185,129,0.5), rgba(16,185,129,0.2))'
                        : 'rgba(255,255,255,0.06)',
                      margin: '4px 0',
                    }}
                  />
                )}
              </div>

              {/* Card */}
              <div
                style={{
                  flex: 1,
                  marginBottom: idx < STAGES.length - 1 ? '8px' : '0',
                  marginTop: '0',
                  paddingBottom: idx < STAGES.length - 1 ? '16px' : '0',
                }}
              >
                <div
                  style={{
                    background: isActive
                      ? `rgba(19,26,46,0.9)`
                      : isDone
                      ? 'rgba(16,185,129,0.04)'
                      : 'rgba(19,26,46,0.4)',
                    border: isActive
                      ? `1px solid ${stage.color}55`
                      : isDone
                      ? '1px solid rgba(16,185,129,0.2)'
                      : '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    opacity: isPending ? 0.5 : 1,
                    boxShadow: isActive ? `0 0 32px ${stage.color}15` : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: isActive ? stage.color : isDone ? '#34d399' : '#546a92' }}>
                          {stage.label}
                        </span>
                        {isActive && (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '10px',
                              fontWeight: 700,
                              letterSpacing: '0.08em',
                              background: `${stage.color}20`,
                              color: stage.color,
                              border: `1px solid ${stage.color}40`,
                              textTransform: 'uppercase',
                            }}
                          >
                            Current
                          </span>
                        )}
                        {isDone && (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '10px',
                              fontWeight: 700,
                              letterSpacing: '0.08em',
                              background: 'rgba(16,185,129,0.12)',
                              color: '#34d399',
                              border: '1px solid rgba(16,185,129,0.25)',
                              textTransform: 'uppercase',
                            }}
                          >
                            Complete
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '13px', color: isPending ? '#3d5278' : '#7189ad', lineHeight: 1.5 }}>
                        {stage.description}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: isActive ? stage.color : '#3d5278',
                        background: isActive ? `${stage.color}15` : 'rgba(255,255,255,0.03)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: `1px solid ${isActive ? stage.color + '30' : 'rgba(255,255,255,0.05)'}`,
                        flexShrink: 0,
                        marginLeft: '12px',
                      }}
                    >
                      {stage.duration}
                    </span>
                  </div>

                  {/* Tips — only for active + done stages */}
                  {!isPending && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      {stage.tips.map((tip, ti) => (
                        <div
                          key={ti}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            color: isActive ? stage.color : '#546a92',
                            background: isActive ? `${stage.color}0d` : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isActive ? stage.color + '25' : 'rgba(255,255,255,0.05)'}`,
                          }}
                        >
                          {tip}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Harvest countdown */}
      <div
        style={{
          marginTop: '32px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: '20px',
          padding: '28px',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(16,185,129,0.08)',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🌱</div>
        <div style={{ fontSize: '13px', color: '#546a92', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Estimated Time to Harvest
        </div>
        <div style={{ fontSize: '48px', fontWeight: 900, color: '#34d399', letterSpacing: '-0.02em', lineHeight: 1 }}>
          14 Days
        </div>
        <p style={{ color: '#7189ad', fontSize: '14px', marginTop: '8px' }}>
          Your vermicompost will be ready for use around{' '}
          <strong style={{ color: '#9aaec8' }}>
            {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </strong>
        </p>
      </div>
    </div>
  )
}
