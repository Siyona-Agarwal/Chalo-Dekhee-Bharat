import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePassport } from '../../context/PassportContext.jsx'
import { useXP } from '../../hooks/useXP.js'
import { generateItinerary } from '../../services/api.js'
import { formatINR } from '../../utils/index.js'
import badges from '../../data/badges.json'
import destinations from '../../data/destinations.json'

const STYLES = ['Cultural', 'Adventure', 'Relaxation', 'Food & Culinary', 'Wildlife & Nature', 'Spiritual']
const BUDGETS = ['Budget', 'Comfort', 'Luxury']
const INTERESTS = ['History', 'Architecture', 'Food', 'Nature', 'Wildlife', 'Festivals', 'Art & Craft', 'Yoga & Wellness', 'Photography', 'Adventure Sports']

const BUDGET_EMOJI = { Budget: '💰', Comfort: '✈️', Luxury: '💎' }

export default function Planner() {
  const { passport, addToWishlist, savePlannerResult, addBadge } = usePassport()
  const { addXP } = useXP()

  const [form, setForm] = useState({
    destination: '',
    days: 3,
    budget: 'Comfort',
    style: 'Cultural',
    interests: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const resultRef = useRef(null)

  const destInfo = destinations.find(d =>
    d.name.toLowerCase() === form.destination.toLowerCase()
  )

  const handleInterestToggle = (interest) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter(i => i !== interest)
        : [...f.interests, interest],
    }))
  }

  const handleGenerate = async () => {
    if (!form.destination.trim()) { setError('Please enter a destination.'); return }
    if (form.days < 1 || form.days > 14) { setError('Days must be between 1 and 14.'); return }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const passportContext = {
        xp: passport.xp,
        badges: passport.badges.map(b => b.name),
        stamps: passport.stamps.map(s => s.name),
        wishlist: passport.wishlist.map(w => w.title),
        visitedStates: passport.visitedStates,
      }

      // Input sanitised in api.js and server-side
      const data = await generateItinerary({
        destination: form.destination.trim().slice(0, 100),
        days: Number(form.days),
        budget: form.budget,
        style: form.style,
        interests: form.interests.slice(0, 10),
        passportContext,
      })

      setResult(data)

      // Save to Passport
      savePlannerResult({
        id: Date.now().toString(),
        destination: form.destination.trim(),
        days: Number(form.days),
        budget: form.budget,
        style: form.style,
        generatedAt: new Date().toISOString(),
        summary: data.summary || '',
      })

      // Award XP + Grand Traveller badge on first itinerary
      addXP(40, 'AI Itinerary Generated!')
      if (passport.plannerHistory.length === 0) {
        const grandTravellerBadge = badges.find(b => b.id === 'badge-010')
        if (grandTravellerBadge && !passport.badges.find(b => b.id === 'badge-010')) {
          addBadge(grandTravellerBadge)
        }
      }

      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    } catch (err) {
      // Safe error message — never expose stack trace to UI
      setError(err.message === 'fetch failed' ? 'Could not reach the server. Is it running?' : (err.message || 'Something went wrong. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-deep-900)' }}>
      {/* Hero */}
      <div style={{ position: 'relative', padding: '72px 24px 56px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 40% 50%, rgba(56,189,248,0.10) 0%, transparent 55%)' }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🤖</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', fontWeight: '900', color: '#fff', margin: '0 0 12px' }}>
            AI Travel Planner
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'rgba(255,255,255,0.5)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            Your <span style={{ color: '#38bdf8', fontWeight: '600' }}>Passport history</span> personalises the AI — stamps, wishlist, and XP all bias your itinerary.
          </p>
        </motion.div>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px 80px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Passport context preview */}
        {(passport.stamps.length > 0 || passport.wishlist.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(56,189,248,0.06)',
              border: '1px solid rgba(56,189,248,0.18)',
              borderRadius: '14px', padding: '16px 20px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              🎒 Your Passport influences this itinerary
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {passport.stamps.map(s => (
                <span key={s.eraId} style={{ padding: '3px 10px', borderRadius: '999px', background: 'rgba(255,107,43,0.12)', border: '1px solid rgba(255,107,43,0.2)', fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#FF6B2B' }}>
                  🪬 {s.name}
                </span>
              ))}
              {passport.wishlist.map(w => (
                <span key={w.id} style={{ padding: '3px 10px', borderRadius: '999px', background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.2)', fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#f472b6' }}>
                  ❤️ {w.title}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: '32px',
            display: 'flex', flexDirection: 'column', gap: '22px',
          }}
        >
          {/* Destination */}
          <div>
            <label htmlFor="planner-destination" style={labelStyle}>📍 Destination</label>
            <input
              id="planner-destination"
              type="text"
              placeholder="e.g. Jaipur, Kerala, Varanasi..."
              value={form.destination}
              onChange={e => setForm(f => ({ ...f, destination: e.target.value.slice(0, 100) }))}
              maxLength={100}
              autoComplete="off"
              style={inputStyle}
            />
            {/* Suggest from destinations list */}
            {form.destination.length > 1 && (
              <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {destinations
                  .filter(d => d.name.toLowerCase().startsWith(form.destination.toLowerCase()) && d.name.toLowerCase() !== form.destination.toLowerCase())
                  .slice(0, 5)
                  .map(d => (
                    <button
                      key={d.id}
                      onClick={() => setForm(f => ({ ...f, destination: d.name }))}
                      style={{
                        padding: '3px 10px', borderRadius: '999px',
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(255,255,255,0.04)',
                        color: 'rgba(255,255,255,0.6)',
                        fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      {d.name}
                    </button>
                  ))
                }
              </div>
            )}
          </div>

          {/* Days + Budget row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="planner-days" style={labelStyle}>📅 Number of Days</label>
              <input
                id="planner-days"
                type="number"
                min={1} max={14}
                value={form.days}
                onChange={e => setForm(f => ({ ...f, days: Math.max(1, Math.min(14, parseInt(e.target.value) || 1)) }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>💰 Budget Level</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                {BUDGETS.map(b => (
                  <button
                    key={b}
                    onClick={() => setForm(f => ({ ...f, budget: b }))}
                    aria-pressed={form.budget === b}
                    style={{
                      padding: '8px 14px', borderRadius: '8px',
                      border: `1px solid ${form.budget === b ? 'rgba(255,107,43,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      background: form.budget === b ? 'rgba(255,107,43,0.1)' : 'transparent',
                      color: form.budget === b ? '#FF6B2B' : 'rgba(255,255,255,0.55)',
                      fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    {BUDGET_EMOJI[b]} {b}
                    {destInfo && destInfo.avgBudgetPerDay?.[b] && (
                      <span style={{ marginLeft: '8px', opacity: 0.5, fontSize: '0.72rem' }}>
                        ~{formatINR(destInfo.avgBudgetPerDay[b])}/day
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Travel Style */}
          <div>
            <label style={labelStyle}>🎨 Travel Style</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {STYLES.map(s => (
                <button
                  key={s}
                  onClick={() => setForm(f => ({ ...f, style: s }))}
                  aria-pressed={form.style === s}
                  style={{
                    padding: '6px 14px', borderRadius: '999px',
                    border: `1px solid ${form.style === s ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    background: form.style === s ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.04)',
                    color: form.style === s ? '#38bdf8' : 'rgba(255,255,255,0.55)',
                    fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label style={labelStyle}>❤️ Interests (pick any)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {INTERESTS.map(interest => {
                const active = form.interests.includes(interest)
                return (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    aria-pressed={active}
                    style={{
                      padding: '5px 12px', borderRadius: '999px',
                      border: `1px solid ${active ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      background: active ? 'rgba(251,191,36,0.1)' : 'transparent',
                      color: active ? '#fbbf24' : 'rgba(255,255,255,0.45)',
                      fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    {active ? '✓ ' : ''}{interest}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              fontFamily: 'var(--font-body)', fontSize: '0.87rem', color: '#f87171',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Generate button */}
          <motion.button
            whileHover={!loading ? { scale: 1.03 } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            onClick={handleGenerate}
            disabled={loading}
            aria-busy={loading}
            aria-label="Generate AI travel itinerary"
            style={{
              padding: '15px 32px', borderRadius: '14px', border: 'none',
              background: loading ? 'rgba(255,107,43,0.3)' : 'linear-gradient(135deg, #FF6B2B, #f59e0b)',
              color: '#fff', fontFamily: 'var(--font-display)',
              fontSize: '1.05rem', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}
          >
            {loading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-block' }}
                >
                  ⏳
                </motion.span>
                Generating your itinerary…
              </>
            ) : (
              '✨ Generate Itinerary'
            )}
          </motion.button>
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              ref={resultRef}
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ItineraryResult result={result} form={form} destInfo={destInfo} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── Itinerary Result ──────────────────────────────────────────── */
function ItineraryResult({ result, form, destInfo }) {
  const [openDay, setOpenDay] = useState(0)
  const [packingOpen, setPackingOpen] = useState(false)

  const perDay = destInfo?.avgBudgetPerDay?.[form.budget] || result.estimatedTotalCost?.INR / form.days || 0
  const totalBudget = perDay * form.days

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(56,189,248,0.10), rgba(255,107,43,0.06))',
        border: '1px solid rgba(56,189,248,0.2)',
        borderRadius: '20px', padding: '28px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '0 0 6px' }}>
              🗺️ {form.days}-Day {form.style} Trip to {form.destination}
            </h2>
            {result.summary && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6, maxWidth: '520px' }}>
                {result.summary}
              </p>
            )}
          </div>
          {totalBudget > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Est. Total</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: '800', color: '#fbbf24' }}>{formatINR(totalBudget)}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>{formatINR(perDay)}/day</div>
            </div>
          )}
        </div>

        {/* AI personalisation note */}
        {result.personalizedNote && (
          <div style={{
            marginTop: '16px', padding: '12px 16px', borderRadius: '10px',
            background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)',
            fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#38bdf8',
            lineHeight: 1.5,
          }}>
            🎒 {result.personalizedNote}
          </div>
        )}

        {/* Budget meter */}
        {totalBudget > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
              <span>Budget Level: {form.budget}</span>
              <span>{formatINR(totalBudget)} total ({form.days} days)</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: form.budget === 'Budget' ? '30%' : form.budget === 'Comfort' ? '60%' : '90%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: form.budget === 'Budget' ? '#4ade80' : form.budget === 'Comfort' ? '#38bdf8' : '#fbbf24',
                  borderRadius: '999px',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Day-by-day cards */}
      {result.days?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: '700', color: '#fff', margin: 0 }}>
            📅 Day-by-Day Itinerary
          </h3>
          {result.days.map((day, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{
                background: openDay === i ? 'rgba(255,107,43,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${openDay === i ? 'rgba(255,107,43,0.25)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '14px', overflow: 'hidden',
                transition: 'all 0.2s',
              }}
            >
              <button
                onClick={() => setOpenDay(openDay === i ? -1 : i)}
                aria-expanded={openDay === i}
                style={{
                  width: '100%', padding: '16px 20px',
                  background: 'none', border: 'none',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: '12px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF6B2B, #f59e0b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: '800', color: '#fff',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
                      {day.title || `Day ${i + 1}`}
                    </div>
                    {day.theme && (
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#FF6B2B' }}>{day.theme}</div>
                    )}
                  </div>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>{openDay === i ? '▲' : '▼'}</span>
              </button>

              <AnimatePresence>
                {openDay === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 20px 20px' }}>
                      {day.activities?.map((act, j) => (
                        <div key={j} style={{
                          display: 'flex', gap: '12px', padding: '10px 0',
                          borderBottom: j < day.activities.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        }}>
                          <div style={{
                            flexShrink: 0, width: '60px',
                            fontFamily: 'var(--font-body)', fontSize: '0.72rem',
                            color: '#fbbf24', fontWeight: '600', paddingTop: '2px',
                          }}>
                            {act.time || `${8 + j * 2}:00`}
                          </div>
                          <div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.87rem', color: '#fff', fontWeight: '500' }}>
                              {act.activity}
                            </div>
                            {act.note && (
                              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: '3px', lineHeight: 1.5 }}>
                                {act.note}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {day.meal && (
                        <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#fbbf24' }}>
                            🍛 Must-try: {day.meal}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Weather note */}
      {result.weatherNote && (
        <div style={{
          padding: '14px 18px', borderRadius: '12px',
          background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)',
          fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6,
        }}>
          🌤️ <strong style={{ color: '#38bdf8' }}>Weather Tip:</strong> {result.weatherNote}
        </div>
      )}

      {/* Packing list */}
      {result.packingList?.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px', overflow: 'hidden',
        }}>
          <button
            onClick={() => setPackingOpen(o => !o)}
            aria-expanded={packingOpen}
            style={{
              width: '100%', padding: '16px 20px', background: 'none', border: 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
              🎒 Packing List
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>{packingOpen ? '▲' : '▼'}</span>
          </button>
          <AnimatePresence>
            {packingOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '0 20px 20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {result.packingList.map((item, i) => (
                    <div key={i} style={{
                      padding: '5px 12px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)',
                    }}>
                      ✓ {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

/* ── Style helpers ─────────────────────────────────── */
const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontSize: '0.78rem',
  color: 'rgba(255,255,255,0.5)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '8px',
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff',
  fontFamily: 'var(--font-body)',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
}
