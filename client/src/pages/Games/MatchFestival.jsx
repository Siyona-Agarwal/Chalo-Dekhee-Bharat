import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useXP } from '../../hooks/useXP.js'
import festivalsData from '../../data/festivals.json'
import statesData from '../../data/states.json'
import { GameShell, GameComplete } from './GuessMonument.jsx'

// Build a clean pairing set: {festival, state} — pick 6 pairs
const PAIR_COUNT = 6

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MatchFestival({ onBack, onComplete }) {
  const { addXP } = useXP()

  // Pick PAIR_COUNT festival-state pairs with UNIQUE states
  const pairs = useMemo(() => {
    const shuffled = shuffle(festivalsData)
    const uniquePairs = []
    const usedStates = new Set()
    for (const f of shuffled) {
      if (!usedStates.has(f.state)) {
        uniquePairs.push({
          festivalId: f.id,
          festivalName: f.name,
          stateId: f.state,
          stateLabel: f.stateLabel,
        })
        usedStates.add(f.state)
        if (uniquePairs.length === PAIR_COUNT) break
      }
    }
    return uniquePairs
  }, [])

  // Build left (festivals) and right (states) columns
  const leftItems = useMemo(() => shuffle(pairs.map(p => ({ id: p.festivalId, label: p.festivalName, type: 'festival' }))), [pairs])
  const rightItems = useMemo(() => shuffle(pairs.map(p => ({ id: p.stateId, label: p.stateLabel, type: 'state' }))), [pairs])

  const [selectedLeft, setSelectedLeft] = useState(null)   // festival id
  const [selectedRight, setSelectedRight] = useState(null) // state id
  const [matched, setMatched] = useState(new Set())         // festivalIds that are correctly matched
  const [wrongPair, setWrongPair] = useState(null)          // {left, right} that flashed wrong
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)

  const handleLeft = useCallback((id) => {
    if (matched.has(id)) return
    setSelectedLeft(id)
    setSelectedRight(null)
    setWrongPair(null)
  }, [matched])

  const handleRight = useCallback((stateId) => {
    if (!selectedLeft) return
    // Find the pair for selectedLeft
    const pair = pairs.find(p => p.festivalId === selectedLeft)
    if (!pair) return

    if (pair.stateId === stateId) {
      // Correct!
      addXP(15, `Matched: ${pair.festivalName}`)
      setScore(s => s + 1)
      const newMatched = new Set([...matched, selectedLeft])
      setMatched(newMatched)
      setSelectedLeft(null)
      setSelectedRight(null)

      if (newMatched.size >= PAIR_COUNT) {
        setTimeout(() => {
          setFinished(true)
          onComplete(PAIR_COUNT, PAIR_COUNT)
        }, 600)
      }
    } else {
      // Wrong!
      setWrongPair({ left: selectedLeft, right: stateId })
      setSelectedLeft(null)
      setSelectedRight(null)
      setTimeout(() => setWrongPair(null), 800)
    }
  }, [selectedLeft, pairs, matched, addXP, onComplete])

  const getLeftBg = (id) => {
    if (matched.has(id)) return { bg: 'rgba(19,136,8,0.15)', border: 'rgba(19,136,8,0.4)', color: '#4ade80' }
    if (wrongPair?.left === id) return { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', color: '#f87171' }
    if (selectedLeft === id) return { bg: 'rgba(244,114,182,0.15)', border: 'rgba(244,114,182,0.5)', color: '#f472b6' }
    return { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }
  }

  const getRightBg = (id) => {
    // Find if any matched pair maps to this state
    const isMatched = [...matched].some(festId => {
      const p = pairs.find(pp => pp.festivalId === festId)
      return p?.stateId === id
    })
    if (isMatched) return { bg: 'rgba(19,136,8,0.15)', border: 'rgba(19,136,8,0.4)', color: '#4ade80' }
    if (wrongPair?.right === id) return { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', color: '#f87171' }
    if (selectedRight === id) return { bg: 'rgba(244,114,182,0.15)', border: 'rgba(244,114,182,0.5)', color: '#f472b6' }
    return { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }
  }

  if (finished) {
    return <GameComplete title="Match Festivals" score={score} total={PAIR_COUNT} onBack={onBack} onReplay={() => window.location.reload()} emoji="🎊" />
  }

  return (
    <GameShell title="Match Festivals to States" emoji="🎊" onBack={onBack}
      progress={matched.size} total={PAIR_COUNT} score={matched.size}>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.87rem',
          color: 'rgba(255,255,255,0.5)', margin: 0,
        }}>
          Click a <span style={{ color: '#f472b6', fontWeight: '600' }}>festival</span> on the left,
          then its <span style={{ color: '#a78bfa', fontWeight: '600' }}>matching state</span> on the right.
        </p>
      </div>

      {selectedLeft && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '16px', textAlign: 'center',
            padding: '8px 16px', borderRadius: '8px',
            background: 'rgba(244,114,182,0.1)',
            border: '1px solid rgba(244,114,182,0.25)',
            fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#f472b6',
          }}
        >
          🎊 {pairs.find(p => p.festivalId === selectedLeft)?.festivalName} → now click its state!
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Left: Festivals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#f472b6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px', textAlign: 'center' }}>
            🎊 Festivals
          </div>
          {leftItems.map(item => {
            const { bg, border, color } = getLeftBg(item.id)
            const isMatched = matched.has(item.id)
            return (
              <motion.button
                key={item.id}
                whileHover={!isMatched ? { scale: 1.02 } : {}}
                whileTap={!isMatched ? { scale: 0.97 } : {}}
                onClick={() => !isMatched && handleLeft(item.id)}
                animate={{ x: wrongPair?.left === item.id ? [-4, 4, -4, 0] : 0 }}
                transition={{ duration: 0.3 }}
                aria-pressed={selectedLeft === item.id}
                aria-label={`Festival: ${item.label}`}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: `1px solid ${border}`,
                  background: bg, color,
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem', fontWeight: '500',
                  cursor: isMatched ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  lineHeight: 1.3,
                }}
              >
                {isMatched && '✓ '}{item.label}
              </motion.button>
            )
          })}
        </div>

        {/* Right: States */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px', textAlign: 'center' }}>
            🗺️ States
          </div>
          {rightItems.map(item => {
            const isMatchedRight = [...matched].some(festId => {
              const p = pairs.find(pp => pp.festivalId === festId)
              return p?.stateId === item.id
            })
            const { bg, border, color } = getRightBg(item.id)
            return (
              <motion.button
                key={item.id}
                whileHover={!isMatchedRight && selectedLeft ? { scale: 1.02 } : {}}
                whileTap={!isMatchedRight && selectedLeft ? { scale: 0.97 } : {}}
                onClick={() => !isMatchedRight && selectedLeft && handleRight(item.id)}
                animate={{ x: wrongPair?.right === item.id ? [-4, 4, -4, 0] : 0 }}
                transition={{ duration: 0.3 }}
                aria-label={`State: ${item.label}`}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: `1px solid ${border}`,
                  background: bg, color,
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem', fontWeight: '500',
                  cursor: isMatchedRight || !selectedLeft ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  lineHeight: 1.3,
                  opacity: !selectedLeft && !isMatchedRight ? 0.6 : 1,
                }}
              >
                {isMatchedRight && '✓ '}{item.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Progress */}
      <div style={{
        marginTop: '20px', textAlign: 'center',
        fontFamily: 'var(--font-body)', fontSize: '0.82rem',
        color: 'rgba(255,255,255,0.4)',
      }}>
        {matched.size}/{PAIR_COUNT} pairs matched
        {matched.size === PAIR_COUNT && <span style={{ color: '#4ade80', marginLeft: '8px' }}>🎉 All matched!</span>}
      </div>
    </GameShell>
  )
}
