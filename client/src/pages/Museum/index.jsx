import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePassport } from '../../context/PassportContext.jsx'
import { useXP } from '../../hooks/useXP.js'
import artifacts from '../../data/artifacts.json'
import badges from '../../data/badges.json'
import EraRoom from './EraRoom.jsx'

const ERAS = [
  {
    id: 'ancient',
    label: 'Ancient India',
    period: '3000 BCE – 600 CE',
    emoji: '🏺',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.04))',
    border: 'rgba(245,158,11,0.3)',
    description: 'Indus Valley Civilisation, Vedic age, Maurya & Gupta empires — the golden foundations of India.',
    stamp: { eraId: 'ancient', name: 'Ancient India Stamp' },
    badge: badges.find(b => b.id === 'badge-001'),
  },
  {
    id: 'medieval',
    label: 'Medieval India',
    period: '600 CE – 1700 CE',
    emoji: '🏰',
    color: '#FF6B2B',
    gradient: 'linear-gradient(135deg, rgba(255,107,43,0.18), rgba(255,107,43,0.04))',
    border: 'rgba(255,107,43,0.3)',
    description: 'Delhi Sultanate, Mughal splendour, Vijayanagara Empire — an era of conquest, commerce, and art.',
    stamp: { eraId: 'medieval', name: 'Medieval India Stamp' },
    badge: badges.find(b => b.id === 'badge-002'),
  },
  {
    id: 'freedom',
    label: 'Freedom Movement',
    period: '1757 CE – 1947 CE',
    emoji: '🕊️',
    color: '#138808',
    gradient: 'linear-gradient(135deg, rgba(19,136,8,0.18), rgba(19,136,8,0.04))',
    border: 'rgba(19,136,8,0.3)',
    description: "Resistance, sacrifice, and the long march toward independence — India's most defining chapter.",
    stamp: { eraId: 'freedom', name: 'Freedom Movement Stamp' },
    badge: badges.find(b => b.id === 'badge-003'),
  },
  {
    id: 'modern',
    label: 'Modern India',
    period: '1947 CE – Present',
    emoji: '🚀',
    color: '#38bdf8',
    gradient: 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(56,189,248,0.04))',
    border: 'rgba(56,189,248,0.3)',
    description: "From the Green Revolution to ISRO's Moon mission — a new nation rising on ancient roots.",
    stamp: { eraId: 'modern', name: 'Modern India Stamp' },
    badge: badges.find(b => b.id === 'badge-004'),
  },
]

