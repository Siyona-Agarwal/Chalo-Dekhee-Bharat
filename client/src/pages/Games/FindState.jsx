import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useXP } from '../../hooks/useXP.js'
import statesData from '../../data/states.json'
import { GameShell, GameComplete } from './GuessMonument.jsx'

const QUIZ_STATES = [
  'rajasthan', 'kerala', 'west-bengal', 'gujarat', 'karnataka',
  'maharashtra', 'tamil-nadu', 'uttar-pradesh', 'punjab', 'assam',
]

// Approximate coordinates on a 400x450 scale based on a standard India map
const STATE_COORDS = [
  { id: 'jammu-kashmir',    label: 'J&K',    cx: 155, cy: 55  },
  { id: 'himachal-pradesh', label: 'HP',     cx: 184, cy: 65  },
  { id: 'punjab',           label: 'PB',     cx: 168, cy: 85  },
  { id: 'uttarakhand',      label: 'UK',     cx: 208, cy: 85  },
  { id: 'haryana',          label: 'HR',     cx: 184, cy: 100 },
  { id: 'delhi',            label: 'DL',     cx: 195, cy: 105 },
  { id: 'rajasthan',        label: 'RJ',     cx: 142, cy: 135 },
  { id: 'uttar-pradesh',    label: 'UP',     cx: 227, cy: 125 },
  { id: 'bihar',            label: 'BR',     cx: 285, cy: 125 },
  { id: 'sikkim',           label: 'SK',     cx: 317, cy: 95  },
  { id: 'arunachal-pradesh',label: 'AR',     cx: 373, cy: 87  },
  { id: 'nagaland',         label: 'NL',     cx: 380, cy: 105 },
  { id: 'manipur',          label: 'MN',     cx: 380, cy: 125 },
  { id: 'mizoram',          label: 'MZ',     cx: 368, cy: 140 },
  { id: 'tripura',          label: 'TR',     cx: 350, cy: 140 },
  { id: 'meghalaya',        label: 'ML',     cx: 338, cy: 115 },
  { id: 'assam',            label: 'AS',     cx: 348, cy: 105 },
  { id: 'west-bengal',      label: 'WB',     cx: 317, cy: 152 },
  { id: 'jharkhand',        label: 'JH',     cx: 288, cy: 155 },
  { id: 'odisha',           label: 'OD',     cx: 290, cy: 192 },
  { id: 'chhattisgarh',     label: 'CG',     cx: 250, cy: 186 },
  { id: 'madhya-pradesh',   label: 'MP',     cx: 200, cy: 168 },
  { id: 'gujarat',          label: 'GJ',     cx: 102, cy: 170 },
  { id: 'maharashtra',      label: 'MH',     cx: 173, cy: 218 },
  { id: 'goa',              label: 'GA',     cx: 145, cy: 268 },
  { id: 'karnataka',        label: 'KA',     cx: 172, cy: 290 },
  { id: 'telangana',        label: 'TG',     cx: 220, cy: 232 },
  { id: 'andhra-pradesh',   label: 'AP',     cx: 235, cy: 273 },
  { id: 'tamil-nadu',       label: 'TN',     cx: 218, cy: 343 },
  { id: 'kerala',           label: 'KL',     cx: 177, cy: 350 },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const TOTAL_ROUNDS = 8

export default function FindState({ onBack, onComplete }) {
  const { addXP } = useXP()

  const rounds = useMemo(() => {
    const pool = statesData.filter(s => QUIZ_STATES.includes(s.id))
    return shuffle(pool).slice(0, TOTAL_ROUNDS)
  }, [])

  const [current, setCurrent] = useState(0)
  const [clicked, setClicked] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const target = rounds[current]

  const handleClick = useCallback((stateId) => {
    if (clicked) return
    setClicked(stateId)
    const correct = stateId === target.id
    if (correct) {
      addXP(15, `Found ${target.label}!`)
      setScore(s => s + 1)
    }
    setTimeout(() => {
      if (current + 1 >= TOTAL_ROUNDS) {
        setFinished(true)
        onComplete(score + (correct ? 1 : 0), TOTAL_ROUNDS)
      } else {
        setCurrent(c => c + 1)
        setClicked(null)
      }
    }, 1500)
  }, [clicked, target, current, score, addXP, onComplete])

  if (finished) {
    return <GameComplete title="Find the State" score={score} total={TOTAL_ROUNDS} onBack={onBack} onReplay={() => window.location.reload()} emoji="🗺️" />
  }

  return (
    <GameShell title="Find the State" emoji="🗺️" onBack={onBack} progress={current} total={TOTAL_ROUNDS} score={score}>
      <AnimatePresence mode="wait">
        <motion.div
          key={target.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}
        >
          {/* Prompt */}
          <div style={{
            textAlign: 'center',
            background: 'rgba(167,139,250,0.1)',
            border: '1px solid rgba(167,139,250,0.25)',
            borderRadius: '14px', padding: '18px 24px',
            width: '100%',
          }}>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Find this state on the map:
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '800', color: '#a78bfa' }}>
              {target.label}
            </div>
          </div>

          {/* Map Area */}
          <div style={{
            position: 'relative', width: '100%', maxWidth: '400px', height: '450px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', overflow: 'hidden'
          }}>
            {/* Base Map Image - A minimalist blank map of India */}
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/d/dc/India_location_map.svg" 
              alt="Map of India"
              style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.6 }} 
              draggable={false}
            />

            {/* Clickable Overlay Pins */}
            {STATE_COORDS.map((state) => {
              const isTarget = state.id === target.id;
              const isClicked = clicked === state.id;
              const isCorrect = isClicked && isTarget;
              const isWrong = isClicked && !isTarget;
              
              let bg = 'rgba(255,255,255,0.15)';
              let borderColor = 'rgba(255,255,255,0.3)';
              
              if (clicked) {
                if (isTarget) {
                  bg = '#4ade80';
                  borderColor = '#fff';
                } else if (isWrong) {
                  bg = '#f87171';
                  borderColor = '#fff';
                } else {
                  bg = 'transparent';
                  borderColor = 'transparent';
                }
              }

              return (
                <motion.button
                  key={state.id}
                  onClick={() => handleClick(state.id)}
                  disabled={clicked !== null}
                  whileHover={!clicked ? { scale: 1.5, background: 'rgba(167,139,250,0.8)' } : {}}
                  whileTap={!clicked ? { scale: 0.9 } : {}}
                  title={state.label}
                  style={{
                    position: 'absolute',
                    left: `${(state.cx / 400) * 100}%`,
                    top: `${(state.cy / 450) * 100}%`,
                    width: '16px', height: '16px',
                    marginLeft: '-8px', marginTop: '-8px', // Center the dot
                    borderRadius: '50%',
                    background: bg,
                    border: `2px solid ${borderColor}`,
                    cursor: clicked ? 'default' : 'pointer',
                    outline: 'none',
                    padding: 0,
                    transition: 'all 0.2s',
                    zIndex: isTarget && clicked ? 10 : 1,
                  }}
                />
              )
            })}
          </div>

          {/* Feedback */}
          {clicked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                padding: '12px 20px',
                background: clicked === target.id ? 'rgba(19,136,8,0.1)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${clicked === target.id ? 'rgba(19,136,8,0.3)' : 'rgba(239,68,68,0.2)'}`,
                borderRadius: '10px', textAlign: 'center',
                fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: '700',
                color: clicked === target.id ? '#4ade80' : '#f87171',
                width: '100%',
              }}
            >
              {clicked === target.id
                ? `🎯 Correct! +15 XP`
                : `😅 Oops! The correct location is marked in green.`}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </GameShell>
  )
}
