import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePassport } from '../../context/PassportContext.jsx'
import { useXP } from '../../hooks/useXP.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import artifacts from '../../data/artifacts.json'
import badges from '../../data/badges.json'
import EraRoom from './EraRoom.jsx'
import Icon from '../../components/Icon.jsx'

const ERAS = [
  {
    id: 'ancient',
    label: 'Prachin Bharat',
    period: '3000 BCE – 600 CE • Ancient Era',
    icon: 'artifact',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.04))',
    border: 'rgba(245,158,11,0.3)',
    image: '/images/museum/artifacts/anc-001.png',
    description: 'Indus Valley Civilisation, Vedic age, Maurya & Gupta empires — the golden foundations of India.',
    stamp: { eraId: 'ancient', name: 'Prachin Bharat Stamp' },
  },
  {
    id: 'medieval',
    label: 'Madhyakalin Bharat',
    period: '600 CE – 1700 CE • Medieval Era',
    icon: 'museum',
    color: '#FF6B2B',
    gradient: 'linear-gradient(135deg, rgba(255,107,43,0.18), rgba(255,107,43,0.04))',
    border: 'rgba(255,107,43,0.3)',
    image: '/images/museum/artifacts/med-001.png',
    description: 'Delhi Sultanate, Mughal splendour, Vijayanagara Empire — an era of conquest, commerce, and art.',
    stamp: { eraId: 'medieval', name: 'Madhyakalin Bharat Stamp' },
  },
  {
    id: 'freedom',
    label: 'Swatantrata Sangram',
    period: '1757 CE – 1947 CE • Freedom Movement',
    icon: 'nature',
    color: '#138808',
    gradient: 'linear-gradient(135deg, rgba(19,136,8,0.18), rgba(19,136,8,0.04))',
    border: 'rgba(19,136,8,0.3)',
    image: '/images/museum/artifacts/freedom-001.png',
    description: "Resistance, sacrifice, and the long march toward independence — India's most defining chapter.",
    stamp: { eraId: 'freedom', name: 'Swatantrata Sangram Stamp' },
  },
  {
    id: 'modern',
    label: 'Adhunik Bharat',
    period: '1947 CE – Present • Modern Era',
    icon: 'rocket',
    color: '#38bdf8',
    gradient: 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(56,189,248,0.04))',
    border: 'rgba(56,189,248,0.3)',
    image: '/images/museum/artifacts/modern-001.png',
    description: "From the Green Revolution to ISRO's Moon mission — a new nation rising on ancient roots.",
    stamp: { eraId: 'modern', name: 'Adhunik Bharat Stamp' },
  },
]

export default function Museum() {
  const [activeEra, setActiveEra] = useState(null)
  const { passport, addStamp, addBadge } = usePassport()
  const { addXP } = useXP()

  // Track which artifacts the user has viewed per era
  const [viewedArtifactIds, setViewedArtifactIds] = useLocalStorage('museum_viewed_artifacts_v1', {})

  const markArtifactViewed = (eraId, artifactId) => {
    setViewedArtifactIds(prev => {
      const current = Array.isArray(prev[eraId]) ? prev[eraId] : []
      return current.includes(artifactId)
        ? prev
        : { ...prev, [eraId]: [...current, artifactId] }
    })
  }

  const eraProgress = useMemo(() => {
    const result = {}
    for (const era of ERAS) {
      const eraArtifacts = artifacts.filter(a => a.era === era.id)
      const viewed = Array.isArray(viewedArtifactIds[era.id]) ? viewedArtifactIds[era.id].length : 0
      result[era.id] = { total: eraArtifacts.length, viewed }
    }
    return result
  }, [viewedArtifactIds])

  const hasStamp = (eraId) => passport.stamps.some(s => s.eraId === eraId)

  const handleEraComplete = (era) => {
    if (!hasStamp(era.id)) {
      addStamp(era.stamp)
      addXP(50, `${era.label} Heritage Stamp`)
      const completesHeritage = ERAS.every(item => item.id === era.id || hasStamp(item.id))
      if (completesHeritage) {
        const heritageBadge = badges.find(b => b.id === 'badge-005')
        if (heritageBadge) {
          addBadge(heritageBadge)
          addXP(heritageBadge.xpReward, `Badge: ${heritageBadge.name}`)
        }
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
        viewedArtifacts={new Set(viewedArtifactIds[activeEra.id] || [])}
        onArtifactViewed={(id) => markArtifactViewed(activeEra.id, id)}
        onComplete={() => handleEraComplete(activeEra)}
        onBack={() => setActiveEra(null)}
        hasStamp={hasStamp(activeEra.id)}
        progress={eraProgress[activeEra.id]}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-deep-900)' }} className="indian-motif-bg">
      {/* Hero banner */}
      <div style={{
        position: 'relative',
        padding: '80px 24px 60px',
        textAlign: 'center',
        overflow: 'hidden',
        minHeight: '390px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: "linear-gradient(180deg, rgba(15,14,23,0.38) 0%, rgba(15,14,23,0.62) 56%, var(--color-deep-900) 100%), url('/images/museum/museum-hero.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
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
          <span style={{ display: 'block', marginBottom: '16px' }}><Icon name="museum" size={56} /></span>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
            fontWeight: '900', color: '#fff', margin: '0 0 8px', letterSpacing: '0.5px',
          }}>
            Bharat Sangrahalaya
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: 'rgba(255, 255, 255, 0.75)',
            margin: 0,
            fontWeight: '500',
          }}>
            Interactive Digital Museum of Indian History & Heritage
          </p>
        </motion.div>
      </div>

      {/* Era selection grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
                  backgroundImage: `linear-gradient(180deg, rgba(7,13,27,0.35), rgba(7,13,27,0.96)), url('${era.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
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
                    <Icon name="stamp" size={14} /> Stamped
                  </div>
                )}

                <div style={{ marginBottom: '16px' }}><Icon name={era.icon} size={44} /></div>

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
            <div style={{ marginBottom: '8px' }}><Icon name="trophy" size={32} /></div>
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
