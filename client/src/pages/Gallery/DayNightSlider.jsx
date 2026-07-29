import React, { useRef, useState } from 'react'
import Icon from '../../components/Icon.jsx'

/**
 * DayNightSlider - drag-based image comparison for iconic landmarks.
 * Shows the day image on the left and the night image on the right.
 */
export default function DayNightSlider({ dayUrl, nightUrl, alt }) {
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)

  const handlePointerMove = (e) => {
    if (!isDragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const clientX = e.clientX ?? e.touches?.[0]?.clientX
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPos(pct)
  }

  const handlePointerDown = () => setIsDragging(true)
  const handlePointerUp = () => setIsDragging(false)
  const handleKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const delta = event.key === 'ArrowRight' ? 5 : -5
    setSliderPos((position) => Math.max(0, Math.min(100, position + delta)))
  }

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
      role="slider"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(sliderPos)}
      aria-valuetext={`${Math.round(sliderPos)}% day view`}
      onKeyDown={handleKeyDown}
      style={{
        position: 'relative',
        width: '100%',
        userSelect: 'none',
        cursor: 'col-resize',
        overflow: 'hidden',
        aspectRatio: '16/10',
      }}
      aria-label={`Day and night comparison: ${alt}`}
    >
      <img
        src={nightUrl}
        alt={`${alt} at night`}
        loading="lazy"
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
        }}
        onError={(e) => {
          e.target.src = dayUrl
        }}
      />

      <img
        src={dayUrl}
        alt={`${alt} during day`}
        loading="lazy"
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPos}%`,
          transform: 'translateX(-50%)',
          width: '2px',
          background: 'rgba(255,255,255,0.82)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: `${sliderPos}%`,
          transform: 'translate(-50%, -50%)',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(15,14,23,0.85)',
          border: '2px solid rgba(255,255,255,0.72)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.9rem',
          color: '#fff',
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        }}
      >
        <Icon name="arrowRight" size={18} />
      </div>
    </div>
  )
}
