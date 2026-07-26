import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useXP } from '../../hooks/useXP.js'

// All questions with real monument facts
const ALL_QUESTIONS = [
  {
    id: 1,
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg',
    answer: 'Taj Mahal',
    options: ['Taj Mahal', 'Humayun\'s Tomb', 'Itmad-ud-Daulah', 'Bibi Ka Maqbara'],
    hint: 'Built by Shah Jahan for his wife Mumtaz Mahal in Agra.',
    fact: 'The Taj Mahal took 20 years and 20,000 artisans to build (1632–1653 CE).',
  },
  {
    id: 2,
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Qutb_Minar_2009.jpg',
    answer: 'Qutb Minar',
    options: ['Qutb Minar', 'Charminar', 'Jantar Mantar', 'Fatehpur Sikri'],
    hint: 'World\'s tallest brick minaret, located in Delhi.',
    fact: 'At 72.5 metres, the Qutb Minar was begun in 1193 CE and took nearly 200 years to complete.',
  },
  {
    id: 3,
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Hawa_Mahal_Jaipur.jpg',
    answer: 'Hawa Mahal',
    options: ['Hawa Mahal', 'City Palace', 'Amber Fort', 'Umaid Bhawan'],
    hint: 'The "Palace of Winds" in Jaipur has 953 small windows.',
    fact: 'Hawa Mahal was built in 1799 by Maharaja Sawai Pratap Singh so royal ladies could observe street festivals unseen.',
  },
  {
    id: 4,
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Golden_Temple%2C_Amritsar.jpg',
    answer: 'Golden Temple',
    options: ['Golden Temple', 'Akshardham', 'Lotus Temple', 'Somnath Temple'],
    hint: 'The holiest Sikh shrine, located in Amritsar, Punjab.',
    fact: 'The Golden Temple (Harmandir Sahib) feeds over 100,000 people daily for free — the world\'s largest community kitchen.',
  },
  {
    id: 5,
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Charminar_atnight.jpg',
    answer: 'Charminar',
    options: ['Charminar', 'Gateway of India', 'India Gate', 'Mysore Palace'],
    hint: 'A 16th-century mosque and monument with four minarets in Hyderabad.',
    fact: 'Charminar was built in 1591 CE by Muhammad Quli Qutb Shah to commemorate the end of a deadly plague.',
  },
  {
    id: 6,
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg',
    answer: 'Gateway of India',
    options: ['Gateway of India', 'Chhatrapati Shivaji Terminus', 'Flora Fountain', 'Bandra-Worli Sea Link'],
    hint: 'A basalt arch monument in Mumbai built to welcome King George V.',
    fact: 'The Gateway of India was completed in 1924. Paradoxically, it was also the site from which the last British troops left India in 1948.',
  },
  {
    id: 7,
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/61/India_gate_on_a_cloudy_day.jpg',
    answer: 'India Gate',
    options: ['India Gate', 'Victory Tower', 'Buland Darwaza', 'Rashtrapati Bhavan'],
    hint: 'A war memorial on Rajpath, New Delhi, honouring 84,000 Indian soldiers.',
    fact: 'India Gate was designed by Edwin Lutyens and completed in 1931. It bears the names of 13,300 servicemen killed in WWI and the Afghan War.',
  },
  {
    id: 8,
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Hampi_virupaksha_temple.jpg',
    answer: 'Virupaksha Temple, Hampi',
    options: ['Virupaksha Temple, Hampi', 'Brihadeeswarar Temple', 'Meenakshi Temple', 'Kailasa Temple, Ellora'],
    hint: 'A 7th-century Shiva temple in the ruins of Vijayanagara Empire, Karnataka.',
    fact: 'The Virupaksha Temple has been in continuous worship since the 7th century CE and is one of the oldest functioning temples in India.',
  },
]

// Shuffle helper
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const TOTAL_QUESTIONS = 6

export default function GuessMonument({ onBack, onComplete }) {
  const { addXP } = useXP()
  const questions = useMemo(() => {
    return shuffle(ALL_QUESTIONS)
      .slice(0, TOTAL_QUESTIONS)
      .map(q => ({ ...q, options: shuffle([...q.options]) }))
  }, [])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const q = questions[current]

  const handleAnswer = useCallback((option) => {
    if (selected !== null) return
    setSelected(option)
    setShowResult(true)
    const correct = option === q.answer
    if (correct) {
      addXP(20, 'Correct monument!')
      setScore(s => s + 1)
    }
  }, [selected, q, addXP])

  const handleNext = () => {
    if (current + 1 >= TOTAL_QUESTIONS) {
      setFinished(true)
      onComplete(score + (selected === q.answer ? 1 : 0), TOTAL_QUESTIONS)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setShowResult(false)
      setShowHint(false)
    }
  }

  const finalScore = score + (selected === q.answer ? 1 : 0)

  if (finished) {
    return (
      <GameComplete
        title="Guess the Monument"
        score={finalScore}
        total={TOTAL_QUESTIONS}
        onBack={onBack}
        onReplay={() => window.location.reload()}
        emoji="🏛️"
      />
    )
  }

  return (
    <GameShell title="Guess the Monument" emoji="🏛️" onBack={onBack}
      progress={current} total={TOTAL_QUESTIONS} score={score}>
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Monument image */}
          <div style={{
            borderRadius: '14px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            position: 'relative',
          }}>
            <img
              src={q.image}
              alt="Mystery monument — can you guess?"
              style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.src = 'https://placehold.co/600x300/1a1825/FF6B2B?text=Guess+the+Monument' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(15,14,23,0.5) 0%, transparent 50%)',
            }} />
          </div>

          {/* Question prompt */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '1.1rem',
              fontWeight: '700', color: '#fff',
            }}>
              🤔 Which monument is this?
            </div>
          </div>

          {/* Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
          {!showResult && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowHint(true)}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                  cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                💡 Need a hint?
              </button>
              {showHint && (
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
                  💡 {q.hint}
                </motion.div>
              )}
            </div>
          )}

          {/* Result + fact */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '14px 18px',
                background: selected === q.answer ? 'rgba(19,136,8,0.1)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${selected === q.answer ? 'rgba(19,136,8,0.3)' : 'rgba(239,68,68,0.2)'}`,
                borderRadius: '10px',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '0.95rem',
                fontWeight: '700',
                color: selected === q.answer ? '#4ade80' : '#f87171',
                marginBottom: '6px',
              }}>
                {selected === q.answer ? '🎉 Correct! +20 XP' : `😅 The answer was: ${q.answer}`}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                📚 {q.fact}
              </div>
            </motion.div>
          )}

          {showResult && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              style={{
                padding: '12px 28px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #FF6B2B, #f59e0b)',
                color: '#fff', fontFamily: 'var(--font-display)',
                fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
                alignSelf: 'center',
              }}
            >
              {current + 1 >= TOTAL_QUESTIONS ? 'See Results 🏆' : 'Next Monument →'}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </GameShell>
  )
}

/* ── Shared UI helpers ──────────────────────────────────────── */
export function GameShell({ title, emoji, onBack, progress, total, score, children }) {
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
            {emoji} {title}
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

export function GameComplete({ title, score, total, onBack, onReplay, emoji }) {
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
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{pct >= 80 ? '🏆' : pct >= 50 ? '🎖️' : '🌱'}</div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: '900',
          background: 'linear-gradient(135deg, #FF6B2B, #fbbf24)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: '6px',
        }}>
          {score}/{total}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
          {emoji} {title} Complete!
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
