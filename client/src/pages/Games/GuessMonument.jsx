import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useXP } from '../../hooks/useXP.js'
import ALL_MONUMENTS from '../../data/monuments.json'
import Icon from '../../components/Icon.jsx'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const TOTAL_ROUNDS = 10

export default function GuessMonument({ onBack, onComplete }) {
  const { addXP } = useXP()

  const [difficulty, setDifficulty] = useState(null)
  
  const questions = useMemo(() => {
    if (!difficulty) return []
    return shuffle(ALL_MONUMENTS).slice(0, TOTAL_ROUNDS)
  }, [difficulty])

  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const q = questions[current]

  const handleAnswer = useCallback((option) => {
    if (showResult || !difficulty) return
    setSelected(option)
    setShowResult(true)
    
    const correct = option === q.answer
    if (correct) {
      addXP(20, 'Correct Monument!')
      setScore(s => s + 1)
    }

    setTimeout(() => {
      if (current + 1 >= TOTAL_ROUNDS) {
        setFinished(true)
        onComplete(score + (correct ? 1 : 0), TOTAL_ROUNDS, difficulty)
      } else {
        setCurrent(c => c + 1)
        setSelected(null)
        setShowResult(false)
        setShowHint(false)
      }
    }, 2000)
  }, [showResult, difficulty, q, current, score, addXP, onComplete])

  if (!difficulty) {
    return (
      <GameShell title="Guess the Monument" icon="museum" onBack={onBack} progress={0} total={TOTAL_ROUNDS} score={0}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '20px 0' }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', marginBottom: '10px' }}>Select Difficulty</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>Test your architectural knowledge.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px', margin: '0 auto' }}>
            <DifficultyButton
              title="Easy: Tourist"
              desc="Hint always visible below image."
              onClick={() => setDifficulty('easy')}
              color="#a78bfa"
            />
            <DifficultyButton
              title="Medium: Traveller"
              desc="Hint hidden. Standard gameplay."
              onClick={() => setDifficulty('medium')}
              color="#38bdf8"
            />
            <DifficultyButton
              title="Hard: Historian"
              desc="Image blurred! No hints allowed."
              onClick={() => setDifficulty('hard')}
              color="#f472b6"
            />
          </div>
        </motion.div>
      </GameShell>
    )
  }

  if (finished) {
    return <GameComplete title="Smarak Pehchan" score={score} total={TOTAL_ROUNDS} onBack={onBack} onReplay={() => {
      setDifficulty(null); setFinished(false); setCurrent(0); setScore(0); setSelected(null); setShowResult(false); setShowHint(false)
    }} icon="museum" />
  }

  const isHard = difficulty === 'hard'
  const isEasy = difficulty === 'easy'
  const blurAmount = (isHard && !showResult) ? 'blur(15px)' : 'none'

  return (
    <GameShell title="Smarak Pehchan" icon="museum" onBack={onBack} progress={current} total={TOTAL_ROUNDS} score={score}>
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Image */}
          <div style={{
            position: 'relative', width: '100%', height: '260px',
            borderRadius: '16px', overflow: 'hidden',
            background: '#000', border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <img
              src={q.image}
              alt="Monument"
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                filter: blurAmount, transition: 'filter 0.5s ease',
              }}
            />
          </div>

          {/* Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {q.options.map((option) => {
              const isSelected = selected === option
              const isCorrect = option === q.answer
              let bg = 'rgba(255,255,255,0.05)'
              let border = 'rgba(255,255,255,0.1)'
              let color = 'rgba(255,255,255,0.8)'

              if (showResult) {
                if (isCorrect) { bg = 'rgba(19,136,8,0.2)'; border = 'rgba(19,136,8,0.5)'; color = '#4ade80' }
                else if (isSelected) { bg = 'rgba(239,68,68,0.2)'; border = 'rgba(239,68,68,0.5)'; color = '#f87171' }
              } else if (isSelected) {
                bg = 'rgba(255,107,43,0.15)'; border = 'rgba(255,107,43,0.4)'
              }

              return (
                <motion.button
                  key={option}
                  whileHover={!selected ? { scale: 1.02 } : {}}
                  whileTap={!selected ? { scale: 0.97 } : {}}
                  onClick={() => handleAnswer(option)}
                  aria-pressed={isSelected}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: `1px solid ${border}`,
                    background: bg, color,
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.87rem', fontWeight: '500',
                    cursor: selected ? 'default' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  {showResult && isCorrect && '✓ '}
                  {showResult && isSelected && !isCorrect && '✗ '}
                  {option}
                </motion.button>
              )
            })}
          </div>

          {/* Hint */}
          {!showResult && !isHard && (
            <div style={{ textAlign: 'center' }}>
              {!isEasy && !showHint && (
                <button
                  onClick={() => setShowHint(true)}
                  style={{
                    background: 'none', border: 'none',
                    color: 'rgba(255,255,255,0.35)',
                    fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                    cursor: 'pointer', textDecoration: 'underline',
                  }}
                >
                  <Icon name="hint" size={16} /> Need a hint?
                </button>
              )}
              {(isEasy || showHint) && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: '10px',
                    padding: '10px 16px',
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                    color: '#fbbf24',
                  }}
                >
                  <Icon name="hint" size={16} /> {q.hint}
                </motion.div>
              )}
            </div>
          )}

          {/* Result Fact */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '10px',
                padding: '16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: '1.5',
              }}
            >
              <div style={{ color: selected === q.answer ? '#4ade80' : '#f87171', fontWeight: '700', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                {selected === q.answer ? 'Brilliant!' : `Actually, it's ${q.answer}.`}
              </div>
              {q.fact}
            </motion.div>
          )}

        </motion.div>
      </AnimatePresence>
    </GameShell>
  )
}

