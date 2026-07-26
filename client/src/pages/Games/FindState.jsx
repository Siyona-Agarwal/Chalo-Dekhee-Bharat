import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useXP } from '../../hooks/useXP.js'
import indiaMapData from '../../data/indiaMapData.js'
import statesData from '../../data/states.json'
import { GameShell, GameComplete } from './GuessMonument.jsx'

const TOTAL_ROUNDS = 8

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Map the states data by lowercased svgPathId to match map data
const statesMap = {}
statesData.forEach(s => {
  if (s.svgPathId && s.id !== 'delhi') { // Exclude Delhi to strictly keep 28 states
    statesMap[s.svgPathId.toLowerCase()] = s
  }
})

export default function FindState({ onBack, onComplete }) {
  const { addXP } = useXP()

  const [difficulty, setDifficulty] = useState(null)
  const [current, setCurrent] = useState(0)
  const [clicked, setClicked] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const rounds = useMemo(() => {
    if (!difficulty) return []

    // Only include the 28 states
    const pool = indiaMapData.locations.filter(l => statesMap[l.id])
    
    // Pick 8 random target states
    const shuffledPool = shuffle(pool)
    const targets = shuffledPool.slice(0, TOTAL_ROUNDS)

    return targets.map(l => {
      const stateInfo = statesMap[l.id]
      const roundData = {
        id: l.id,
        label: l.name,
        capital: stateInfo.capital
      }

      // If Easy difficulty, generate 2 wrong hints
      if (difficulty === 'easy') {
        const others = shuffledPool.filter(s => s.id !== l.id)
        const wrongHints = shuffle(others).slice(0, 2).map(s => s.id)
        roundData.hints = [l.id, ...wrongHints]
      }

      return roundData
    })
  }, [difficulty])

  const handleClick = useCallback((stateId) => {
    if (clicked || !difficulty) return
    const target = rounds[current]
    
    // In easy mode, ignore clicks on non-hint states
    if (difficulty === 'easy' && !target.hints.includes(stateId)) return

    setClicked(stateId)
    const correct = stateId === target.id
    if (correct) {
      addXP(15, `Found ${target.label}!`)
      setScore(s => s + 1)
    }
    setTimeout(() => {
      if (current + 1 >= TOTAL_ROUNDS) {
        setFinished(true)
        onComplete(score + (correct ? 1 : 0), TOTAL_ROUNDS, difficulty)
      } else {
        setCurrent(c => c + 1)
        setClicked(null)
      }
    }, 1500)
  }, [clicked, difficulty, rounds, current, score, addXP, onComplete])

  if (!difficulty) {
    return (
      <GameShell title="Find the State" emoji="🗺️" onBack={onBack} progress={0} total={TOTAL_ROUNDS} score={0}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '20px 0' }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', marginBottom: '10px' }}>Select Difficulty</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>Choose your challenge level to begin mapping India.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px', margin: '0 auto' }}>
            <DifficultyButton
              title="Easy: Guided Tour"
              desc="3 highlighted options per round."
              onClick={() => setDifficulty('easy')}
              color="#a78bfa"
            />
            <DifficultyButton
              title="Medium: Standard"
              desc="Blank map, search by state name."
              onClick={() => setDifficulty('medium')}
              color="#38bdf8"
            />
            <DifficultyButton
              title="Hard: Capital Challenge"
              desc="Blank map, search by capital city!"
              onClick={() => setDifficulty('hard')}
              color="#f472b6"
            />
          </div>
        </motion.div>
      </GameShell>
    )
  }

  if (finished) {
    return <GameComplete title="Find the State" score={score} total={TOTAL_ROUNDS} onBack={onBack} onReplay={() => {
      setDifficulty(null)
      setFinished(false)
      setCurrent(0)
      setScore(0)
      setClicked(null)
    }} emoji="🗺️" />
  }

  const target = rounds[current]

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
              {difficulty === 'hard' ? 'Find the state whose capital is:' : 'Find this state on the map:'}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '800', color: '#a78bfa' }}>
              {difficulty === 'hard' ? target.capital : target.label}
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
                
                const isHint = difficulty === 'easy' && target.hints.includes(loc.id)

                let fill = 'rgba(255,255,255,0.08)'; // base state color
                let stroke = 'rgba(255,255,255,0.15)'; // base border

                if (difficulty === 'easy') {
                  if (isHint) {
                    fill = 'rgba(255,255,255,0.25)'
                    stroke = 'rgba(255,255,255,0.5)'
                  } else {
                    fill = 'rgba(255,255,255,0.02)'
                    stroke = 'rgba(255,255,255,0.05)'
                  }
                } else {
                  // Make standard base a bit more visible
                  fill = 'rgba(255,255,255,0.15)';
                  stroke = 'rgba(255,255,255,0.3)';
                }

                // Show correct/wrong after click
                if (clicked) {
                  if (isTarget) {
                    fill = '#4ade80'; // Target lights up green
                    stroke = '#22c55e';
                  } else if (isWrong) {
                    fill = '#f87171'; // Wrong click lights up red
                    stroke = '#ef4444';
                  } else {
                    fill = 'rgba(255,255,255,0.02)'; // Fade out others heavily
                    stroke = 'rgba(255,255,255,0.05)';
                  }
                }

                const canHover = !clicked && (difficulty !== 'easy' || isHint);

                return (
                  <motion.path
                    key={loc.id}
                    d={loc.path}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    onClick={() => handleClick(loc.id)}
                    whileHover={canHover ? { fill: 'rgba(167,139,250,0.8)', stroke: '#fff', cursor: 'pointer' } : {}}
                    whileTap={canHover ? { scale: 0.98 } : {}}
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
                : difficulty === 'hard' 
                  ? `😅 Oops! ${target.capital} is the capital of ${target.label}. The correct state is in green.`
                  : `😅 Oops! The correct location is marked in green.`}
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
