import React from 'react'
import { motion } from 'framer-motion'

const INK_COLORS = ['#1d4e89', '#a33b28', '#357a55', '#8a5a20']

const getRotation = id => {
  const seed = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return (seed % 7) - 3
}

export default function PassportStamp({ badge, index, earned }) {
  const ink = INK_COLORS[index % INK_COLORS.length]
  const rotation = getRotation(badge.id)
  const delay = 0.28 + index * 0.09

  return (
    <div
      className={`achievement-stamp ${earned ? 'achievement-stamp--earned' : 'achievement-stamp--empty'}`}
      style={{ '--stamp-ink': ink, '--stamp-rotation': `${rotation}deg` }}
      title={badge.criteria}
    >
      {earned && (
        <motion.div
          className="achievement-stamp__press"
          initial={{ opacity: 0, y: -62, rotate: -5, scale: 0.92 }}
          animate={{ opacity: [0, 1, 1, 0], y: [-62, -38, 5, -20], rotate: [-5, 1, 0, 2], scale: [0.92, 1, 1, 0.96] }}
          transition={{ duration: 0.62, delay, times: [0, 0.22, 0.58, 1], ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        ><span /><i /></motion.div>
      )}
      <motion.div
        className="achievement-stamp__body"
        initial={earned ? { opacity: 0, scale: 1.28, rotate: rotation - 5 } : { opacity: 0.35 }}
        animate={earned ? { opacity: 0.9, scale: 1, rotate: rotation } : { opacity: 0.35 }}
        transition={earned ? { type: 'spring', stiffness: 470, damping: 20, delay: delay + 0.34 } : { duration: 0.2 }}
      >
        <motion.div className="achievement-stamp__impact" initial={earned ? { opacity: .38, scale: .68 } : false} animate={earned ? { opacity: 0, scale: 1.28 } : false} transition={{ duration: .52, delay: delay + .36 }} aria-hidden="true" />
        <div className="achievement-stamp__ring" />
        <span className="achievement-stamp__stars">✦ · ✦</span>
        <span className="achievement-stamp__icon">{badge.icon}</span>
        <b>{badge.name}</b>
        <small>{earned ? 'ACHIEVEMENT VERIFIED' : 'LOCKED · KEEP EXPLORING'}</small>
        <em>{earned ? 'CHALO / BHARAT' : '— — — —'}</em>
      </motion.div>
    </div>
  )
}
