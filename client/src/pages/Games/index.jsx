import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { usePassport } from '../../context/PassportContext.jsx'
import { useXP } from '../../hooks/useXP.js'
import badges from '../../data/badges.json'
import GuessMonument from './GuessMonument.jsx'
import FindState from './FindState.jsx'
import MatchFestival from './MatchFestival.jsx'

const GAMES = [
  {
    id: 'guess-monument',
    title: 'Guess the Monument',
    emoji: '🏛️',
    description: 'An image appears — can you name the monument? Multiple-choice, 3 chances.',
    color: '#FF6B2B',
    gradient: 'linear-gradient(135deg, rgba(255,107,43,0.15), rgba(245,158,11,0.06))',
    border: 'rgba(255,107,43,0.3)',
    xpPerCorrect: 20,
    badgeId: 'badge-006',
  },
  {
    id: 'find-state',
    title: 'Find the State',
    emoji: '🗺️',
    description: 'A state name appears — click the correct region on India\'s map. 10 rounds.',
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(56,189,248,0.06))',
    border: 'rgba(167,139,250,0.3)',
    xpPerCorrect: 15,
    badgeId: 'badge-007',
  },
  {
    id: 'match-festival',
    title: 'Match Festivals to States',
    emoji: '🎊',
    description: 'Click a festival then its matching state to pair them all. Quick and colourful!',
    color: '#f472b6',
    gradient: 'linear-gradient(135deg, rgba(244,114,182,0.15), rgba(251,191,36,0.06))',
    border: 'rgba(244,114,182,0.3)',
    xpPerCorrect: 15,
    badgeId: 'badge-008',
  },
]

export default function Games() {
  const [activeGame, setActiveGame] = useState(null)
  const { passport, addBadge } = usePassport()
  const { addXP } = useXP()
  const navigate = useNavigate()

  const earnedBadgeIds = new Set(passport.badges.map(b => b.id))

  const handleGameComplete = (gameId, score, total) => {
    const game = GAMES.find(g => g.id === gameId)
    if (!game) return

    // Award completion badge if not already earned
    if (game.badgeId && !earnedBadgeIds.has(game.badgeId)) {
      const badge = badges.find(b => b.id === game.badgeId)
      if (badge) {
        addBadge(badge)
        addXP(badge.xpReward, `Badge: ${badge.name}`)
      }
    }
  }

  if (activeGame === 'guess-monument') {
    return <GuessMonument onBack={() => setActiveGame(null)} onComplete={(s, t) => handleGameComplete('guess-monument', s, t)} />
  }
  if (activeGame === 'find-state') {
    return <FindState onBack={() => setActiveGame(null)} onComplete={(s, t) => handleGameComplete('find-state', s, t)} />
  }
  if (activeGame === 'match-festival') {
    return <MatchFestival onBack={() => setActiveGame(null)} onComplete={(s, t) => handleGameComplete('match-festival', s, t)} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-deep-900)' }}>
      {/* Hero */}
      <div style={{
        position: 'relative', padding: '72px 24px 56px', textAlign: 'center', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 30% 50%, rgba(167,139,250,0.10) 0%, transparent 55%), radial-gradient(ellipse at 70% 30%, rgba(244,114,182,0.08) 0%, transparent 50%)',
        }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🎮</span>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 4vw, 2.8rem)',
            fontWeight: '900', color: '#fff', margin: '0 0 12px',
          }}>
            Explorer Mini-Games
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)', maxWidth: '460px',
            margin: '0 auto 16px', lineHeight: 1.7,
          }}>
            Test your knowledge of India's monuments, states, and festivals.
            Earn <span style={{ color: '#fbbf24', fontWeight: '600' }}>XP</span> for every correct answer
            and unlock <span style={{ color: '#fbbf24', fontWeight: '600' }}>badges</span> on completion.
          </p>
        </motion.div>
      </div>

      {/* Game cards */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {GAMES.map((game, i) => {
            const badgeEarned = earnedBadgeIds.has(game.badgeId)
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ x: 6 }}
                onClick={() => setActiveGame(game.id)}
                role="button"
                tabIndex={0}
                aria-label={`Play ${game.title}`}
                onKeyDown={(e) => e.key === 'Enter' && setActiveGame(game.id)}
                style={{
                  background: game.gradient,
                  border: `1px solid ${game.border}`,
                  borderRadius: '18px',
                  padding: '28px 32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  fontSize: '2.8rem', flexShrink: 0,
                  width: '64px', height: '64px',
                  background: `${game.color}22`,
                  border: `1px solid ${game.border}`,
                  borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {game.emoji}
                </div>

                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontFamily: 'var(--font-display)', fontSize: '1.2rem',
                    fontWeight: '800', color: '#fff', margin: '0 0 6px',
                  }}>
                    {game.title}
                    {badgeEarned && <span style={{ marginLeft: '8px', fontSize: '0.9rem' }}>🏅</span>}
                  </h2>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.87rem',
                    color: 'rgba(255,255,255,0.55)', margin: '0 0 12px', lineHeight: 1.6,
                  }}>
                    {game.description}
                  </p>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                    color: game.color, fontWeight: '600',
                  }}>
                    +{game.xpPerCorrect} XP per correct answer · Badge on completion
                  </div>
                </div>

                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.2rem',
                  color: game.color, flexShrink: 0,
                }}>
                  →
                </div>

                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: '2px', background: `linear-gradient(90deg, ${game.color}, transparent)`,
                }} />
              </motion.div>
            )
          })}
        </div>

        {/* Quick stats */}
        {passport.badges.some(b => ['badge-006','badge-007','badge-008'].includes(b.id)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              marginTop: '32px',
              background: 'rgba(251,191,36,0.06)',
              border: '1px solid rgba(251,191,36,0.15)',
              borderRadius: '14px', padding: '20px 24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🏅</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: '700', color: '#fbbf24' }}>
              {passport.badges.filter(b => ['badge-006','badge-007','badge-008'].includes(b.id)).length}/3 Game Badges Earned
            </div>
            <button
              onClick={() => navigate('/passport')}
              style={{
                marginTop: '10px', padding: '6px 16px', borderRadius: '8px',
                border: '1px solid rgba(251,191,36,0.3)', background: 'transparent',
                color: '#fbbf24', fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              View in Passport →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
