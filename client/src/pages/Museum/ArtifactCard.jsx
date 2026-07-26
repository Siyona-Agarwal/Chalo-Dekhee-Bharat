import React from 'react'
import { motion } from 'framer-motion'

export default function ArtifactCard({ artifact, era, isViewed, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Explore artifact: ${artifact.name}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${isViewed ? era.border : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        transition: 'border-color 0.3s',
      }}
    >
      {/* Image */}
      <div style={{
        width: '100%', aspectRatio: '4/3',
        position: 'relative', overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)',
      }}>
        <img
          src={artifact.image}
          alt={artifact.name}
          loading="lazy"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.4s ease',
            display: 'block',
          }}
          onError={e => { e.target.src = `https://placehold.co/400x300/1a1825/FF6B2B?text=${encodeURIComponent(artifact.name)}` }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(15,14,23,0.7) 0%, transparent 50%)',
        }} />

        {/* Viewed badge */}
        {isViewed && (
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: era.color, borderRadius: '999px',
            padding: '3px 9px', fontSize: '0.68rem',
            fontWeight: '700', color: '#fff',
            fontFamily: 'var(--font-body)',
          }}>
            ✓ Viewed
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '18px' }}>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '0.72rem',
          color: era.color, fontWeight: '600',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: '6px',
        }}>
          {artifact.region}
        </div>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: '1rem',
          fontWeight: '700', color: '#fff', margin: '0 0 8px',
          lineHeight: 1.3,
        }}>
          {artifact.name}
        </h3>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.82rem',
          color: 'rgba(255,255,255,0.45)', lineHeight: 1.6,
          margin: '0 0 12px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {artifact.factText}
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '0.78rem', fontFamily: 'var(--font-body)',
          color: era.color, fontWeight: '600',
        }}>
          <span>📜</span> Historical · <span>📖</span> Story Mode
        </div>
      </div>
    </motion.div>
  )
}
