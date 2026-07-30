import React, { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import DayNightSlider from './DayNightSlider.jsx'

export default function PhotoCard({ photo, index, isWishlisted, onToggleWishlist }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const reduceMotion = useReducedMotion()

  const handleWishlist = (event) => {
    event.stopPropagation()
    onToggleWishlist()
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: (index % 6) * 0.07, duration: reduceMotion ? 0 : 0.5 }}
      style={{
        position: 'relative',
        aspectRatio: '16 / 10',
        perspective: '1200px',
      }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.48,
          ease: [0.22, 0.72, 0.2, 1],
        }}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          aria-hidden={isFlipped}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#12101a',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            pointerEvents: isFlipped ? 'none' : 'auto',
          }}
        >
          {photo.hasDayNight && photo.nightImageUrl ? (
            <DayNightSlider
              dayUrl={photo.dayImageUrl}
              nightUrl={photo.nightImageUrl}
              alt={photo.title}
            />
          ) : (
            <img
              src={photo.imageUrl}
              alt={photo.title}
              loading="lazy"
              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
              onError={(event) => {
                if (photo.fallbackImageUrl && event.currentTarget.dataset.fallbackApplied !== 'true') {
                  event.currentTarget.dataset.fallbackApplied = 'true'
                  event.currentTarget.src = photo.fallbackImageUrl
                  return
                }
                event.currentTarget.src = `https://placehold.co/400x300/1a1825/FF6B2B?text=${encodeURIComponent(photo.title)}`
              }}
            />
          )}

          <button
            type="button"
            onClick={() => setIsFlipped(true)}
            aria-label={`Show information about ${photo.title}`}
            tabIndex={isFlipped ? -1 : 0}
            style={infoButtonStyle}
          >
            <InfoIcon />
          </button>

          <div style={frontCaptionStyle}>
            <div style={frontTitleStyle}>{photo.title}</div>
            <div style={frontRegionStyle}>{photo.region}</div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleWishlist}
            aria-label={
              isWishlisted
                ? `Remove ${photo.title} from wishlist`
                : `Add ${photo.title} to wishlist`
            }
            aria-pressed={isWishlisted}
            tabIndex={isFlipped ? -1 : 0}
            style={{
              ...frontHeartStyle,
              color: isWishlisted ? '#f472b6' : '#fff',
            }}
          >
            <HeartIcon filled={isWishlisted} />
          </motion.button>
        </div>

        <div
          aria-hidden={!isFlipped}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.12)',
            background: '#0f0e17',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            pointerEvents: isFlipped ? 'auto' : 'none',
          }}
        >
          <img
            src={photo.dayImageUrl || photo.imageUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            style={{
              position: 'absolute',
              inset: '-12px',
              width: 'calc(100% + 24px)',
              height: 'calc(100% + 24px)',
              objectFit: 'cover',
              filter: 'blur(12px) saturate(0.75)',
              opacity: 0.38,
              transform: 'scale(1.05)',
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(9,8,14,0.7)',
              backdropFilter: 'blur(2px)',
            }}
          />

          <div style={backContentStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={backTitleStyle}>{photo.title}</h3>
                <div style={backRegionStyle}>{photo.region}</div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleWishlist}
                aria-label={
                  isWishlisted
                    ? `Remove ${photo.title} from wishlist`
                    : `Add ${photo.title} to wishlist`
                }
                aria-pressed={isWishlisted}
                tabIndex={isFlipped ? 0 : -1}
                style={{
                  ...backHeartStyle,
                  color: isWishlisted ? '#f472b6' : 'rgba(255,255,255,0.86)',
                }}
              >
                <HeartIcon filled={isWishlisted} />
              </motion.button>
            </div>

            <p style={descriptionStyle}>{photo.description}</p>

            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              tabIndex={isFlipped ? 0 : -1}
              style={viewPhotoButtonStyle}
            >
              <BackIcon />
              View photo
            </button>
          </div>
        </div>
      </motion.div>
    </motion.article>
  )
}

const infoButtonStyle = {
  position: 'absolute',
  top: '12px',
  right: '12px',
  width: '38px',
  height: '38px',
  display: 'grid',
  placeItems: 'center',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.42)',
  background: 'rgba(8,7,13,0.58)',
  color: '#fff',
  cursor: 'pointer',
  backdropFilter: 'blur(6px)',
  boxShadow: '0 4px 14px rgba(0,0,0,0.28)',
  zIndex: 4,
}

const frontCaptionStyle = {
  position: 'absolute',
  left: '16px',
  right: '62px',
  bottom: '14px',
  pointerEvents: 'none',
  zIndex: 3,
}

const frontTitleStyle = {
  fontFamily: 'var(--font-display)',
  fontSize: '0.94rem',
  fontWeight: '700',
  color: '#fff',
  lineHeight: 1.2,
  textShadow: '0 2px 5px rgba(0,0,0,0.95), 0 0 14px rgba(0,0,0,0.8)',
}

const frontRegionStyle = {
  marginTop: '3px',
  fontFamily: 'var(--font-body)',
  fontSize: '0.72rem',
  fontWeight: '500',
  color: 'rgba(255,255,255,0.86)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textShadow: '0 2px 4px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.9)',
}

const frontHeartStyle = {
  position: 'absolute',
  right: '10px',
  bottom: '8px',
  width: '44px',
  height: '44px',
  display: 'grid',
  placeItems: 'center',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.95))',
  zIndex: 4,
}

const backContentStyle = {
  position: 'relative',
  zIndex: 1,
  height: '100%',
  padding: '18px',
  display: 'flex',
  flexDirection: 'column',
}

const backTitleStyle = {
  margin: 0,
  fontFamily: 'var(--font-display)',
  fontSize: '1rem',
  lineHeight: 1.2,
  fontWeight: '700',
  color: '#fff',
}

const backRegionStyle = {
  marginTop: '4px',
  fontFamily: 'var(--font-body)',
  fontSize: '0.72rem',
  color: 'rgba(255,255,255,0.62)',
}

const backHeartStyle = {
  width: '44px',
  height: '44px',
  flexShrink: 0,
  display: 'grid',
  placeItems: 'center',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.07)',
  cursor: 'pointer',
}

const descriptionStyle = {
  margin: '14px 0 0',
  fontFamily: 'var(--font-body)',
  fontSize: '0.78rem',
  lineHeight: 1.55,
  color: 'rgba(255,255,255,0.82)',
}

const viewPhotoButtonStyle = {
  marginTop: 'auto',
  alignSelf: 'flex-start',
  minHeight: '36px',
  padding: '7px 10px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '7px',
  borderRadius: '9px',
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.07)',
  color: 'rgba(255,255,255,0.84)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.72rem',
  fontWeight: '600',
  cursor: 'pointer',
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10.5V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
    </svg>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
