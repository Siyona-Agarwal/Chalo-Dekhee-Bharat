import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { usePassport } from '../../context/PassportContext.jsx'
import { useXP } from '../../hooks/useXP.js'
import badges from '../../data/badges.json'
import GuessMonument from './GuessMonument.jsx'
import FindState from './FindState.jsx'
import MatchFestival from './MatchFestival.jsx'
import Icon from '../../components/Icon.jsx'

const GAMES = [
  { id: 'guess-monument', title: 'Smarak Pehchan', icon: 'museum', description: 'Identify an Indian monument from the image and clues.', color: '#ff6b2b', image: '/games/monument-1.jpg', badgeId: 'badge-006-hard', xpPerCorrect: 20 },
  { id: 'find-state', title: 'Pradesh Khoj', icon: 'map', description: 'Locate the named state on India’s map.', color: '#a78bfa', image: '/images/games/pradesh-khoj-bg.png', badgeId: 'badge-007-hard', xpPerCorrect: 15 },
  { id: 'match-festival', title: 'Utsav Sangam', icon: 'celebration', description: 'Match Indian festivals to their home states.', color: '#f472b6', image: '/images/games/utsav-sangam-bg.png', badgeId: 'badge-008-hard', xpPerCorrect: 15 },
]

export default function Games() {
  const [activeGame, setActiveGame] = useState(null)
  const { passport, addBadge } = usePassport()
  const { addXP } = useXP()
  const navigate = useNavigate()
  const earnedBadgeIds = new Set(passport.badges.map(b => b.id))

  const handleGameComplete = (gameId, score, total, difficulty = null) => {
    const game = GAMES.find(item => item.id === gameId)
    if (!game || score !== total) return
    const targetBadgeId = difficulty ? `badge-${gameId === 'guess-monument' ? '006' : gameId === 'find-state' ? '007' : '008'}-${difficulty}` : game.badgeId
    if (!earnedBadgeIds.has(targetBadgeId)) {
      const badge = badges.find(item => item.id === targetBadgeId)
      if (badge) { addBadge(badge); addXP(badge.xpReward, `Badge: ${badge.name}`) }
    }
  }

  if (activeGame === 'guess-monument') return <GuessMonument onBack={() => setActiveGame(null)} onComplete={(s, t, d) => handleGameComplete('guess-monument', s, t, d)} />
  if (activeGame === 'find-state') return <FindState onBack={() => setActiveGame(null)} onComplete={(s, t, d) => handleGameComplete('find-state', s, t, d)} />
  if (activeGame === 'match-festival') return <MatchFestival onBack={() => setActiveGame(null)} onComplete={(s, t, d) => handleGameComplete('match-festival', s, t, d)} />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-deep-900)' }} className="indian-motif-bg">
      <header style={{ position: 'relative', minHeight: '390px', padding: '72px 24px 56px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden', backgroundImage: "linear-gradient(180deg, rgba(15,14,23,0.34), rgba(15,14,23,0.64) 58%, var(--color-deep-900) 100%), url('/images/games/games-hero.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <Icon name="games" size={48} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.1rem, 4.5vw, 3.2rem)', fontWeight: '900', color: '#fff', margin: '14px 0 8px' }}>Digital Akhada</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0 }}>Play, explore, and earn XP across India.</p>
        </motion.div>
      </header>

      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '58px 24px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '22px' }}>
          {GAMES.map((game, index) => (
            <motion.article key={game.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.08 }} role="button" tabIndex={0} onClick={() => setActiveGame(game.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') setActiveGame(game.id) }} style={{ minHeight: '430px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden', borderRadius: '24px', border: `1px solid ${game.color}66`, backgroundImage: `linear-gradient(180deg, rgba(10,10,18,0.04) 18%, rgba(10,10,18,0.94) 88%), url("${game.image}")`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer', boxShadow: '0 20px 50px rgba(0,0,0,0.22)' }}>
              <div style={{ position: 'relative', padding: '26px 24px 24px' }}>
                <Icon name={game.icon} size={30} />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', color: '#fff', margin: '12px 0 8px' }}>{game.title}</h2>
                <p style={{ color: 'rgba(255,255,255,0.72)', margin: '0 0 16px', lineHeight: 1.5, fontSize: '0.9rem' }}>{game.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: game.color, fontSize: '0.78rem', fontWeight: '700' }}><span>+{game.xpPerCorrect} XP / answer</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>Play <Icon name="arrowRight" size={16} /></span></div>
              </div>
            </motion.article>
          ))}
        </div>

        {passport.badges.some(b => ['badge-006-hard', 'badge-007-hard', 'badge-008-hard'].includes(b.id)) && <div style={{ marginTop: '32px', textAlign: 'center', color: '#fbbf24' }}><Icon name="medal" size={22} /> {passport.badges.filter(b => ['badge-006-hard', 'badge-007-hard', 'badge-008-hard'].includes(b.id)).length}/3 Game Badges Earned <button type="button" onClick={() => navigate('/passport')} style={{ marginLeft: '12px', color: '#fbbf24', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>View Passport</button></div>}
      </main>
    </div>
  )
}
