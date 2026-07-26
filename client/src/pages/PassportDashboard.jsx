import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { usePassport } from '../context/PassportContext.jsx'
import BadgeCard from '../components/BadgeCard.jsx'
import PassportStamp from '../components/PassportStamp.jsx'
import allBadges from '../data/badges.json'

const LEVEL_COLORS = {
  'Wanderer':     '#64748b',
  'Explorer':     '#38bdf8',
  'Adventurer':   '#8b5cf6',
  'Bharat Yatri': '#d97706',
}

const ERA_INK_COLORS = {
  'ancient':  'rgba(217, 119, 6, 0.75)',
  'medieval': 'rgba(220, 38, 38, 0.75)',
  'freedom':  'rgba(22, 163, 74, 0.75)',
  'modern':   'rgba(2, 132, 199, 0.75)',
}

const PLAYFUL_BLOOD_TYPES = ['UNICORN', 'SHREK', 'TITAN', 'ALIEN']

function getDefaultBloodType(userKey = '') {
  const seed = Array.from(userKey).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  if (seed % 17 === 0) return 'ALIEN'
  return PLAYFUL_BLOOD_TYPES[seed % 3]
}
const bioPaperBg = `
  repeating-linear-gradient(45deg, rgba(56,189,248,0.03) 0, rgba(56,189,248,0.03) 1px, transparent 1px, transparent 10px),
  repeating-linear-gradient(-45deg, rgba(244,114,182,0.02) 0, rgba(244,114,182,0.02) 1px, transparent 1px, transparent 10px),
  #f8fafc
`

const visaPaperBg = `
  linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px),
  #f1f5f9
`

const Watermark = ({ size, top = '50%', opacity = 0.05 }) => (
  <img 
    src="/emblem.svg" alt="" 
    style={{
      position: 'absolute', top, left: '50%',
      transform: 'translate(-50%, -50%)',
      width: `${size}px`, height: 'auto',
      opacity, pointerEvents: 'none', zIndex: 0
    }} 
  />
)

