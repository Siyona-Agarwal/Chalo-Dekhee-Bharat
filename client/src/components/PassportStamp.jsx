import React from 'react'
import { motion } from 'framer-motion'

const COLORS = [
  'rgba(30, 58, 138, 0.85)',  // navy
  'rgba(185, 28, 28, 0.85)',  // crimson
  'rgba(21, 128, 61, 0.85)',  // forest green
  'rgba(107, 33, 168, 0.85)'  // purple
]

const getSeed = (id) => Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0)

const seededRandom = (seed, min, max) => {
  const x = Math.sin(seed) * 10000
  const rand = x - Math.floor(x)
  return min + rand * (max - min)
}

const StamperGraphic = ({ delay }) => (
  <motion.div
    initial={{ scale: 5, opacity: 0, y: -50, x: "-50%" }}
    animate={{ 
      scale: [5, 1, 1, 4], 
      opacity: [0, 1, 1, 0],
      y: [-50, 0, 0, -30],
      x: "-50%"
    }}
    transition={{ 
      duration: 0.8, 
      times: [0, 0.3, 0.5, 1], // Slams down fast, holds, lifts off
      delay: delay,
      ease: "easeInOut"
    }}
    style={{
      position: 'absolute', top: '-40px', left: '50%',
      width: '180px', height: '180px', zIndex: 1000, pointerEvents: 'none'
    }}
  >
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(15px 25px 15px rgba(0,0,0,0.5)) drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
      <defs>
        <linearGradient id="woodTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e3986a" />
          <stop offset="50%" stopColor="#d27d46" />
          <stop offset="100%" stopColor="#b55d28" />
        </linearGradient>
        <linearGradient id="woodFront" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a35522" />
          <stop offset="100%" stopColor="#6e3108" />
        </linearGradient>
        <linearGradient id="woodRight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8b4315" />
          <stop offset="100%" stopColor="#4a1e00" />
        </linearGradient>
        <radialGradient id="woodKnob" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#f4b288" />
          <stop offset="30%" stopColor="#c56d33" />
          <stop offset="70%" stopColor="#7a370b" />
          <stop offset="100%" stopColor="#3d1800" />
        </radialGradient>
        <linearGradient id="woodNeck" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4a1e00" />
          <stop offset="30%" stopColor="#c56d33" />
          <stop offset="70%" stopColor="#9a4d1a" />
          <stop offset="100%" stopColor="#3d1800" />
        </linearGradient>
      </defs>

      <g transform="rotate(-15 100 100)">
        {/* Base block (isometric cylinder) */}
        <ellipse cx="100" cy="115" rx="65" ry="40" fill="url(#woodFront)" />
        <rect x="35" y="100" width="130" height="15" fill="url(#woodFront)" />
        <ellipse cx="100" cy="100" rx="65" ry="40" fill="url(#woodTop)" />
        
        {/* Neck Base Ring */}
        <ellipse cx="100" cy="100" rx="35" ry="20" transform="rotate(-20 100 100)" fill="url(#woodNeck)" />
        <ellipse cx="100" cy="95" rx="30" ry="17" transform="rotate(-20 100 100)" fill="url(#woodTop)" />

        {/* Neck Stem */}
        <path d="M 75 95 Q 100 110 125 95 L 115 50 Q 100 55 85 50 Z" fill="url(#woodNeck)" />
        
        {/* Spherical Knob */}
        <circle cx="100" cy="45" r="45" fill="url(#woodKnob)" />
      </g>
    </svg>
  </motion.div>
)

export default function PassportStamp({ badge, index, earned }) {
  const seed = getSeed(badge.id)
  
  // Calculate a roughly grid-based position with heavy random offset so they overlap nicely
  // Assuming a container size around 300x350
  const localIndex = index % 6
  const col = localIndex % 3
  const row = Math.floor(localIndex / 3)
  
  const baseX = col * 150 + 30
  const baseY = row * 130 + 30
  
  const offsetX = seededRandom(seed, -40, 40)
  const offsetY = seededRandom(seed + 1, -40, 40)
  const rotation = seededRandom(seed + 2, -45, 45)
  const colorIndex = Math.floor(seededRandom(seed + 3, 0, COLORS.length))
  const color = COLORS[colorIndex]
  
  const delay = index * 0.15 // Stagger the stamping animation

  if (!earned) {
    // Option B: Faint dashed circles for unearned badges
    return (
      <div style={{
        position: 'absolute',
        left: baseX + offsetX,
        top: baseY + offsetY,
        width: '100px', height: '100px',
        borderRadius: '50%',
        border: '2px dashed rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: 0.6,
        transform: `rotate(${rotation}deg)`
      }}>
        <div style={{ fontSize: '1.5rem', opacity: 0.3, filter: 'grayscale(1)' }}>{badge.icon}</div>
        <div style={{ fontSize: '0.4rem', fontFamily: 'var(--font-display)', color: 'rgba(0,0,0,0.3)', textAlign: 'center', marginTop: '4px', padding: '0 8px' }}>
          {badge.name.toUpperCase()}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'absolute',
      left: baseX + offsetX,
      top: baseY + offsetY,
      width: '100px', height: '100px',
    }}>
      <StamperGraphic delay={delay} />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.05, delay: delay + 0.23 }} // Pops in exactly when stamper hits (30% of 0.8s + delay = 0.24s)
        style={{
          width: '100%', height: '100%',
          borderRadius: '50%',
          border: `3px solid ${color}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transform: `rotate(${rotation}deg)`,
          mixBlendMode: 'multiply', // Makes the ink blend with the paper
          position: 'relative'
        }}
      >
        {/* Double ring effect */}
        <div style={{
          position: 'absolute', inset: '4px',
          borderRadius: '50%', border: `1px solid ${color}`,
          opacity: 0.7
        }} />
        
        {/* Distressed texture overlay using a subtle dashed border on another pseudo-element */}
        <div style={{
          position: 'absolute', inset: '-3px',
          borderRadius: '50%', border: `2px dashed ${color}`,
          opacity: 0.3, transform: 'rotate(45deg)'
        }} />

        <div style={{ fontSize: '2rem', filter: 'contrast(1.2)' }}>{badge.icon}</div>
        
        {/* Circular curved text could be complex, we'll use straight, rotated text inside the stamp */}
        <div style={{ 
          fontSize: '0.45rem', fontFamily: 'var(--font-display)', color: color, 
          textAlign: 'center', fontWeight: '800', textTransform: 'uppercase',
          letterSpacing: '0.05em', marginTop: '2px', padding: '0 12px',
          lineHeight: 1.1
        }}>
          {badge.name}
        </div>
        <div style={{
          fontSize: '0.35rem', fontFamily: 'monospace', color: color,
          fontWeight: '700', marginTop: '2px', opacity: 0.8
        }}>
          {new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}
        </div>
      </motion.div>
    </div>
  )
}
