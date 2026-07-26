import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePassport } from '../context/PassportContext.jsx'

// Simplified India map as SVG paths for major states
// Coordinates are approximate and artistic — used as decorative map only
const INDIA_STATES = [
  { id: 'jammu-kashmir', label: 'J&K', d: 'M 160 60 L 200 55 L 215 75 L 200 95 L 170 90 Z' },
  { id: 'himachal-pradesh', label: 'HP', d: 'M 200 75 L 225 70 L 235 90 L 215 100 Z' },
  { id: 'punjab', label: 'PB', d: 'M 180 95 L 210 90 L 215 110 L 190 115 Z' },
  { id: 'uttarakhand', label: 'UK', d: 'M 220 90 L 255 85 L 262 108 L 232 112 Z' },
  { id: 'haryana', label: 'HR', d: 'M 195 115 L 220 110 L 222 132 L 198 135 Z' },
  { id: 'rajasthan', label: 'RJ', d: 'M 155 120 L 210 115 L 215 180 L 160 185 Z' },
  { id: 'uttar-pradesh', label: 'UP', d: 'M 220 110 L 295 108 L 300 155 L 218 158 Z' },
  { id: 'bihar', label: 'BR', d: 'M 295 108 L 335 110 L 337 140 L 298 142 Z' },
  { id: 'west-bengal', label: 'WB', d: 'M 335 108 L 358 115 L 355 175 L 335 180 Z' },
  { id: 'assam', label: 'AS', d: 'M 360 115 L 410 112 L 408 135 L 358 138 Z' },
  { id: 'gujarat', label: 'GJ', d: 'M 130 170 L 175 165 L 172 225 L 128 228 Z' },
  { id: 'madhya-pradesh', label: 'MP', d: 'M 175 155 L 300 152 L 298 210 L 175 215 Z' },
  { id: 'jharkhand', label: 'JH', d: 'M 298 142 L 340 138 L 342 170 L 300 172 Z' },
  { id: 'odisha', label: 'OD', d: 'M 300 170 L 355 168 L 350 225 L 302 228 Z' },
  { id: 'maharashtra', label: 'MH', d: 'M 160 215 L 295 210 L 290 275 L 162 278 Z' },
  { id: 'chhattisgarh', label: 'CG', d: 'M 295 170 L 340 168 L 340 230 L 297 232 Z' },
  { id: 'telangana', label: 'TG', d: 'M 232 275 L 300 270 L 298 315 L 232 318 Z' },
  { id: 'andhra-pradesh', label: 'AP', d: 'M 240 315 L 330 312 L 325 355 L 242 358 Z' },
  { id: 'karnataka', label: 'KA', d: 'M 185 295 L 255 290 L 252 365 L 183 368 Z' },
  { id: 'goa', label: 'GA', d: 'M 178 360 L 200 358 L 198 378 L 178 376 Z' },
  { id: 'kerala', label: 'KL', d: 'M 200 368 L 228 362 L 224 430 L 198 432 Z' },
  { id: 'tamil-nadu', label: 'TN', d: 'M 240 360 L 285 355 L 282 428 L 240 430 Z' },
]

