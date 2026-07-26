import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { usePassport, deriveLevel } from '../context/PassportContext.jsx'
import BadgeCard from '../components/BadgeCard.jsx'
import allBadges from '../data/badges.json'

const LEVEL_COLORS = {
  'Wanderer':     '#94a3b8',
  'Explorer':     '#38bdf8',
  'Adventurer':   '#a78bfa',
  'Bharat Yatri': '#fbbf24',
}

const ERA_COLORS = {
  'ancient':  '#f59e0b',
  'medieval': '#FF6B2B',
  'freedom':  '#138808',
  'modern':   '#38bdf8',
}

export default function PassportDashboard() {
  const { passport, level, removeFromWishlist } = usePassport()
  const navigate = useNavigate()
  const xp = passport.xp || 0
  const levelColor = LEVEL_COLORS[level.name] || '#FF6B2B'

  const earnedBadgeIds = new Set(passport.badges.map(b => b.id))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-deep-900)', padding: '0 0 80px' }}>

      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,107,43,0.1) 0%, rgba(245,158,11,0.06) 100%)',
        borderBottom: '1px solid rgba(255,107,43,0.12)',
        padding: '64px 24px 48px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 70% 40%, rgba(255,107,43,0.12) 0%, transparent 55%)',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '3rem' }}>📖</span>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: '900', color: '#fff', margin: 0,
              }}>
                My Digital Passport
              </h1>
              <p style={{
                fontFamily: 'var(--font-body)',
                color: 'rgba(255,255,255,0.4)', margin: '4px 0 0',
                fontSize: '0.9rem',
              }}>
                Your complete India exploration record
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* XP / Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,43,0.12), rgba(245,158,11,0.06))',
            border: '1px solid rgba(255,107,43,0.2)',
            borderRadius: '20px', padding: '32px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px',
              }}>
                Explorer Level
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: '800', color: levelColor }}>
                {level.name}
              </div>
              {level.nextName && (
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
                  Next: {level.nextName} at {level.nextMinXP} XP
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: '900',
                background: 'linear-gradient(135deg, #FF6B2B, #fbbf24)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', lineHeight: 1,
              }}>
                {xp}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                total XP
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{level.minXP} XP</span>
              {level.nextMinXP && <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{level.nextMinXP} XP</span>}
            </div>
            <div style={{
              height: '8px', background: 'rgba(255,255,255,0.08)',
              borderRadius: '999px', overflow: 'hidden',
            }}
              role="progressbar"
              aria-valuenow={Math.round(level.progress)}
              aria-valuemin={0} aria-valuemax={100}
              aria-label={`Level progress: ${Math.round(level.progress)}%`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${level.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                style={{
                  height: '100%',
                  background: `linear-gradient(90deg, ${levelColor}, #FF6B2B)`,
                  borderRadius: '999px',
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
          }}
        >
          {[
            { label: 'Badges', value: passport.badges.length, icon: '🏅', color: '#fbbf24' },
            { label: 'Stamps', value: passport.stamps.length, icon: '🪬', color: '#FF6B2B' },
            { label: 'Wishlist', value: passport.wishlist.length, icon: '❤️', color: '#f472b6' },
            { label: 'Itineraries', value: passport.plannerHistory.length, icon: '🗺️', color: '#38bdf8' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', padding: '20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: '800', color }}>{value}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Heritage Stamps */}
        {passport.stamps.length > 0 && (
          <Section title="🪬 Heritage Stamps" delay={0.15}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {passport.stamps.map(stamp => (
                <div key={stamp.eraId} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: `rgba(${stamp.eraId === 'ancient' ? '245,158,11' : stamp.eraId === 'medieval' ? '255,107,43' : stamp.eraId === 'freedom' ? '19,136,8' : '56,189,248'},0.12)`,
                  border: `1px solid rgba(${stamp.eraId === 'ancient' ? '245,158,11' : stamp.eraId === 'medieval' ? '255,107,43' : stamp.eraId === 'freedom' ? '19,136,8' : '56,189,248'},0.3)`,
                  borderRadius: '12px', padding: '10px 16px',
                }}>
                  <span style={{ fontSize: '1.4rem' }}>🪬</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
                      {stamp.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(stamp.earnedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Badges */}
        <Section title="🏅 Badges" delay={0.2}>
          {passport.badges.length === 0 && allBadges.every(b => !earnedBadgeIds.has(b.id)) ? (
            <EmptyState
              icon="🏅"
              text="Complete museum eras, play games, and explore to earn badges!"
              action={{ label: 'Go to Museum', to: '/museum' }}
              onAction={() => navigate('/museum')}
            />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px',
            }}>
              {allBadges.map(badge => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  earned={earnedBadgeIds.has(badge.id)}
                />
              ))}
            </div>
          )}
        </Section>

        {/* Wishlist */}
        <Section title="❤️ Wishlist" delay={0.25}>
          {passport.wishlist.length === 0 ? (
            <EmptyState
              icon="🤍"
              text="Bookmark photos in the Gallery to build your travel wishlist!"
              action={{ label: 'Open Gallery', to: '/gallery' }}
              onAction={() => navigate('/gallery')}
            />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '14px',
            }}>
              {passport.wishlist.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    borderRadius: '14px', overflow: 'hidden',
                    border: '1px solid rgba(244,114,182,0.2)',
                    position: 'relative',
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                    onError={e => { e.target.src = `https://placehold.co/300x200/1a1825/FF6B2B?text=${encodeURIComponent(item.title)}` }}
                  />
                  <div style={{
                    padding: '10px 12px',
                    background: 'rgba(15,14,23,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>
                        {item.title}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                        {item.region}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      aria-label={`Remove ${item.title} from wishlist`}
                      style={{
                        background: 'none', border: 'none',
                        color: '#f472b6', fontSize: '1rem', cursor: 'pointer',
                      }}
                    >
                      ❤️
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Section>

        {/* Planner History */}
        <Section title="🗺️ Planner History" delay={0.3}>
          {passport.plannerHistory.length === 0 ? (
            <EmptyState
              icon="🤖"
              text="Generate your first AI itinerary in the Travel Planner!"
              action={{ label: 'Open Planner', to: '/planner' }}
              onAction={() => navigate('/planner')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {passport.plannerHistory.map(item => (
                <div key={item.id} style={{
                  background: 'rgba(56,189,248,0.06)',
                  border: '1px solid rgba(56,189,248,0.15)',
                  borderRadius: '14px', padding: '16px 20px',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', flexWrap: 'wrap', gap: '8px',
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
                      {item.destination} — {item.days} Days
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>
                      {item.budget} · {item.style} · {new Date(item.generatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{ fontSize: '1.5rem' }}>🗺️</span>
                </div>
              ))}
            </div>
          )}
        </Section>

      </div>
    </div>
  )
}

/* ── Helpers ────────────────────────────────────────────── */
function Section({ title, delay = 0, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: '1.1rem',
        fontWeight: '700', color: '#fff',
        margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        {title}
      </h2>
      {children}
    </motion.section>
  )
}

function EmptyState({ icon, text, action, onAction }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px dashed rgba(255,255,255,0.1)',
      borderRadius: '14px', padding: '32px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px' }}>
        {text}
      </p>
      {action && (
        <button
          onClick={onAction}
          style={{
            padding: '8px 20px', borderRadius: '10px',
            border: '1px solid rgba(255,107,43,0.4)',
            background: 'transparent', color: '#FF6B2B',
            fontFamily: 'var(--font-body)', fontSize: '0.87rem',
            fontWeight: '600', cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
