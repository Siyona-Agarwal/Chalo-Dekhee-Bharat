import React, { useMemo, useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePassport } from '../../context/PassportContext.jsx'
import statePages from '../../data/statePages.json'
import indiaMapData from '../../data/indiaMapData.js'

const AttractionCard = ({ attr, i }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: i * 0.1 }} 
      style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <h3 style={{ margin: '0 0 5px', color: '#fff' }}>{attr.name}</h3>
      <p style={{ margin: '0 0 15px', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>📍 {attr.city}</p>
      
      <p style={{ 
        margin: 0, 
        color: 'rgba(255,255,255,0.8)', 
        fontSize: '0.95rem', 
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {attr.description}
      </p>
    </motion.div>
  )
}

export default function StateDetail() {
  const { stateId } = useParams()
  const navigate = useNavigate()
  const { passport } = usePassport()

  // Fallback to empty if state is not found
  const stateData = useMemo(() => {
    const decodedId = decodeURIComponent(stateId).toLowerCase()
    return statePages.find(s => s.id === decodedId || s.name.toLowerCase() === decodedId) || null
  }, [stateId])

  const hasExplored = useMemo(() => {
    if (!stateData) return false
    const inVisited = passport.visitedStates.includes(stateData.id)
    const inWishlist = passport.wishlist.some(w => w.region?.toLowerCase().includes(stateData.name.toLowerCase()))
    const hasStamps = passport.stamps.some(s => s.name?.toLowerCase().includes(stateData.name.toLowerCase()) || s.eraId?.toLowerCase().includes(stateData.id))
    return inVisited || inWishlist || hasStamps
  }, [stateData, passport])

  const pathRef = useRef(null)
  const [viewBox, setViewBox] = useState(indiaMapData.viewBox)

  useEffect(() => {
    if (pathRef.current) {
      try {
        const bbox = pathRef.current.getBBox()
        if (bbox.width && bbox.height) {
          const padX = bbox.width * 0.15
          const padY = bbox.height * 0.15
          setViewBox(`${bbox.x - padX} ${bbox.y - padY} ${bbox.width + padX * 2} ${bbox.height + padY * 2}`)
        }
      } catch (e) {
        // Fallback if getBBox fails (e.g. in some SSR setups)
      }
    }
  }, [stateData])

  if (!stateData) {
    return (
      <div style={{ minHeight: '100vh', padding: '100px 24px', textAlign: 'center', color: '#fff', background: 'var(--color-deep-900)' }}>
        <h2>State Not Found</h2>
        <p>We are still gathering information about this beautiful state.</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', background: 'var(--color-saffron-500)', border: 'none', color: '#fff' }}>Back to Map</button>
      </div>
    )
  }

  const currentLoc = indiaMapData.locations.find(loc => loc.name.toLowerCase() === stateData.name.toLowerCase())

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-deep-900)', color: '#fff', paddingBottom: '80px' }} className="indian-motif-bg">
      <div style={{ 
        position: 'relative', 
        padding: '120px 24px 80px', 
        backgroundImage: `linear-gradient(to bottom, rgba(15,14,23,0.3) 0%, rgba(15,14,23,0.8) 70%, rgba(15,14,23,1) 100%), url(${stateData.heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
          
          {/* Maps Container */}
          <div style={{ display: 'flex', gap: '20px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            {/* Full India Context Map */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.5 }}
              style={{ width: '150px', flexShrink: 0 }}
            >
              <h3 style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 10px', textAlign: 'center' }}>INDIA</h3>
              <svg viewBox={indiaMapData.viewBox} style={{ width: '100%', height: 'auto', opacity: 0.8 }}>
                {indiaMapData.locations.map((loc) => {
                  const isSelected = loc.name.toLowerCase() === stateData.name.toLowerCase()
                  return (
                    <path
                      key={loc.id}
                      d={loc.path}
                      fill={isSelected ? 'rgba(255,107,43,0.9)' : 'rgba(255,255,255,0.2)'}
                      stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.1)'}
                      strokeWidth={isSelected ? 3 : 1}
                    />
                  )
                })}
              </svg>
            </motion.div>

            {/* Isolated State Map */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ width: '200px', flexShrink: 0, borderLeft: '1px dashed rgba(255,255,255,0.1)', paddingLeft: '20px' }}
            >
              <h3 style={{ fontSize: '0.9rem', color: 'rgba(255,107,43,0.8)', margin: '0 0 10px', textAlign: 'center', textTransform: 'uppercase' }}>{stateData.name}</h3>
              {currentLoc && (
                <svg viewBox={viewBox} style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.5))' }}>
                  <path
                    ref={pathRef}
                    d={currentLoc.path}
                    fill="rgba(255,107,43,0.8)"
                    stroke="#fff"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              )}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', margin: '0 0 10px', color: 'var(--color-saffron-400)' }}>
              {stateData.name}
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', margin: 0 }}>{stateData.tagline}</p>
          </motion.div>
        </div>
      </div>

      {hasExplored && (
        <div style={{ maxWidth: '800px', margin: '0 auto 40px', padding: '15px 24px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '12px', textAlign: 'center' }}>
          <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>🌟</span>
          <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>You've already explored this area!</span>
          <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{stateData.passportTieIn}</p>
        </div>
      )}

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-terracotta-400)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Top Attractions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {stateData.topAttractions.map((attr, i) => (
            <AttractionCard key={i} attr={attr} i={i} />
          ))}
        </div>

        <div style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-saffron-400)', marginBottom: '20px' }}>Plan Your Trip</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '2rem' }}>🌡️</span>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 'bold' }}>Best Time</div>
                  <div style={{ fontWeight: '500' }}>{stateData.bestTimeToVisit}</div>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '2rem' }}>🎉</span>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 'bold' }}>Festival</div>
                  <div style={{ fontWeight: '500' }}>{stateData.relatedFestival}</div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '10px' }}>Signature Foods 🍲</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {stateData.signatureFood.map((food, i) => (
                  <span key={i} style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '500', border: '1px solid rgba(251,191,36,0.3)' }}>
                    {food}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.2)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', color: '#a78bfa', marginTop: 0 }}>Hidden Gem 💎</h2>
            <h3 style={{ margin: '0 0 10px' }}>{stateData.hiddenGem.name}</h3>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{stateData.hiddenGem.description}</p>
          </div>
        </div>

        <div style={{ marginTop: '50px', padding: '30px', background: 'rgba(56,189,248,0.05)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(56,189,248,0.2)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: '#38bdf8', marginTop: 0 }}>Cultural Fact</h2>
          <p style={{ fontSize: '1.2rem', fontStyle: 'italic', margin: 0 }}>"{stateData.culturalFact}"</p>
        </div>
      </div>
    </div>
  )
}
