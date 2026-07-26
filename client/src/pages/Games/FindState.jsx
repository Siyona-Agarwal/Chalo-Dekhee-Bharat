import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useXP } from '../../hooks/useXP.js'
import indiaMapData from '../../data/indiaMapData.js'
import { GameShell, GameComplete } from './GuessMonument.jsx'

const QUIZ_STATES = ['rj', 'kl', 'wb', 'gj', 'ka', 'mh', 'tn', 'up', 'pb', 'as']
const TOTAL_ROUNDS = 8

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function FindState({ onBack, onComplete }) {
  const { addXP } = useXP()

  const rounds = useMemo(() => {
    const pool = indiaMapData.locations.filter(l => QUIZ_STATES.includes(l.id))
    return shuffle(pool).map(l => ({ id: l.id, label: l.name })).slice(0, TOTAL_ROUNDS)
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
            width: '100%', maxWidth: '400px', height: 'auto',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', overflow: 'hidden', padding: '10px'
          }}>
            <svg 
              viewBox={indiaMapData.viewBox} 
              style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.3))' }}
            >
              {indiaMapData.locations.map((loc) => {
                const isTarget = loc.id === target.id;
                const isClicked = clicked === loc.id;
                const isCorrect = isClicked && isTarget;
                const isWrong = isClicked && !isTarget;
                
                let fill = 'rgba(255,255,255,0.15)'; // base state color
                let stroke = 'rgba(255,255,255,0.3)'; // base border

                // Show correct/wrong after click
                if (clicked) {
                  if (isTarget) {
                    fill = '#4ade80'; // Target lights up green
                    stroke = '#22c55e';
                  } else if (isWrong) {
                    fill = '#f87171'; // Wrong click lights up red
                    stroke = '#ef4444';
                  } else {
                    fill = 'rgba(255,255,255,0.05)'; // Fade out others
                    stroke = 'rgba(255,255,255,0.1)';
                  }
                }

                return (
                  <motion.path
                    key={loc.id}
                    d={loc.path}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    onClick={() => handleClick(loc.id)}
                    whileHover={!clicked ? { fill: 'rgba(167,139,250,0.8)', stroke: '#fff', cursor: 'pointer' } : {}}
                    whileTap={!clicked ? { scale: 0.98 } : {}}
                    style={{
                      transition: 'fill 0.2s, stroke 0.2s',
                      outline: 'none',
                    }}
                  />
                )
              })}
            </svg>
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
