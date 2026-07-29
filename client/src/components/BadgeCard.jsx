import React from 'react'
import { motion } from 'framer-motion'
import Icon from './Icon.jsx'

export default function BadgeCard({ badge, earned = false, size = 'normal' }) {
  const isSmall = size === 'small'

  return (
    <motion.div
      whileHover={earned ? { y: -4, scale: 1.04 } : {}}
      style={{
        display: 'flex',
        flexDirection: isSmall ? 'row' : 'column',
        alignItems: 'center',
        gap: isSmall ? '10px' : '8px',
        background: earned
          ? 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(255,107,43,0.08))'
          : 'rgba(255,255,255,0.03)',
        border: earned
          ? '1px solid rgba(251,191,36,0.3)'
          : '1px solid rgba(255,255,255,0.07)',
        borderRadius: isSmall ? '12px' : '14px',
        padding: isSmall ? '10px 14px' : '20px 16px',
        textAlign: isSmall ? 'left' : 'center',
        opacity: earned ? 1 : 0.5,
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      title={badge.criteria}
    >
      {/* Icon */}
      <div style={{
        fontSize: isSmall ? '1.6rem' : '2.2rem',
        filter: earned ? 'none' : 'grayscale(1)',
        flexShrink: 0,
      }}>
        <Icon name={badge.icon} size={isSmall ? 26 : 36} />
      </div>

      <div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: isSmall ? '0.88rem' : '0.92rem',
          fontWeight: '700',
          color: earned ? '#fbbf24' : 'rgba(255,255,255,0.35)',
          marginBottom: '3px',
        }}>
          {badge.name}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.72rem',
          color: 'rgba(255,255,255,0.35)',
          lineHeight: 1.4,
        }}>
          {earned ? `+${badge.xpReward} XP earned` : badge.criteria}
        </div>
      </div>

      {/* Earned glow */}
      {earned && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.12) 0%, transparent 70%)',
        }} />
      )}
    </motion.div>
  )
}