const FEATURED_SPOTS = [
  { id: 1, label: 'Taj Mahal', x: 232, y: 135, emoji: '🕌' },
  { id: 2, label: 'Jaipur', x: 180, y: 148, emoji: '🏯' },
  { id: 3, label: 'Mumbai', x: 165, y: 252, emoji: '🌆' },
  { id: 4, label: 'Kerala', x: 210, y: 400, emoji: '🌴' },
  { id: 5, label: 'Varanasi', x: 275, y: 138, emoji: '🪔' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { passport } = usePassport()

  const hasStarted = (passport.xp || 0) > 0 || passport.stamps.length > 0

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden', background: 'var(--color-deep-900)' }}>

      {/* Hero Section */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>

        {/* Animated gradient background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 50%, rgba(255,107,43,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(19,136,8,0.12) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(14,165,233,0.10) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        {/* Decorative circle rings */}
        {[280, 450, 620].map((size, i) => (
          <motion.div
            key={i}
            animate={{ rotate: 360 }}
            transition={{ duration: 30 + i * 10, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              right: `${10 - i * 3}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              width: size,
              height: size,
              borderRadius: '50%',
              border: `1px solid rgba(255,107,43,${0.08 - i * 0.02})`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Content */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          width: '100%',
        }}>

          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,107,43,0.12)',
                border: '1px solid rgba(255,107,43,0.25)',
                borderRadius: '999px',
                padding: '6px 16px',
                marginBottom: '24px',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: '#FF6B2B', fontWeight: '600', fontFamily: 'var(--font-body)' }}>
                🇮🇳 Your Interactive Passport to Incredible India
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.4rem, 5vw, 4rem)',
                fontWeight: '900',
                lineHeight: 1.1,
                margin: '0 0 20px',
                color: '#fff',
              }}
            >
              चलो देखें{' '}
              <span style={{
                background: 'linear-gradient(135deg, #FF6B2B, #fbbf24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                भारत!
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.7,
                margin: '0 0 36px',
                maxWidth: '480px',
              }}
            >
              Walk through ancient eras in our Digital Museum, marvel at India's
              natural beauty in the Photo Gallery, test your knowledge in Mini-Games,
              and let AI craft your perfect itinerary — all while building your
              personal Digital Passport.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '40px' }}
            >
              {[
                { icon: '🏛️', label: 'Digital Museum' },
                { icon: '🖼️', label: 'Photo Gallery' },
                { icon: '🎮', label: 'Mini-Games' },
                { icon: '🤖', label: 'AI Planner' },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <span role="img" aria-hidden="true">{icon}</span>
                  {label}
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(255,107,43,0.5)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/museum')}
                aria-label="Start Your Journey"
                style={{
                  padding: '14px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #FF6B2B, #f59e0b)',
                  color: '#fff',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                }}
              >
                🚀 Start Your Journey
              </motion.button>

              {hasStarted && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/passport')}
                  aria-label="View My Passport"
                  style={{
                    padding: '14px 28px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,107,43,0.4)',
                    background: 'transparent',
                    color: '#FF6B2B',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  📖 My Passport
                </motion.button>
              )}
            </motion.div>
          </motion.div>

          {/* Right: India Map SVG */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>

              {/* Glow behind map */}
              <div style={{
                position: 'absolute', inset: '-20px',
                background: 'radial-gradient(ellipse, rgba(255,107,43,0.2) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <svg
                viewBox="100 50 350 420"
                aria-label="Map of India showing major states"
                role="img"
                style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 8px 40px rgba(255,107,43,0.25))' }}
              >
                {/* State paths */}
                {INDIA_STATES.map(({ id, label, d }) => (
                  <motion.path
                    key={id}
                    d={d}
                    fill="rgba(255,107,43,0.08)"
                    stroke="rgba(255,107,43,0.35)"
                    strokeWidth="1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ fill: 'rgba(255,107,43,0.22)', stroke: 'rgba(255,107,43,0.7)' }}
                    transition={{ duration: 0.3 }}
                    style={{ cursor: 'default' }}
                    aria-label={label}
                  >
                    <title>{label}</title>
                  </motion.path>
                ))}

                {/* Featured location pins */}
                {FEATURED_SPOTS.map(({ id, label, x, y, emoji }) => (
                  <motion.g
                    key={id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + id * 0.1, type: 'spring', stiffness: 200 }}
                  >
                    <circle cx={x} cy={y} r="14" fill="rgba(15,14,23,0.85)" stroke="rgba(255,107,43,0.5)" strokeWidth="1.5" />
                    <text x={x} y={y + 5} textAnchor="middle" fontSize="12">{emoji}</text>
                    {/* Pulse ring */}
                    <motion.circle
                      cx={x} cy={y} r="18"
                      fill="none"
                      stroke="rgba(255,107,43,0.4)"
                      strokeWidth="1"
                      animate={{ r: [18, 26, 18], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: id * 0.4 }}
                    />
                  </motion.g>
                ))}

                {/* Decorative grid lines */}
                <line x1="100" y1="300" x2="450" y2="300" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="100" y1="200" x2="450" y2="200" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="275" y1="50" x2="275" y2="470" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Journey Steps Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 24px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            fontWeight: '800',
            color: '#fff',
            margin: '0 0 16px',
          }}>
            Your Journey, Your Passport
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '560px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Every page you explore adds stamps, XP, and badges to your Digital Passport — creating a unique record of your virtual India journey.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
        }}>
          {[
            {
              step: '01', icon: '🏛️', title: 'Explore the Museum',
              desc: 'Walk through Ancient, Medieval, Freedom Movement, and Modern eras. Collect Heritage Stamps as you complete each era.',
              color: '#FF6B2B', to: '/museum',
            },
            {
              step: '02', icon: '🖼️', title: 'Browse the Gallery',
              desc: 'Discover Heritage, Nature, Wildlife, Food, and Festival photos. Bookmark destinations to your wishlist.',
              color: '#f59e0b', to: '/gallery',
            },
            {
              step: '03', icon: '🎮', title: 'Play Mini-Games',
              desc: 'Guess the Monument, Find the State on a map, or Match Festivals to States — earn XP and badges for every win.',
              color: '#a78bfa', to: '/games',
            },
            {
              step: '04', icon: '🤖', title: 'AI Travel Planner',
              desc: 'Let AI craft a personalized itinerary based on your exploration history, wishlist, and travel preferences.',
              color: '#38bdf8', to: '/planner',
            },
          ].map(({ step, icon, title, desc, color, to }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => navigate(to)}
              role="button"
              tabIndex={0}
              aria-label={`Navigate to ${title}`}
              onKeyDown={(e) => e.key === 'Enter' && navigate(to)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '28px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Step number */}
              <div style={{
                position: 'absolute', top: '20px', right: '20px',
                fontFamily: 'var(--font-display)',
                fontSize: '3rem', fontWeight: '900',
                color: 'rgba(255,255,255,0.04)',
                lineHeight: 1,
              }}>
                {step}
              </div>

              <div style={{
                width: '52px', height: '52px',
                borderRadius: '12px',
                background: `rgba(${color === '#FF6B2B' ? '255,107,43' : color === '#f59e0b' ? '245,158,11' : color === '#a78bfa' ? '167,139,250' : '56,189,248'},0.15)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', marginBottom: '16px',
              }}>
                <span role="img" aria-hidden="true">{icon}</span>
              </div>

              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem', fontWeight: '700',
                color: '#fff', margin: '0 0 10px',
              }}>
                {title}
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.87rem', color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.6, margin: 0,
              }}>
                {desc}
              </p>

              {/* Bottom accent line */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '2px',
                background: `linear-gradient(90deg, ${color}, transparent)`,
              }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          background: 'rgba(255,107,43,0.06)',
          borderTop: '1px solid rgba(255,107,43,0.12)',
          borderBottom: '1px solid rgba(255,107,43,0.12)',
          padding: '40px 24px',
        }}
      >
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '32px',
          textAlign: 'center',
        }}>
          {[
            { value: '28+', label: 'States to Discover' },
            { value: '60+', label: 'Historical Artifacts' },
            { value: '3', label: 'Mini-Games' },
            { value: '∞', label: 'AI Itineraries' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #FF6B2B, #fbbf24)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {value}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.5)',
                marginTop: '4px',
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Mobile responsive grid */}
      <style>{`
        @media (max-width: 768px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
