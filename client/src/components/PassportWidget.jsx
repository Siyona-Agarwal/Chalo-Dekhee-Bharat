import React from 'react'
import { motion } from 'framer-motion'
import { usePassport, deriveLevel } from '../context/PassportContext.jsx'

const LEVEL_COLORS = {
  'Wanderer':      '#94a3b8',
  'Explorer':      '#38bdf8',
  'Adventurer':    '#a78bfa',
  'Bharat Yatri':  '#fbbf24',
}

export default function PassportWidget() {
  const { passport, level } = usePassport()
  const xp = passport.xp || 0
  const levelColor = LEVEL_COLORS[level.name] || '#FF6B2B'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        padding: '6px 14px',
        cursor: 'default',
      }}
      title={`${xp} XP · ${level.name}`}
    >
      {/* Level badge */}
      <span
        style={{
          fontSize: '0.72rem',
          fontWeight: '700',
          fontFamily: 'var(--font-display)',
          color: levelColor,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {level.name}
      </span>

      {/* XP bar */}
      <div
        style={{
          width: '72px',
          height: '5px',
          background: 'rgba(255,255,255,0.12)',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
        aria-label={`XP Progress: ${Math.round(level.progress)}%`}
        role="progressbar"
        aria-valuenow={Math.round(level.progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${level.progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${levelColor}, #FF6B2B)`,
            borderRadius: '999px',
          }}
        />
      </div>

      {/* XP number */}
      <span
        style={{
          fontSize: '0.78rem',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.8)',
          fontFamily: 'var(--font-body)',
          whiteSpace: 'nowrap',
        }}
      >
        {xp} XP
      </span>
    </div>
  )
}