export default function Museum() {
  const [activeEra, setActiveEra] = useState(null)
  const { passport, addStamp, addBadge } = usePassport()
  const { addXP } = useXP()

  // Track which artifacts the user has viewed per era
  const [viewedArtifacts, setViewedArtifacts] = useState({})

  const markArtifactViewed = (eraId, artifactId) => {
    setViewedArtifacts(prev => ({
      ...prev,
      [eraId]: new Set([...(prev[eraId] || []), artifactId]),
    }))
  }

  const eraProgress = useMemo(() => {
    const result = {}
    for (const era of ERAS) {
      const eraArtifacts = artifacts.filter(a => a.era === era.id)
      const viewed = viewedArtifacts[era.id]?.size || 0
      result[era.id] = { total: eraArtifacts.length, viewed }
    }
    return result
  }, [viewedArtifacts])

  const hasStamp = (eraId) => passport.stamps.some(s => s.eraId === eraId)

  const handleEraComplete = (era) => {
    if (!hasStamp(era.id)) {
      addStamp(era.stamp)
      addXP(50, `${era.label} Heritage Stamp`)
      if (era.badge) {
        addBadge(era.badge)
      }
    }
  }

  // Check if all eras have stamps → Heritage Hunter badge
  const allStamped = ERAS.every(e => hasStamp(e.id))

  if (activeEra) {
    return (
      <EraRoom
        era={activeEra}
        artifacts={artifacts.filter(a => a.era === activeEra.id)}
        viewedArtifacts={viewedArtifacts[activeEra.id] || new Set()}
        onArtifactViewed={(id) => markArtifactViewed(activeEra.id, id)}
        onComplete={() => handleEraComplete(activeEra)}
        onBack={() => setActiveEra(null)}
        hasStamp={hasStamp(activeEra.id)}
        progress={eraProgress[activeEra.id]}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-deep-900)' }}>
      {/* Hero banner */}
      <div style={{
        position: 'relative',
        padding: '80px 24px 60px',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Background gradient orbs */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 30% 40%, rgba(245,158,11,0.10) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(255,107,43,0.08) 0%, transparent 50%)',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '16px' }}>🏛️</span>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '900', color: '#fff', margin: '0 0 12px',
          }}>
            Digital Museum
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.5)', maxWidth: '520px',
            margin: '0 auto 32px', lineHeight: 1.7,
          }}>
            Walk through four eras of Indian history. Read artifacts in
            Historical or Story mode, listen to narrations, and collect a
            <span style={{ color: '#FF6B2B', fontWeight: '600' }}> Heritage Stamp</span> per era completed.
          </p>

          {/* Stamps collected indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {ERAS.map(era => (
              <div key={era.id} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: hasStamp(era.id) ? `rgba(${era.color === '#f59e0b' ? '245,158,11' : era.color === '#FF6B2B' ? '255,107,43' : era.color === '#138808' ? '19,136,8' : '56,189,248'},0.15)` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${hasStamp(era.id) ? era.border : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '999px', padding: '4px 12px',
                fontSize: '0.78rem', fontFamily: 'var(--font-body)',
                color: hasStamp(era.id) ? era.color : 'rgba(255,255,255,0.4)',
              }}>
                <span>{era.emoji}</span>
                <span>{hasStamp(era.id) ? '✓' : '○'}</span>
                <span>{era.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Era selection grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
        }}>
          {ERAS.map((era, i) => {
            const prog = eraProgress[era.id]
            const stamped = hasStamp(era.id)
            const pct = prog ? Math.round((prog.viewed / prog.total) * 100) : 0

            return (
              <motion.div
                key={era.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                onClick={() => setActiveEra(era)}
                role="button"
                tabIndex={0}
                aria-label={`Enter ${era.label} era room`}
                onKeyDown={(e) => e.key === 'Enter' && setActiveEra(era)}
                style={{
                  background: era.gradient,
                  border: `1px solid ${era.border}`,
                  borderRadius: '20px',
                  padding: '32px 28px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Stamp badge */}
                {stamped && (
                  <div style={{
                    position: 'absolute', top: '16px', right: '16px',
                    background: era.color, borderRadius: '999px',
                    padding: '3px 10px', fontSize: '0.7rem',
                    fontWeight: '700', color: '#fff',
                    fontFamily: 'var(--font-body)',
                  }}>
                    🪬 Stamped
                  </div>
                )}

                <div style={{ fontSize: '2.8rem', marginBottom: '16px' }}>{era.emoji}</div>

                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.25rem',
                  fontWeight: '800', color: '#fff', margin: '0 0 4px',
                }}>
                  {era.label}
                </h2>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                  color: era.color, fontWeight: '600', marginBottom: '12px',
                }}>
                  {era.period}
                </div>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.87rem',
                  color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: '0 0 24px',
                }}>
                  {era.description}
                </p>

                {/* Progress bar */}
                <div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: '6px',
                    fontSize: '0.72rem', fontFamily: 'var(--font-body)',
                    color: 'rgba(255,255,255,0.35)',
                  }}>
                    <span>{prog.viewed}/{prog.total} artifacts viewed</span>
                    <span>{pct}%</span>
                  </div>
                  <div style={{
                    height: '4px', background: 'rgba(255,255,255,0.08)',
                    borderRadius: '999px', overflow: 'hidden',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 + 0.3 }}
                      style={{
                        height: '100%',
                        background: `linear-gradient(90deg, ${era.color}, #FF6B2B)`,
                        borderRadius: '999px',
                      }}
                    />
                  </div>
                </div>

                {/* Bottom enter cue */}
                <div style={{
                  marginTop: '20px',
                  fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                  color: era.color, fontWeight: '600',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  Enter Room →
                </div>

                {/* Decorative bottom line */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, ${era.color}, transparent)`,
                }} />
              </motion.div>
            )
          })}
        </div>

        {/* All-eras complete callout */}
        {allStamped && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              marginTop: '40px',
              background: 'linear-gradient(135deg, rgba(255,107,43,0.12), rgba(245,158,11,0.08))',
              border: '1px solid rgba(255,107,43,0.3)',
              borderRadius: '16px', padding: '24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏆</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '1.1rem',
              fontWeight: '700', color: '#fbbf24',
            }}>
              Heritage Hunter — All 4 eras completed!
            </div>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.5)', marginTop: '6px',
            }}>
              You've collected every Heritage Stamp. The complete story of India is in your Passport.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
