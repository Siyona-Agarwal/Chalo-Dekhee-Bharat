import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useXP } from '../../hooks/useXP.js'
import festivalsData from '../../data/festivals.json'
import { GameShell, GameComplete } from './GuessMonument.jsx'

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

  const [difficulty, setDifficulty] = useState(null)
  
  const PAIR_COUNT = difficulty === 'hard' ? 8 : difficulty === 'medium' ? 6 : 4;

  const pairs = useMemo(() => {
    if (!difficulty) return []
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
  }, [difficulty, PAIR_COUNT])

  const leftItems = useMemo(() => shuffle(pairs.map(p => ({ id: p.festivalId, label: p.festivalName, type: 'festival' }))), [pairs])
  const rightItems = useMemo(() => shuffle(pairs.map(p => ({ id: p.stateId, label: p.stateLabel, type: 'state' }))), [pairs])

  const [selectedLeft, setSelectedLeft] = useState(null)   
  const [selectedRight, setSelectedRight] = useState(null) 
  const [matched, setMatched] = useState(new Set())         
  const [wrongPair, setWrongPair] = useState(null)          
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)

  // Timer logic for Hard mode
  const [timeLeft, setTimeLeft] = useState(45)

  useEffect(() => {
    if (difficulty === 'hard' && !finished && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timerId)
    } else if (difficulty === 'hard' && timeLeft === 0 && !finished) {
      // Time up!
      setFinished(true)
      onComplete(score, PAIR_COUNT, difficulty)
    }
  }, [difficulty, finished, timeLeft, onComplete, score, PAIR_COUNT])

  const handleLeft = useCallback((id) => {
    if (matched.has(id)) return
    setSelectedLeft(id)
    setSelectedRight(null)
    setWrongPair(null)
  }, [matched])

  const handleRight = useCallback((stateId) => {
    if (!selectedLeft) return
    const pair = pairs.find(p => p.festivalId === selectedLeft)
    if (!pair) return

    if (pair.stateId === stateId) {
      addXP(15, `Matched: ${pair.festivalName}`)
      setScore(s => s + 1)
      const newMatched = new Set([...matched, selectedLeft])
      setMatched(newMatched)
      setSelectedLeft(null)
      setSelectedRight(null)

      if (newMatched.size >= PAIR_COUNT) {
        setTimeout(() => {
          setFinished(true)
          onComplete(PAIR_COUNT, PAIR_COUNT, difficulty)
        }, 600)
      }
    } else {
      setWrongPair({ left: selectedLeft, right: stateId })
      setSelectedLeft(null)
      setSelectedRight(null)
      setTimeout(() => setWrongPair(null), 800)
    }
  }, [selectedLeft, pairs, matched, addXP, onComplete, difficulty, PAIR_COUNT])

  const getLeftBg = (id) => {
    if (matched.has(id)) return { bg: 'rgba(19,136,8,0.15)', border: 'rgba(19,136,8,0.4)', color: '#4ade80' }
    if (wrongPair?.left === id) return { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', color: '#f87171' }
    if (selectedLeft === id) return { bg: 'rgba(244,114,182,0.15)', border: 'rgba(244,114,182,0.5)', color: '#f472b6' }
    return { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }
  }

  const getRightBg = (id) => {
    const isMatched = [...matched].some(festId => {
      const p = pairs.find(pp => pp.festivalId === festId)
      return p?.stateId === id
    })
    if (isMatched) return { bg: 'rgba(19,136,8,0.15)', border: 'rgba(19,136,8,0.4)', color: '#4ade80' }
    if (wrongPair?.right === id) return { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', color: '#f87171' }
    if (selectedRight === id) return { bg: 'rgba(244,114,182,0.15)', border: 'rgba(244,114,182,0.5)', color: '#f472b6' }
    return { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }
  }

  if (!difficulty) {
    return (
      <GameShell title="Utsav Sangam" icon="celebration" onBack={onBack} progress={0} total={6} score={0}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '20px 0' }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', marginBottom: '10px' }}>Select Difficulty</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>Link the vibrant festivals of India to their home states.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px', margin: '0 auto' }}>
            <DifficultyButton
              title="Easy: Casual"
              desc="Match 4 pairs. No rush."
              onClick={() => setDifficulty('easy')}
              color="#a78bfa"
            />
            <DifficultyButton
              title="Medium: Standard"
              desc="Match 6 pairs. Take your time."
              onClick={() => setDifficulty('medium')}
              color="#38bdf8"
            />
            <DifficultyButton
              title="Hard: Expert"
              desc="Match 8 pairs within 45 seconds!"
              onClick={() => {
                setDifficulty('hard')
                setTimeLeft(45)
              }}
              color="#f472b6"
            />
          </div>
        </motion.div>
      </GameShell>
    )
  }

  if (finished) {
    return <GameComplete title="Utsav Sangam" score={score} total={PAIR_COUNT} onBack={onBack} onReplay={() => {
      setDifficulty(null)
      setFinished(false)
      setScore(0)
      setMatched(new Set())
      setSelectedLeft(null)
      setSelectedRight(null)
      setTimeLeft(45)
    }} icon="celebration" />
  }

  return (
    <GameShell title="Utsav Sangam" icon="celebration" onBack={onBack}
      progress={matched.size} total={PAIR_COUNT} score={matched.size}>

      {difficulty === 'hard' && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: timeLeft <= 10 ? 'rgba(239,68,68,0.2)' : 'rgba(244,114,182,0.1)',
            border: `1px solid ${timeLeft <= 10 ? '#ef4444' : 'rgba(244,114,182,0.3)'}`,
            borderRadius: '20px',
            color: timeLeft <= 10 ? '#f87171' : '#f472b6',
            fontFamily: 'var(--font-display)',
            fontWeight: '700',
            fontSize: '1.2rem',
            animation: timeLeft <= 10 ? 'pulse 1s infinite' : 'none'
          }}>
            {timeLeft}s
          </div>
          <style>{`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.5; }
              100% { opacity: 1; }
            }
          `}</style>
        </div>
      )}

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
          {pairs.find(p => p.festivalId === selectedLeft)?.festivalName} → now click its state!
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Left Col (Festivals) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {leftItems.map((item) => {
            const st = getLeftBg(item.id)
            return (
              <motion.button
                key={`left-${item.id}`}
                whileHover={!matched.has(item.id) ? { scale: 1.02 } : {}}
                whileTap={!matched.has(item.id) ? { scale: 0.98 } : {}}
                onClick={() => handleLeft(item.id)}
                style={{
                  padding: '14px 16px',
                  background: st.bg, border: `1px solid ${st.border}`, color: st.color,
                  borderRadius: '10px', textAlign: 'left',
                  fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: '500',
                  cursor: matched.has(item.id) ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                {item.label}
                {matched.has(item.id) && <span>✓</span>}
              </motion.button>
            )
          })}
        </div>

        {/* Right Col (States) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rightItems.map((item) => {
            const st = getRightBg(item.id)
            const isMatched = st.color === '#4ade80' // dirty check based on color logic above
            return (
              <motion.button
                key={`right-${item.id}`}
                whileHover={!isMatched ? { scale: 1.02 } : {}}
                whileTap={!isMatched ? { scale: 0.98 } : {}}
                onClick={() => handleRight(item.id)}
                style={{
                  padding: '14px 16px',
                  background: st.bg, border: `1px solid ${st.border}`, color: st.color,
                  borderRadius: '10px', textAlign: 'left',
                  fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: '500',
                  cursor: isMatched ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                {item.label}
                {isMatched && <span>✓</span>}
              </motion.button>
            )
          })}
        </div>
      </div>
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