export default function PassportDashboard() {
  const { passport, level } = usePassport()
  const xp = passport.xp || 0
  const identity = passport.identity || {}
  const passportFirstName = identity.firstName?.trim() || level.name
  const passportLastName = identity.lastName?.trim() || 'Wanderer'
  const passportBloodType = identity.bloodType?.trim().toUpperCase() || getDefaultBloodType(identity.clerkUserId)
  const passportCountryCode = identity.countryCode?.trim().toUpperCase() || (passportBloodType === 'ALIEN' ? 'SPC' : 'ERT')
  const mrzFirstName = passportFirstName.toUpperCase().replace(/[^A-Z0-9]/g, '<')
  const mrzLastName = passportLastName.toUpperCase().replace(/[^A-Z0-9]/g, '<')
  const mrzCountry = passportCountryCode.replace(/[^A-Z0-9]/g, '').slice(0, 3).padEnd(3, '<')
  const levelColor = LEVEL_COLORS[level.name] || '#1e3a8a'
  const earnedBadgeIds = new Set(passport.badges.map(b => b.id))

  const [currentPage, setCurrentPage] = useState(0)
  const totalPages = 4
  const [bookState, setBookState] = useState('closed') // 'closed', 'turned', 'open'
  const isOpen = bookState === 'open'

  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      const availableHeight = window.innerHeight - 100
      // Scale based on the 800px height of the open book container, plus padding
      setScale(Math.min(1, availableHeight / 900))
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  const handleOpen = () => {
    setBookState('turned')
    setTimeout(() => {
      setBookState('open')
      setCurrentPage(1)
    }, 800)
  }

  const handleClose = () => {
    setCurrentPage(0)
    setBookState('turned')
    setTimeout(() => {
      setBookState('closed')
    }, 800)
  }

  const handleNext = () => setCurrentPage(p => Math.min(totalPages - 1, p + 1))
  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1))

  const renderCover = () => (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: '#172554',
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: '400px', height: '650px',
        transform: 'translate(-50%, -50%) rotate(90deg)', // Upright when container is rotated -90
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px', color: '#fbbf24',
        boxShadow: 'inset -4px 0 12px rgba(0,0,0,0.4), inset 4px 0 8px rgba(255,255,255,0.1)',
        borderRadius: '12px 4px 4px 12px'
      }}>
        <div style={{ position: 'absolute', left: '12px', top: 0, bottom: 0, width: '6px', background: 'rgba(0,0,0,0.4)', borderRight: '1px solid rgba(255,255,255,0.05)' }} />
        
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: '600', letterSpacing: '0.1em' }}>भारत गणराज्य</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: '800', textAlign: 'center', margin: '4px 0 32px', letterSpacing: '0.05em' }}>
          REPUBLIC OF INDIA
        </h1>
        
        <div style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', display: 'flex', justifyContent: 'center' }}>
          <img src="/emblem.svg" alt="State Emblem of India" style={{ width: '80px', height: 'auto', filter: 'brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(350deg) drop-shadow(0 0 2px rgba(251,191,36,0.5))' }} />
        </div>
        <div style={{ fontSize: '0.6rem', letterSpacing: '0.1em', marginTop: '8px', marginBottom: '32px', color: '#fbbf24' }}>सत्यमेव जयते</div>

        <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.2rem', fontWeight: '600', letterSpacing: '0.2em' }}>पासपोर्ट</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '0.2em', margin: '4px 0 0' }}>
          PASSPORT
        </h2>
      </div>
    </div>
  )

  const renderTopPageContent = () => {
    if (currentPage === 1) {
      return (
        <div style={{
          width: '100%', height: '100%', background: bioPaperBg, borderBottom: '1px solid rgba(0,0,0,0.2)',
          padding: '32px', position: 'relative', overflow: 'hidden',
          boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.1)'
        }}>
          <Watermark size={100} top="40%" opacity={0.06} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', opacity: 0.8, position: 'relative', zIndex: 1 }}>
            <img src="/emblem.svg" alt="Emblem" style={{ width: '60px', height: 'auto', filter: 'opacity(0.8)' }} />
            <div style={{ fontFamily: 'var(--font-body)', color: '#1e3a8a', fontSize: '0.7rem', fontWeight: '600', lineHeight: 1.6, textAlign: 'justify' }}>
              इसके द्वारा, भारत गणराज्य के राष्ट्रपति के नाम पर, उन सब से जिनका इस बात से सरोकार हो, यह प्रार्थना एवं अपेक्षा की जाती है कि वे वाहक को बिना रोक-टोक, आजादी से आने-जाने दें, और उसे हर तरह की ऐसी सहायता और सुरक्षा प्रदान करें जिसकी उसे आवश्यकता हो ।<br/><br/>
              THESE ARE TO REQUEST AND REQUIRE IN THE NAME OF THE PRESIDENT OF THE REPUBLIC OF INDIA ALL THOSE WHOM IT MAY CONCERN TO ALLOW THE BEARER TO PASS FREELY WITHOUT LET OR HINDRANCE, AND TO AFFORD HIM OR HER, EVERY ASSISTANCE AND PROTECTION OF WHICH HE OR SHE MAY STAND IN NEED.
            </div>
          </div>
        </div>
      )
    }
    
    const title = currentPage === 2 ? 'Favourite Destinations' : 'Special Visas'
    const content = currentPage === 2 ? renderWishlistContent()[0] : renderBadgesContent()[0]
    
    return (
      <div style={{ width: '100%', height: '100%', background: visaPaperBg, backgroundSize: '100px 100px', borderBottom: '1px solid rgba(0,0,0,0.15)', position: 'relative', boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.08)' }}>
        <Watermark size={120} opacity={0.05} />
        <div style={{ position: 'absolute', bottom: '12px', width: '100%', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.2em' }}>
          वीजा / VISAS
        </div>
        <div style={{ padding: '24px', height: '100%', position: 'relative', zIndex: 1 }}>
          <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: '700', color: 'rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center' }}>
            {title}
          </h3>
          {content}
        </div>
      </div>
    )
  }

  const renderBottomPageContent = () => {
    if (currentPage === 1) {
      return (
        <div style={{
          width: '100%', height: '100%', background: bioPaperBg, padding: '24px 32px',
          boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden'
        }}>
          <Watermark size={100} top="40%" opacity={0.06} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '2px solid #1e3a8a', paddingBottom: '8px', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '800', color: '#1e3a8a', margin: 0 }}>
              भारत गणराज्य REPUBLIC OF INDIA
            </h2>
          </div>
          
          <div style={{ display: 'flex', gap: '24px', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '130px', height: '170px', border: '1px solid #94a3b8',
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '4rem', opacity: 0.2 }}>👤</div>
            </div>
            
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignContent: 'start', fontFamily: 'var(--font-body)' }}>
              <div><div style={{ fontSize: '0.6rem', color: '#64748b' }}>टाईप / Type</div><div style={{ fontWeight: '700', color: '#1e3a8a' }}>{passportBloodType}</div></div>
              <div><div style={{ fontSize: '0.6rem', color: '#64748b' }}>राष्ट्र कोड / Country Code</div><div style={{ fontWeight: '700', color: '#1e3a8a' }}>{passportCountryCode}</div></div>
              <div style={{ gridColumn: '1 / -1' }}><div style={{ fontSize: '0.6rem', color: '#64748b' }}>उपनाम / Surname</div><div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e3a8a' }}>{passportLastName.toUpperCase()}</div></div>
              <div style={{ gridColumn: '1 / -1' }}><div style={{ fontSize: '0.6rem', color: '#64748b' }}>दिया गया नाम / Given Name(s)</div><div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e3a8a' }}>{passportFirstName.toUpperCase()}</div></div>
              <div><div style={{ fontSize: '0.6rem', color: '#64748b' }}>राष्ट्रीयता / Nationality</div><div style={{ fontWeight: '700', color: '#1e3a8a' }}>INDIAN</div></div>
              <div><div style={{ fontSize: '0.6rem', color: '#64748b' }}>कुल एक्स.पी. / Total XP</div><div style={{ fontWeight: '700', color: '#1e3a8a' }}>{xp}</div></div>
              <div><div style={{ fontSize: '0.6rem', color: '#64748b' }}>जारी करने का स्थान / Place of Issue</div><div style={{ fontWeight: '700', color: '#1e3a8a' }}>CHALO DEKHE BHARAT</div></div>
              <div><div style={{ fontSize: '0.6rem', color: '#64748b' }}>जारी करने की तिथि / Date of Issue</div><div style={{ fontWeight: '700', color: '#1e3a8a' }}>{new Date().toLocaleDateString('en-GB')}</div></div>
            </div>
          </div>
          
          <div style={{
            marginTop: '16px', fontFamily: 'monospace', fontSize: '1.1rem',
            color: '#1e3a8a', letterSpacing: '0.15em', fontWeight: '700', lineHeight: 1.4,
            position: 'relative', zIndex: 1
          }}>
            P&lt;{mrzCountry}{mrzLastName}&lt;&lt;{mrzFirstName}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br/>
            {xp.toString().padStart(8, '0')}&lt;4{mrzCountry}2607264M&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;06
          </div>
        </div>
      )
    }

    const content = currentPage === 2 ? renderWishlistContent()[1] : renderBadgesContent()[1]
    
    return (
      <div style={{ width: '100%', height: '100%', background: visaPaperBg, backgroundSize: '100px 100px', position: 'relative', boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.08)' }}>
        <Watermark size={120} opacity={0.05} />
        <div style={{ position: 'absolute', bottom: '12px', width: '100%', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.2em' }}>
          वीजा / VISAS
        </div>
        <div style={{ padding: '24px', height: '100%', position: 'relative', zIndex: 1 }}>
          {content}
        </div>
      </div>
    )
  }

  const renderWishlistContent = () => {
    if (!passport.wishlist || passport.wishlist.length === 0) {
      return [<div key="1" style={{textAlign: 'center', color: '#94a3b8', marginTop: '40px'}}>No favourites yet. Add destinations to your wishlist!</div>, <div key="2"/>]
    }
    
    const topWishlist = passport.wishlist.slice(0, 4)
    const bottomWishlist = passport.wishlist.slice(4, 8)

    const renderList = (items) => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '16px' }}>
        {items.map((item, i) => (
          <div key={item.id} style={{
            background: '#fff', padding: '8px', paddingBottom: '24px', borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
            transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (2 + Math.random() * 3)}deg)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <div style={{ 
              width: '100%', height: '90px', background: '#e2e8f0', 
              backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', 
              borderRadius: '2px', border: '1px solid rgba(0,0,0,0.05)'
            }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: '700', color: '#1e3a8a', marginTop: '12px', textAlign: 'center' }}>
              {item.title}
            </div>
          </div>
        ))}
      </div>
    )
    return [renderList(topWishlist), renderList(bottomWishlist)]
  }

  const renderBadgesContent = () => {
    const renderList = (badgesChunk, startIndex) => (
      <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px' }}>
        {badgesChunk.map((badge, i) => {
          const earned = earnedBadgeIds.has(badge.id)
          return (
            <PassportStamp 
              key={badge.id} 
              badge={badge} 
              index={startIndex + i} 
              earned={earned} 
            />
          )
        })}
      </div>
    )
    return [renderList(allBadges.slice(0, 6), 0), renderList(allBadges.slice(6, 12), 6)]
  }

  return (
    <div className="indian-motif-bg" style={{
      height: 'calc(100vh - 64px)', background: 'var(--color-deep-900)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', overflow: 'hidden', position: 'relative'
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(255,107,43,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <AnimatePresence>
        {bookState === 'closed' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            onClick={handleOpen}
            style={{
              position: 'absolute', top: '50px', zIndex: 50,
              padding: '12px 32px', background: 'var(--color-terracotta-500)', border: 'none', color: '#fff',
              borderRadius: '999px', fontFamily: 'var(--font-display)', fontSize: '1rem',
              fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(204,78,54,0.4)'
            }}
          >
            Open Passport
          </motion.button>
        )}
      </AnimatePresence>

      <div style={{
        position: 'relative', width: '800px', height: '800px',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        transition: 'transform 0.3s'
      }}>
        
        {/* The 3D Book */}
        <motion.div
          animate={{
            rotateZ: bookState === 'closed' ? -90 : 0,
            y: bookState === 'open' ? 200 : 0
          }}
          transition={{ duration: 0.6, type: 'tween', ease: 'easeInOut' }}
          style={{
            width: '650px', height: '400px',
            position: 'relative', perspective: '2500px',
            zIndex: 10
          }}
        >
          {/* Bottom Half (Identity / Visa Page) */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: '#cbd5e1', padding: '0 2px 2px 2px',
            borderRadius: '0 0 12px 12px',
            boxShadow: bookState === 'open' ? '0 25px 50px -12px rgba(0,0,0,0.5)' : 'none',
            transition: 'box-shadow 0.6s'
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
              <AnimatePresence mode="wait">
                {currentPage > 0 && (
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ width: '100%', height: '100%' }}
                  >
                    {renderBottomPageContent()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Top Half (Cover / Preamble) */}
          <motion.div
            animate={{ rotateX: bookState === 'open' ? 180 : 0 }}
            transition={{ duration: 0.8, type: 'tween', ease: 'easeInOut', delay: bookState === 'open' ? 0.2 : 0 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 10,
              transformOrigin: 'top center', transformStyle: 'preserve-3d'
            }}
          >
            {/* Front Face: The Cover */}
            <div style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              borderRadius: '12px 12px 12px 12px', overflow: 'hidden',
              boxShadow: bookState === 'closed' ? '-20px 0 40px rgba(0,0,0,0.5)' : 'none',
            }}>
              {renderCover()}
            </div>

            {/* Back Face: The Top Page (Preamble/Visas) */}
            <div style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
              background: '#cbd5e1', padding: '2px 2px 0 2px',
              borderRadius: '12px 12px 0 0', overflow: 'hidden'
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '10px 10px 0 0', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                  {currentPage > 0 && (
                    <motion.div
                      key={currentPage}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ width: '100%', height: '100%' }}
                    >
                      {renderTopPageContent()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

        </motion.div>

        {/* Page Indicators positioned precisely at the bottom of the 800x800 bounding box */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              style={{ 
                position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', zIndex: 50,
                display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.4)', padding: '12px 24px',
                borderRadius: '999px', backdropFilter: 'blur(10px)'
              }}
            >
              {[1, 2, 3].map(page => (
                <div key={page} style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: currentPage === page ? '#FF6B2B' : 'rgba(255,255,255,0.3)',
                  boxShadow: currentPage === page ? '0 0 10px #FF6B2B' : 'none',
                  transition: 'background 0.3s'
                }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              onClick={handleClose}
              style={{
                position: 'absolute', bottom: '40px', right: '40px', zIndex: 50,
                padding: '12px 24px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontFamily: 'var(--font-display)', cursor: 'pointer',
                backdropFilter: 'blur(10px)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                fontWeight: '600'
              }}
            >
              Close
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              onClick={handlePrev}
              disabled={currentPage <= 1}
              style={{
                position: 'absolute', top: '50%', left: '40px', transform: 'translateY(-50%)', zIndex: 50,
                padding: '16px 24px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.2rem',
                cursor: currentPage <= 1 ? 'default' : 'pointer',
                opacity: currentPage <= 1 ? 0.3 : 1,
                backdropFilter: 'blur(10px)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              ← Prev
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              onClick={handleNext}
              disabled={currentPage >= totalPages - 1}
              style={{
                position: 'absolute', top: '50%', right: '40px', transform: 'translateY(-50%)', zIndex: 50,
                padding: '16px 24px', borderRadius: '12px',
                background: currentPage < totalPages - 1 ? 'var(--color-terracotta-500)' : 'rgba(255,255,255,0.1)',
                border: `1px solid ${currentPage < totalPages - 1 ? 'var(--color-terracotta-500)' : 'rgba(255,255,255,0.2)'}`,
                color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: '700',
                cursor: currentPage < totalPages - 1 ? 'pointer' : 'default',
                opacity: currentPage < totalPages - 1 ? 1 : 0.3,
                boxShadow: currentPage < totalPages - 1 ? '0 8px 20px rgba(204,78,54,0.4)' : '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              Next →
            </motion.button>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
