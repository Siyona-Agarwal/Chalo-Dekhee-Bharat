import React, { useEffect, useState, useRef } from 'react'
import { Howl, Howler } from 'howler'
import { motion } from 'framer-motion'
import { usePassport } from '../../context/PassportContext.jsx'
import galleryData from '../../data/gallery.json'
import DayNightSlider from './DayNightSlider.jsx'
import PhotoCard from './PhotoCard.jsx'
import Icon from '../../components/Icon.jsx'

const CATEGORIES = ['Heritage', 'Nature', 'Wildlife', 'Food', 'Festivals']

const CATEGORY_META = {
  Heritage: { icon: 'museum', color: '#f59e0b', description: 'Monuments, architecture, and living history.' },
  Nature: { icon: 'nature', color: '#4ade80', description: 'Landscapes shaped by light, water, and time.' },
  Wildlife: { icon: 'wildlife', color: '#fbbf24', description: 'India’s wild places and their inhabitants.' },
  Food: { icon: 'food', color: '#fb923c', description: 'Regional flavours served with a sense of place.' },
  Festivals: { icon: 'celebration', color: '#f472b6', description: 'Colour, light, and celebrations across Bharat.' },
}

const AMBIENT_SOUNDS = {
  Heritage: 'https://actions.google.com/sounds/v1/ambiences/warm_afternoon_outdoors.ogg',
  Nature: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg',
  Wildlife: 'https://actions.google.com/sounds/v1/ambiences/jungle_atmosphere_morning.ogg',
  Food: 'https://actions.google.com/sounds/v1/ambiences/small_outdoor_marketplace.ogg',
  Festivals: 'https://actions.google.com/sounds/v1/ambiences/carnival_atmosphere.ogg',
}

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('Heritage')
  const { passport, addToWishlist, removeFromWishlist } = usePassport()
  const activeMeta = CATEGORY_META[activeCategory]
  const photos = galleryData.filter((photo) => photo.category === activeCategory)

  const currentHowlRef = useRef(null)

  // Handle category change crossfade
  useEffect(() => {
    Howler.mute(false)
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
      newHowl.fade(0, 0.18, 1000)
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
        minHeight: '390px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundImage: "linear-gradient(180deg, rgba(15,14,23,0.34) 0%, rgba(15,14,23,0.62) 58%, var(--color-deep-900) 100%), url('/images/gallery/gallery-hero.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
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
          <span style={{ display: 'block', marginBottom: '12px' }}><Icon name="gallery" size={48} /></span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
              fontWeight: '900',
              color: '#fff',
              margin: '0 0 8px',
              letterSpacing: '0.5px',
            }}
          >
            Bharat Chitrashala
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'rgba(255, 255, 255, 0.75)',
              margin: 0,
              fontWeight: '500',
            }}
          >
            Visual Heritage & Interactive Gallery of India
          </p>
        </motion.div>
      </div>

      <nav aria-label="Gallery categories" style={{ position: 'sticky', top: '64px', zIndex: 100, background: 'rgba(15,14,23,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '10px', justifyContent: 'center', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category]
            const selected = activeCategory === category
            return (
              <button key={category} type="button" onClick={() => setActiveCategory(category)} aria-pressed={selected} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px', padding: '9px 18px', borderRadius: '11px', border: `1px solid ${selected ? `${meta.color}66` : 'rgba(255,255,255,0.08)'}`, background: selected ? `${meta.color}22` : 'rgba(255,255,255,0.04)', color: selected ? '#fff' : 'rgba(255,255,255,0.58)', fontFamily: 'var(--font-body)', fontSize: '0.86rem', fontWeight: selected ? '700' : '500', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                <Icon name={meta.icon} size={16} /> {category}
              </button>
            )
          })}
        </div>
      </nav>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '72px 24px 96px' }}>
        <section aria-labelledby={`gallery-${activeCategory.toLowerCase()}`}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${activeMeta.color}33` }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: activeMeta.color, marginBottom: '8px' }}><Icon name={activeMeta.icon} size={20} /><span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: '700' }}>Gallery section</span></div>
              <h2 id={`gallery-${activeCategory.toLowerCase()}`} style={{ margin: 0, color: '#fff', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.55rem, 3vw, 2.1rem)', fontWeight: '800' }}>{activeCategory}</h2>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>{activeMeta.description}</p>
            </div>
            <span style={{ flexShrink: 0, color: activeMeta.color, fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>{photos.length} {photos.length === 1 ? 'story' : 'stories'}</span>
          </div>
          <motion.div key={activeCategory} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
            {photos.map((photo, index) => <PhotoCard key={photo.id} photo={photo} index={index} isWishlisted={isWishlisted(photo)} onToggleWishlist={() => toggleWishlist(photo)} />)}
          </motion.div>
        </section>
      </main>
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
          <Icon name="heart" size={17} />
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
