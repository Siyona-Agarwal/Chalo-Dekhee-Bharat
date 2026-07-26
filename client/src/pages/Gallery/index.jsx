import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePassport } from '../../context/PassportContext.jsx'
import galleryData from '../../data/gallery.json'
import DayNightSlider from './DayNightSlider.jsx'

const CATEGORIES = ['All', 'Heritage', 'Nature', 'Wildlife', 'Food', 'Festivals']

// Ambient sound URLs (royalty-free / silent placeholder)
// NOTE: Using silent audio data URIs as placeholder. Replace with real royalty-free
// audio files in /client/src/assets/audio/ before production.
// A real implementation would crossfade Howler.js instances per category.
const AMBIENT_SOUNDS = {
  Heritage:  null, // e.g. '/assets/audio/ambient-heritage.mp3'
  Nature:    null,
  Wildlife:  null,
  Food:      null,
  Festivals: null,
}

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [bookmarkedId, setBookmarkedId] = useState(null)
  const [isMuted, setIsMuted] = useState(true) // Default muted per good UX practice
  const { passport, addToWishlist, removeFromWishlist } = usePassport()

  const audioRef = useRef(null)

  // Filter photos
  const photos = activeCategory === 'All'
    ? galleryData
    : galleryData.filter(p => p.category === activeCategory)

  // Crossfade ambient audio on category change
  useEffect(() => {
    const src = AMBIENT_SOUNDS[activeCategory]
    if (!src || isMuted) return
    // NOTE: With real audio files, use Howler.js for smooth crossfade.
    // Current implementation: placeholder for when assets are available.
  }, [activeCategory, isMuted])

  const isWishlisted = (photo) => passport.wishlist.some(w => w.id === photo.id)

  const toggleWishlist = (photo) => {
    if (isWishlisted(photo)) {
      removeFromWishlist(photo.id)
    } else {
      addToWishlist({
        id: photo.id,
        title: photo.title,
        imageUrl: photo.imageUrl,
        region: photo.region,
        category: photo.category,
      })
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-deep-900)' }}>

      {/* Hero */}
      <div style={{
        position: 'relative', padding: '72px 24px 48px',
        textAlign: 'center', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 40% 40%, rgba(245,158,11,0.09) 0%, transparent 55%), radial-gradient(ellipse at 70% 70%, rgba(56,189,248,0.07) 0%, transparent 50%)',
        }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🖼️</span>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 4vw, 2.8rem)',
            fontWeight: '900', color: '#fff', margin: '0 0 12px',
          }}>
            Interactive Photo Gallery
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)', maxWidth: '480px',
            margin: '0 auto 24px', lineHeight: 1.7,
          }}>
            Discover India's visual soul — Heritage, Nature, Wildlife, Food, and Festivals.
            Toggle <span style={{ color: '#fbbf24', fontWeight: '600' }}>Day/Night</span> views, and
            <span style={{ color: '#f472b6', fontWeight: '600' }}> bookmark</span> destinations to your Passport.
          </p>

          {/* Audio control */}
          <button
            onClick={() => setIsMuted(m => !m)}
            aria-label={isMuted ? 'Unmute ambient sound' : 'Mute ambient sound'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '999px', padding: '6px 16px',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'var(--font-body)', fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            {isMuted ? '🔇 Sound Off' : '🔊 Sound On'}
          </button>
        </motion.div>
      </div>

      {/* Category tabs */}
      <div style={{
        position: 'sticky', top: '64px', zIndex: 100,
        background: 'rgba(15,14,23,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', gap: '4px',
          overflowX: 'auto', padding: '12px 0',
          scrollbarWidth: 'none',
        }}>
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              aria-pressed={activeCategory === cat}
              style={{
                padding: '7px 18px',
                borderRadius: '10px',
                border: 'none',
                background: activeCategory === cat
                  ? 'linear-gradient(135deg, #FF6B2B, #f59e0b)'
                  : 'rgba(255,255,255,0.06)',
                color: activeCategory === cat ? '#fff' : 'rgba(255,255,255,0.55)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.87rem',
                fontWeight: activeCategory === cat ? '700' : '400',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {cat === 'All' && '✨ '}
              {cat === 'Heritage' && '🏛️ '}
              {cat === 'Nature' && '🌿 '}
              {cat === 'Wildlife' && '🐯 '}
              {cat === 'Food' && '🍛 '}
              {cat === 'Festivals' && '🎊 '}
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Photo masonry grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            style={{
              columns: 'auto 300px',
              columnGap: '20px',
            }}
          >
            {photos.map((photo, i) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={i}
                isWishlisted={isWishlisted(photo)}
                onToggleWishlist={() => toggleWishlist(photo)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {photos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>
            No photos in this category yet.
          </div>
        )}
      </div>
    </div>
  )
}

/* ── PhotoCard ─────────────────────────────────────────────────── */
function PhotoCard({ photo, index, isWishlisted, onToggleWishlist }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: (index % 6) * 0.07, duration: 0.5 }}
      style={{
        breakInside: 'avoid',
        marginBottom: '20px',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Day/Night slider (only for photos with both images) */}
      {photo.hasDayNight && photo.nightImageUrl ? (
        <DayNightSlider
          dayUrl={photo.dayImageUrl}
          nightUrl={photo.nightImageUrl}
          alt={photo.title}
        />
      ) : (
        /* Regular image with zoom on hover */
        <div style={{
          width: '100%', overflow: 'hidden',
          position: 'relative',
        }}>
          <motion.img
            src={photo.imageUrl}
            alt={photo.title}
            loading="lazy"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ width: '100%', display: 'block', objectFit: 'cover' }}
            onError={e => {
              e.target.src = `https://placehold.co/400x300/1a1825/FF6B2B?text=${encodeURIComponent(photo.title)}`
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(15,14,23,0.75) 0%, transparent 55%)',
          }} />
        </div>
      )}

      {/* Caption overlay — appears on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(15,14,23,0.92) 0%, rgba(15,14,23,0.3) 60%, transparent 100%)',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '16px',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '1rem',
              fontWeight: '700', color: '#fff', marginBottom: '4px',
            }}>
              {photo.title}
            </div>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.55)',
            }}>
              📍 {photo.region}
            </div>
            {photo.description && (
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.45)', marginTop: '6px',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {photo.description}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible bottom info bar */}
      <div style={{
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '8px',
        background: 'rgba(15,14,23,0.6)',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '0.92rem',
            fontWeight: '600', color: '#fff',
          }}>
            {photo.title}
          </div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.4)', marginTop: '2px',
          }}>
            {photo.region}
          </div>
        </div>

        {/* Bookmark button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={onToggleWishlist}
          aria-label={isWishlisted ? `Remove ${photo.title} from wishlist` : `Add ${photo.title} to wishlist`}
          aria-pressed={isWishlisted}
          style={{
            background: isWishlisted ? 'rgba(244,114,182,0.15)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isWishlisted ? 'rgba(244,114,182,0.4)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: '8px',
            color: isWishlisted ? '#f472b6' : 'rgba(255,255,255,0.4)',
            padding: '7px 10px',
            fontSize: '1rem',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </motion.button>
      </div>
    </motion.div>
  )
}