function DifficultyButton({ title, desc, onClick, color }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        background: `rgba(255,255,255,0.03)`,
        border: `1px solid rgba(255,255,255,0.1)`,
        padding: '16px', borderRadius: '12px',
        textAlign: 'left', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: '4px'
      }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: '700', color: color }}>
        {title}
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
        {desc}
      </div>
    </motion.button>
  )
}

/* ── Shared UI helpers ──────────────────────────────────────── */
export function GameShell({ title, icon = 'games', onBack, progress, total, score, children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-deep-900)', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', gap: '12px' }}>
          <button
            onClick={onBack}
            aria-label="Back to Games"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '6px 14px', color: 'rgba(255,255,255,0.6)',
              fontFamily: 'var(--font-body)', fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            ← Games
          </button>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '1rem',
            fontWeight: '700', color: '#fff',
          }}>
            <Icon name={icon} size={22} /> {title}
          </div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '0.85rem',
            color: '#fbbf24', fontWeight: '600',
          }}>
            {score} / {total} ✓
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: '4px', background: 'rgba(255,255,255,0.08)',
          borderRadius: '999px', overflow: 'hidden', marginBottom: '28px',
        }}>
          <motion.div
            animate={{ width: `${(progress / total) * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #FF6B2B, #fbbf24)', borderRadius: '999px' }}
          />
        </div>

        {children}
      </div>
    </div>
  )
}

export function GameComplete({ title, score, total, onBack, onReplay, icon = 'games' }) {
  const pct = Math.round((score / total) * 100)
  let msg = 'Keep exploring India!'
  if (pct >= 80) msg = 'Outstanding knowledge of India!'
  else if (pct >= 60) msg = 'Great job — you know your India!'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-deep-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        style={{
          background: 'linear-gradient(135deg, rgba(255,107,43,0.12), rgba(245,158,11,0.06))',
          border: '1px solid rgba(255,107,43,0.25)',
          borderRadius: '24px', padding: '48px 40px',
          maxWidth: '420px', width: '100%', textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '16px' }}><Icon name={pct >= 80 ? 'trophy' : pct >= 50 ? 'medal' : 'nature'} size={56} /></div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: '900',
          background: 'linear-gradient(135deg, #FF6B2B, #fbbf24)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: '6px',
        }}>
          {score}/{total}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
          <Icon name={icon} size={22} /> {title} Complete!
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>
          {msg}
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onBack}
            style={{
              padding: '10px 24px', borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
              color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)',
              fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            ← Back to Games
          </button>
        </div>
      </motion.div>
    </div>
  )
}
