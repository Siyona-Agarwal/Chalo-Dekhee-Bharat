import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'

/**
 * DayNightSlider — drag/hover-based image comparison for iconic landmarks.
 * Shows the "day" image on the left and "night" on the right, with a draggable
 * divider. Also has a toggle button for quick swap.
 *
 * Implemented entirely with CSS clip-path and mouse events — no external libs.
 */
export default function DayNightSlider({ dayUrl, nightUrl, alt }) {
  const [sliderPos, setSliderPos] = useState(50) // 0-100 percent
  const [isDragging, setIsDragging] = useState(false)
  const [mode, setMode] = useState('slider') // 'slider' | 'day' | 'night'
  const containerRef = useRef(null)

  const handlePointerMove = (e) => {
    if (!isDragging || mode !== 'slider') return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPos(pct)
  }

  const handlePointerDown = () => setIsDragging(true)
  const handlePointerUp = () => setIsDragging(false)

  return (
    <div
      ref={containerRef}
      onMouseMove={handlePointerMove}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchMove={handlePointerMove}
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
      style={{
        position: 'relative', width: '100%',
        userSelect: 'none', cursor: mode === 'slider' ? 'col-resize' : 'default',
        overflow: 'hidden',
        aspectRatio: '16/10',
      }}
      aria-label={`Day/Night comparison: ${alt}`}
    >
      {/* Night image (base layer — full) */}
      <img
        src={nightUrl}
        alt={`${alt} at night`}
        loading="lazy"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', objectFit: 'cover',
          opacity: mode === 'day' ? 0 : 1,
          transition: mode !== 'slider' ? 'opacity 0.5s ease' : 'none',
        }}
        onError={e => { e.target.src = dayUrl }}
      />

      {/* Day image clipped to left side */}
      <img
        src={dayUrl}
        alt={`${alt} during day`}
        loading="lazy"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', objectFit: 'cover',
          clipPath: mode === 'slider'
            ? `inset(0 ${100 - sliderPos}% 0 0)`
            : mode === 'day' ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
          transition: mode !== 'slider' ? 'clip-path 0.5s ease' : 'none',
        }}
      />

      {/* Slider line + handle */}
      {mode === 'slider' && (
        <>
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${sliderPos}%`, transform: 'translateX(-50%)',
            width: '2px', background: 'rgba(255,255,255,0.8)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '50%',
            left: `${sliderPos}%`,
            transform: 'translate(-50%, -50%)',
            width: '36px', height: '36px',
            borderRadius: '50%',
            background: 'rgba(15,14,23,0.85)',
            border: '2px solid rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', pointerEvents: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}>
            ↔
          </div>
        </>
      )}

      {/* Day/Night labels */}
      {mode === 'slider' && (
        <>
          <div style={{
            position: 'absolute', top: '10px', left: '12px',
            background: 'rgba(245,158,11,0.85)', borderRadius: '6px',
            padding: '3px 8px', fontSize: '0.7rem', fontWeight: '700',
            color: '#fff', fontFamily: 'var(--font-body)',
            pointerEvents: 'none',
          }}>
            ☀️ Day
          </div>
          <div style={{
            position: 'absolute', top: '10px', right: '12px',
            background: 'rgba(56,189,248,0.85)', borderRadius: '6px',
            padding: '3px 8px', fontSize: '0.7rem', fontWeight: '700',
            color: '#fff', fontFamily: 'var(--font-body)',
            pointerEvents: 'none',
          }}>
            🌙 Night
          </div>
        </>
      )}

      {/* Mode toggle buttons */}
      <div style={{
        position: 'absolute', bottom: '12px', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: '4px',
        background: 'rgba(15,14,23,0.75)', borderRadius: '8px',
        padding: '3px',
      }}>
        {[
          { key: 'day', label: '☀️' },
          { key: 'slider', label: '↔' },
          { key: 'night', label: '🌙' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            aria-label={`${key} view`}
            aria-pressed={mode === key}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: 'none',
              background: mode === key ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: '#fff', fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
