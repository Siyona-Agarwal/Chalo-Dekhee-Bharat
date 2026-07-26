import React, { useEffect, useState, useRef } from 'react'
import { Howl, Howler } from 'howler'
import { AnimatePresence, motion } from 'framer-motion'
import { usePassport } from '../../context/PassportContext.jsx'
import galleryData from '../../data/gallery.json'
import DayNightSlider from './DayNightSlider.jsx'
import PhotoCard from './PhotoCard.jsx'

const CATEGORIES = ['All', 'Heritage', 'Nature', 'Wildlife', 'Food', 'Festivals']

const AMBIENT_SOUNDS = {
  Heritage: 'https://actions.google.com/sounds/v1/ambiences/warm_afternoon_outdoors.ogg',
  Nature: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg',
  Wildlife: 'https://actions.google.com/sounds/v1/ambiences/jungle_atmosphere_morning.ogg',
  Food: 'https://actions.google.com/sounds/v1/ambiences/small_outdoor_marketplace.ogg',
  Festivals: 'https://actions.google.com/sounds/v1/ambiences/carnival_atmosphere.ogg',
}

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [isMuted, setIsMuted] = useState(true)
  const { passport, addToWishlist, removeFromWishlist } = usePassport()

  const photos = activeCategory === 'All'
    ? galleryData
    : galleryData.filter((photo) => photo.category === activeCategory)

  const currentHowlRef = useRef(null)

  // Mute/Unmute toggle
  useEffect(() => {
    Howler.mute(isMuted)
  }, [isMuted])

  // Handle category change crossfade
  useEffect(() => {
    const src = AMBIENT_SOUNDS[activeCategory]
    const oldHowl = currentHowlRef.current

    // Don't re-trigger if same sound
    if (oldHowl && oldHowl._src === src) return

    const newHowl = src ? new Howl({
      src: [src],
      loop: true,
      volume: 0,
      html5: true, // Use HTML5 Audio to avoid preloading entire ambient tracks
    }) : null

    // Crossfade out the old sound
    if (oldHowl) {
      oldHowl.fade(1.0, 0, 1000)
      setTimeout(() => oldHowl.unload(), 1000)
    }

    // Crossfade in the new sound
    if (newHowl) {
      // Need to save the original src in case we want to check it later, 
      // though _src is an internal Howler property, we can assign it securely:
      newHowl._src = src 
      newHowl.play()
      newHowl.fade(0, 1.0, 1000)
    }

    currentHowlRef.current = newHowl
  }, [activeCategory])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Howler.unload() // Stop and unload all sounds when leaving Gallery
    }
  }, [])

  const isWishlisted = (photo) => passport.wishlist.some((item) => item.id === photo.id)

  const toggleWishlist = (photo) => {
    if (isWishlisted(photo)) {
      removeFromWishlist(photo.id)
      return
    }

    addToWishlist({
      id: photo.id,
      title: photo.title,
      imageUrl: photo.imageUrl,
      region: photo.region,
      category: photo.category,
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-deep-900)' }} className="indian-motif-bg">

      {/* Hero */}
      <div style={{
        position: 'relative', padding: '72px 24px 48px',
        textAlign: 'center', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 40% 40%, rgba(245,158,11,0.09) 0%, transparent 55%), radial-gradient(ellipse at 70% 70%, rgba(56,189,248,0.07) 0%, transparent 50%)',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🖼️</span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.9rem, 4vw, 2.8rem)',
              fontWeight: '900',
              color: '#fff',
              margin: '0 0 12px',
            }}
          >
            Interactive Photo Gallery
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '480px',
              margin: '0 auto 24px',
              lineHeight: 1.7,
            }}
          >
            Discover India&apos;s visual soul - Heritage, Nature, Wildlife, Food, and Festivals.
            Toggle <span style={{ color: '#fbbf24', fontWeight: '600' }}>Day/Night</span> views, and
            <span style={{ color: '#f472b6', fontWeight: '600' }}> bookmark</span> destinations to your Passport.
          </p>

          <button
            onClick={() => setIsMuted((muted) => !muted)}
            aria-label={isMuted ? 'Unmute ambient sound' : 'Mute ambient sound'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '999px',
              padding: '6px 16px',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            {isMuted ? '🔇 Sound Off' : '🔊 Sound On'}
          </button>
        </motion.div>
      </div>

      <div
        style={{
          position: 'sticky',
          top: '64px',
          zIndex: 100,
          background: 'rgba(15,14,23,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            gap: '4px',
            overflowX: 'auto',
            padding: '12px 0',
            scrollbarWidth: 'none',
          }}
        >
          {CATEGORIES.map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              aria-pressed={activeCategory === category}
              style={{
                padding: '7px 18px',
                borderRadius: '10px',
                border: 'none',
                background: activeCategory === category
                  ? 'linear-gradient(135deg, var(--color-terracotta-500), var(--color-saffron-500))'
                  : 'rgba(255,255,255,0.06)',
                color: activeCategory === category ? '#fff' : 'rgba(255,255,255,0.55)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.87rem',
                fontWeight: activeCategory === category ? '700' : '400',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {category === 'All' && '✨ '}
              {category === 'Heritage' && '🏛️ '}
              {category === 'Nature' && '🌿 '}
              {category === 'Wildlife' && '🐯 '}
              {category === 'Food' && '🍛 '}
              {category === 'Festivals' && '🎊 '}
              {category}
            </motion.button>
          ))}
        </div>
      </div>

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
            {photos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={index}
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

function LegacyPhotoCard({ photo, index, isWishlisted, onToggleWishlist }) {
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
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
    >
      {photo.hasDayNight && photo.nightImageUrl ? (
        <DayNightSlider
          dayUrl={photo.dayImageUrl}
          nightUrl={photo.nightImageUrl}
          alt={photo.title}
        />
      ) : (
        <div
          style={{
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <motion.img
            src={photo.imageUrl}
            alt={photo.title}
            loading="lazy"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ width: '100%', display: 'block', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = `https://placehold.co/400x300/1a1825/cc4e36?text=${encodeURIComponent(photo.title)}`
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15,14,23,0.75) 0%, transparent 55%)',
            }}
          />
        </div>
      )}

      <motion.div
        aria-hidden="true"
        animate={{ opacity: hovered ? 1 : 0.78 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '52%',
          background:
            'linear-gradient(to top, rgba(9,8,14,0.9) 0%, rgba(9,8,14,0.42) 52%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <motion.div
        animate={{
          y: hovered && photo.description ? -42 : 0,
          backgroundColor: hovered ? 'rgba(15,14,23,0.66)' : 'rgba(15,14,23,0.58)',
        }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          left: '12px',
          right: '12px',
          bottom: '12px',
          minHeight: '54px',
          padding: '9px 10px 9px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          background: 'rgba(15,14,23,0.58)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          overflow: 'hidden',
          zIndex: 3,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.92rem',
              fontWeight: '600',
              color: '#fff',
            }}
          >
            {photo.title}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {photo.region}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={onToggleWishlist}
          aria-label={
            isWishlisted
              ? `Remove ${photo.title} from wishlist`
              : `Add ${photo.title} to wishlist`
          }
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
      </motion.div>

      {photo.description && (
        <motion.p
          initial={false}
          animate={{
            opacity: hovered ? 1 : 0,
            y: hovered ? 0 : 6,
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: '24px',
            right: '24px',
            bottom: '15px',
            height: '34px',
            margin: 0,
            fontFamily: 'var(--font-body)',
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.76)',
            lineHeight: 1.45,
            textShadow: '0 1px 8px rgba(0,0,0,0.9)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {photo.description}
        </motion.p>
      )}
    </motion.div>
  )
}
