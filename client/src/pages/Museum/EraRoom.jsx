import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ArtifactCard from './ArtifactCard.jsx'
import Icon from '../../components/Icon.jsx'

export default function EraRoom({
  era,
  artifacts,
  viewedArtifacts,
  onArtifactViewed,
  onComplete,
  onBack,
  hasStamp,
  progress,
}) {
  const [openArtifact, setOpenArtifact] = useState(null)

  const handleOpenArtifact = (artifact) => {
    setOpenArtifact(artifact)
    if (!viewedArtifacts.has(artifact.id)) {
      onArtifactViewed(artifact.id)
      // Check if this completes the era
      if (progress.viewed + 1 >= progress.total) {
        setTimeout(() => onComplete(), 400)
      }
    }
  }

  const pct = Math.round((progress.viewed / progress.total) * 100)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-deep-900)' }}>

      {/* Parallax hero banner */}
      <div style={{
        position: 'relative',
        padding: '64px 24px 48px',
        overflow: 'hidden',
        borderBottom: `1px solid ${era.border}`,
      }}>
        {/* Animated background */}
        <motion.div
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse at 20% 50%, ${era.color}22 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, ${era.color}10 0%, transparent 50%)`,
          }}
        />

        {/* Floating decorative shapes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -12, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
            style={{
              position: 'absolute',
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
              width: 6 + i * 2,
              height: 6 + i * 2,
              borderRadius: '50%',
              background: era.color,
              opacity: 0.3,
              pointerEvents: 'none',
            }}
          />
        ))}

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
          {/* Back button */}
          <button
            onClick={onBack}
            aria-label="Back to Museum"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', padding: '6px 14px',
              color: 'rgba(255,255,255,0.6)',
              fontFamily: 'var(--font-body)', fontSize: '0.85rem',
              cursor: 'pointer', marginBottom: '24px',
              transition: 'all 0.2s',
            }}
          >
            ← All Eras
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ marginBottom: '12px' }}><Icon name={era.icon} size={48} /></div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: '900', color: '#fff', margin: '0 0 6px',
            }}>
              {era.label}
            </h1>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: '0.9rem',
              color: era.color, fontWeight: '600', marginBottom: '12px',
            }}>
              {era.period}
            </div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '1rem',
              color: 'rgba(255,255,255,0.55)', lineHeight: 1.7,
              maxWidth: '560px', margin: '0 0 24px',
            }}>
              {era.description}
            </p>

            {/* Progress bar */}
            <div style={{ maxWidth: '400px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: '6px', fontSize: '0.75rem',
                fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.4)',
              }}>
                <span>{progress.viewed} of {progress.total} artifacts explored</span>
                {hasStamp && <span style={{ color: era.color }}><Icon name="stamp" size={14} /> Stamp Collected!</span>}
              </div>
              <div style={{
                height: '6px', background: 'rgba(255,255,255,0.08)',
                borderRadius: '999px', overflow: 'hidden',
              }}>
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5 }}
                  style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${era.color}, #FF6B2B)`,
                    borderRadius: '999px',
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Artifacts grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {artifacts.map((artifact, i) => (
            <motion.div
              key={artifact.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <ArtifactCard
                artifact={artifact}
                era={era}
                isViewed={viewedArtifacts.has(artifact.id)}
                onClick={() => handleOpenArtifact(artifact)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Artifact detail modal */}
      <AnimatePresence>
        {openArtifact && (
          <ArtifactModal
            artifact={openArtifact}
            era={era}
            onClose={() => setOpenArtifact(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Artifact Modal ─────────────────────────────────────────── */
function ArtifactModal({ artifact, era, onClose }) {
  const [mode, setMode] = useState('historical') // 'historical' | 'story'
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef(null)

  const currentText = mode === 'historical' ? artifact.factText : artifact.storyText

  const handleNarrate = useCallback(() => {
    // NOTE: Using Web Speech API SpeechSynthesis (browser built-in TTS).
    // No audio files needed — clearly a dev-time fallback per spec.
    if (!window.speechSynthesis) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(currentText)
    utterance.lang = 'en-IN'
    utterance.rate = 0.9
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }, [isSpeaking, currentText])

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  // Stop speaking when mode changes or modal closes
  const handleModeChange = (newMode) => {
    stopSpeaking()
    setMode(newMode)
  }

  const handleClose = () => {
    stopSpeaking()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-deep-800)',
          border: `1px solid ${era.border}`,
          borderRadius: '20px',
          maxWidth: '680px', width: '100%',
          maxHeight: '88vh', overflowY: 'auto',
        }}
      >
        {/* Image */}
        <div style={{
          width: '100%', aspectRatio: '16/9',
          position: 'relative', overflow: 'hidden',
          borderRadius: '20px 20px 0 0',
        }}>
          <img
            src={artifact.image}
            alt={artifact.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(15,14,23,0.9) 0%, transparent 60%)',
          }} />
          {/* Close button */}
          <button
            onClick={handleClose}
            aria-label="Close artifact detail"
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(0,0,0,0.5)', border: 'none',
              color: '#fff', width: '36px', height: '36px',
              borderRadius: '50%', fontSize: '1.1rem',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '28px' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.5rem',
            fontWeight: '800', color: '#fff', margin: '0 0 8px',
          }}>
            {artifact.name}
          </h2>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '0.78rem',
            color: era.color, fontWeight: '600',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: '20px',
          }}>
            {era.label} · {artifact.region}
          </div>

          {/* Mode toggle + narration */}
          <div style={{
            display: 'flex', gap: '8px', marginBottom: '24px',
            alignItems: 'center', flexWrap: 'wrap',
          }}>
            {/* Mode toggle */}
            <div style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '10px',
              padding: '3px',
            }}>
              {['historical', 'story'].map(m => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  aria-pressed={mode === m}
                  aria-label={`${m === 'historical' ? 'Historical' : 'Story'} mode`}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: mode === m
                      ? `linear-gradient(135deg, ${era.color}, #FF6B2B)`
                      : 'transparent',
                    color: mode === m ? '#fff' : 'rgba(255,255,255,0.5)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.82rem',
                    fontWeight: mode === m ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {m === 'historical' ? <><Icon name="artifact" size={15} /> Historical</> : <><Icon name="story" size={15} /> Story Mode</>}
                </button>
              ))}
            </div>

            {/* Narration button */}
            {window.speechSynthesis && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNarrate}
                aria-label={isSpeaking ? 'Stop narration' : 'Play narration'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${isSpeaking ? era.color : 'rgba(255,255,255,0.15)'}`,
                  background: isSpeaking ? `${era.color}22` : 'rgba(255,255,255,0.04)',
                  color: isSpeaking ? era.color : 'rgba(255,255,255,0.6)',
                  fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                {isSpeaking ? <><Icon name="close" size={15} /> Stop</> : <><Icon name="speaker" size={15} /> Listen</>}
              </motion.button>
            )}
          </div>

          {/* Mode label */}
          <div style={{
            fontSize: '0.72rem', fontFamily: 'var(--font-body)',
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: '10px',
          }}>
            {mode === 'historical' ? <><Icon name="artifact" size={16} /> Historical Account</> : <><Icon name="story" size={16} /> Folklore & Legend</>}
          </div>

          {/* Text */}
          <AnimatePresence mode="wait">
            <motion.p
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.85, margin: 0,
              }}
            >
              {currentText}
            </motion.p>
          </AnimatePresence>

          {/* Tags */}
          {artifact.tags && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '20px' }}>
              {artifact.tags.map(tag => (
                <span key={tag} style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '999px', padding: '3px 10px',
                  fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)',
                  fontFamily: 'var(--font-body)',
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
