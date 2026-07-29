import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { motion } from 'framer-motion'
import { usePassport } from '../context/PassportContext.jsx'
import indiaMapData from '../data/indiaMapData.js'

const FEATURED_SPOTS = [
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
                <Icon name="passport" size={16} /> Your Interactive Passport to Incredible India
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
              Walk through ancient eras in Bharat Sangrahalaya, marvel at India's
              natural beauty in Bharat Chitrashala, test your knowledge in Digital Akhada,
              and let AI craft your perfect itinerary — all while building your
              personal Digital Passport.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ display: 'grid', gridTemplateColumns: 'max-content max-content', gap: '12px', marginBottom: '40px' }}
            >
              {[
                { icon: 'museum', label: 'Bharat Sangrahalaya' },
                { icon: 'gallery', label: 'Bharat Chitrashala' },
                { icon: 'games', label: 'Digital Akhada' },
                { icon: 'sparkles', label: 'Safar Saathi' },
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
                  <Icon name={icon} size={16} />
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
                <Icon name="rocket" size={18} /> Start Your Journey
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
                  <Icon name="passport" size={18} /> My Passport
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
                viewBox={indiaMapData.viewBox}
                aria-label="Map of India showing major states"
                role="img"
                style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 8px 40px rgba(255,107,43,0.25))' }}
              >
                {/* Decorative grid lines scaled for 1000x1150 */}
                <line x1="0" y1="400" x2="1000" y2="400" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
                <line x1="0" y1="800" x2="1000" y2="800" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
                <line x1="500" y1="0" x2="500" y2="1150" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />

                {/* State paths */}
                {indiaMapData.locations.map(({ id, name, path }) => (
                  <motion.path
                    key={id}
                    d={path}
                    fill="rgba(255,107,43,0.08)"
                    stroke="rgba(255,107,43,0.35)"
                    strokeWidth={2}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{
                      fill: 'rgba(255,107,43,0.6)',
                      stroke: 'rgba(255,255,255,1)',
                      strokeWidth: 3,
                      y: -12,
                      x: -8,
                      rotateX: 10,
                      rotateY: -10,
                      filter: 'drop-shadow(12px 20px 10px rgba(0,0,0,0.6)) drop-shadow(0px 0px 8px rgba(255,107,43,0.8))'
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    onClick={() => navigate(`/state/${encodeURIComponent(name.toLowerCase())}`)}
                    style={{ cursor: 'pointer', transformOrigin: 'center center' }}
                    aria-label={name}
                  >
                    <title>{name}</title>
                  </motion.path>
                ))}

                {/* Featured location pins */}
                {FEATURED_SPOTS.map(({ id, label, x, y, icon }) => (
                  <motion.g
                    key={id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + id * 0.1, type: 'spring', stiffness: 200 }}
                  >
                    <circle cx={x} cy={y} r="35" fill="rgba(15,14,23,0.85)" stroke="rgba(255,107,43,0.5)" strokeWidth="3" />
                    <text x={x} y={y + 12} textAnchor="middle" fontSize="12">{icon}</text>
                    {/* Pulse ring */}
                    <motion.circle
                      cx={x} cy={y} r="45"
                      fill="none"
                      stroke="rgba(255,107,43,0.4)"
                      strokeWidth="2"
                      animate={{ r: [45, 65, 45], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: id * 0.4 }}
                    />
                  </motion.g>
                ))}
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
              step: '01', icon: 'museum', title: 'Explore the Museum',
              desc: 'Walk through Prachin Bharat, Madhyakalin Bharat, Swatantrata Sangram, and Adhunik Bharat eras. Collect Heritage Stamps as you complete each era.',
              color: '#FF6B2B', to: '/museum',
            },
            {
              step: '02', icon: 'gallery', title: 'Browse the Gallery',
              desc: 'Discover Heritage, Nature, Wildlife, Food, and Festival photos. Bookmark destinations to your wishlist.',
              color: '#f59e0b', to: '/gallery',
            },
            {
              step: '03', icon: 'games', title: 'Digital Akhada',
              desc: 'Smarak Pehchan, Pradesh Khoj, and Utsav Sangam — earn XP and badges for every win.',
              color: '#a78bfa', to: '/games',
            },
            {
              step: '04', icon: 'sparkles', title: 'Safar Saathi',
              desc: 'Your intelligent journey companion — let AI craft a personalised itinerary based on your Passport, stamps, and wishlist.',
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
                <Icon name={icon} size={28} />
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
            { value: '28', label: 'States to Discover' },
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
