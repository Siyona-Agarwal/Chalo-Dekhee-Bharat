import React, { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePassport } from '../../context/PassportContext.jsx'
import { useXP } from '../../hooks/useXP.js'
import { generateItinerary } from '../../services/api.js'
import { formatINR } from '../../utils/index.js'
import badges from '../../data/badges.json'
import destinations from '../../data/destinations.json'
import Icon from '../../components/Icon.jsx'

const STYLES = ['Cultural', 'Adventure', 'Relaxation', 'Food & Culinary', 'Wildlife & Nature', 'Spiritual']
const BUDGETS = ['Budget', 'Comfort', 'Luxury']
const INTERESTS = ['History', 'Architecture', 'Food', 'Nature', 'Wildlife', 'Festivals', 'Art & Craft', 'Yoga & Wellness', 'Photography', 'Adventure Sports']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Not sure yet']
const TRAVELERS = ['Solo', 'Couple', 'Family', 'Friends group']
const ACCOMMODATIONS = ['Hotel', 'Homestay', 'Hostel', 'Resort']
const DIETS = ['Veg', 'Non-veg', 'Jain', 'Vegan', 'No preference']
const PACES = ['Relaxed', 'Balanced', 'Packed']

const initialForm = { origin: '', destination: '', month: 'Not sure yet', days: 3, travelers: 'Solo', budget: 'Comfort', style: ['Cultural'], interests: [], accommodation: 'Hotel', diet: 'No preference', pace: 'Balanced' }

export default function Planner() {
  const { passport, savePlannerResult, addBadge } = usePassport()
  const { addXP } = useXP()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const resultRef = useRef(null)
  const destInfo = destinations.find(d => d.name.toLowerCase() === form.destination.toLowerCase())

  const toggleListValue = (key, value, keepOne = false) => setForm(current => {
    const list = Array.isArray(current[key]) ? current[key] : [current[key]]
    if (list.includes(value)) {
      if (keepOne && list.length === 1) return current
      return { ...current, [key]: list.filter(item => item !== value) }
    }
    return { ...current, [key]: [...list, value] }
  })

  const handleGenerate = async () => {
    if (!form.destination.trim()) { setError('Add a destination to begin.'); return }
    if (form.days < 1 || form.days > 14) { setError('Choose between 1 and 14 days.'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const data = await generateItinerary({
        origin: form.origin.trim().slice(0, 50), destination: form.destination.trim().slice(0, 100), month: form.month,
        days: Number(form.days), travelers: form.travelers, budget: form.budget, style: form.style,
        interests: form.interests.slice(0, 10), accommodation: form.accommodation, diet: form.diet, pace: form.pace,
        passportContext: { xp: passport.xp, badges: passport.badges.map(b => b.name), stamps: passport.stamps.map(s => ({ name: s.name, eraId: s.eraId })), wishlist: passport.wishlist.map(w => ({ title: w.title, region: w.region })), visitedStates: passport.visitedStates },
      })
      setResult(data)
      savePlannerResult({ id: Date.now().toString(), destination: form.destination.trim(), days: Number(form.days), budget: form.budget, style: form.style.join(', '), generatedAt: new Date().toISOString(), summary: data.summary || '', fullPlan: data, formOptions: form })
      addXP(40, 'AI Itinerary Generated!')
      if (passport.plannerHistory.length === 0 && !passport.badges.some(b => b.id === 'badge-010')) {
        const badge = badges.find(item => item.id === 'badge-010')
        if (badge) addBadge(badge)
      }
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250)
    } catch (err) {
      setError(err.message === 'fetch failed' ? 'Could not reach the server. Is it running?' : (err.message || 'Something went wrong. Please try again.'))
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-deep-900)' }}>
      <header style={{ minHeight: '360px', padding: '72px 24px 58px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left', backgroundImage: "linear-gradient(90deg, rgba(7,13,27,0.96) 0%, rgba(7,13,27,0.82) 34%, rgba(7,13,27,0.16) 72%, rgba(7,13,27,0.34) 100%), linear-gradient(180deg, rgba(7,13,27,0.18), var(--color-deep-900) 96%), url('/images/planner/planner-hero.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Icon name="compass" size={38} />
          <p style={{ margin: '16px 0 8px', color: 'var(--color-saffron-500)', fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>AI journey builder</p>
          <h1 style={{ margin: 0, color: '#fff', fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.4rem)', lineHeight: 1.05 }}>Safar Saathi</h1>
          <p style={{ maxWidth: 430, margin: '14px 0 0', color: 'rgba(255,255,255,0.68)', lineHeight: 1.6 }}>A thoughtful India itinerary shaped around your time, taste, and Passport.</p>
        </motion.div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 100px' }}>
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="planner-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
          <div>
            <PassportContext passport={passport} />

            <div style={panelStyle}>
              <p style={eyebrowStyle}>01 / The essentials</p><h2 style={{ ...headingStyle, marginBottom: 24, fontSize: '1.3rem' }}>Where and when?</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
                <Field label="Origin city" icon="map"><input value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} placeholder="e.g. Mumbai" style={inputStyle} /></Field>
                <Field label="Destination" icon="map"><input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="e.g. Hampi" style={inputStyle} /></Field>
                <Field label="When are you going?" icon="calendar"><select value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} style={inputStyle}>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select></Field>
                <Field label="Duration (days)" icon="calendar"><input type="number" min="1" max="14" value={form.days} onChange={e => setForm(f => ({ ...f, days: e.target.value }))} style={inputStyle} /></Field>
                <Field label="Who is traveling?" icon="backpack"><select value={form.travelers} onChange={e => setForm(f => ({ ...f, travelers: e.target.value }))} style={inputStyle}>{TRAVELERS.map(v => <option key={v} value={v}>{v}</option>)}</select></Field>
              </div>
            </div>

            <div style={{ ...panelStyle, marginTop: 24 }}>
              <p style={eyebrowStyle}>02 / Your vibe</p><h2 style={{ ...headingStyle, marginBottom: 24, fontSize: '1.3rem' }}>What draws you in?</h2>
              <Field label="Trip style (pick any)" icon="sparkles"><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>{STYLES.map(style => <Chip key={style} active={form.style.includes(style)} onClick={() => toggleListValue('style', style, true)}>{style}</Chip>)}</div></Field>
              <div style={{ marginTop: 24 }}><Field label="Specific interests" icon="sparkles"><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>{INTERESTS.map(interest => <Chip key={interest} active={form.interests.includes(interest)} onClick={() => toggleListValue('interests', interest)}>{interest}</Chip>)}</div></Field></div>
            </div>

            {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ padding: '16px 20px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', borderRadius: 12, margin: '24px 0', border: '1px solid rgba(239,68,68,0.2)' }}><Icon name="weather" size={16} /> {error}</motion.div>}
            
            <div style={{ margin: '32px 0 16px', height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <button type="button" onClick={handleGenerate} disabled={loading} style={{ ...primaryButtonStyle, opacity: loading ? 0.65 : 1 }}>{loading ? <><Icon name="hourglass" size={18} /> Building your route...</> : <><Icon name="sparkles" size={18} /> Build my itinerary</>}</button>
          </div>

          <aside style={{ ...panelStyle, padding: 22, position: 'sticky', top: 84 }}>
            <p style={eyebrowStyle}>03 / Fine-tune</p><h2 style={{ ...headingStyle, fontSize: '1.3rem' }}>Make it feel like you</h2><p style={subtleStyle}>Optional details help the AI pace your days and recommendations.</p>
            <button type="button" onClick={() => setAdvancedOpen(open => !open)} aria-expanded={advancedOpen} style={advancedToggleStyle}><span><Icon name="sliders" size={16} /> Advanced preferences</span><Icon name={advancedOpen ? 'chevronUp' : 'chevronDown'} size={16} /></button>
            <AnimatePresence initial={false}>{advancedOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}><div style={{ display: 'grid', gap: 14, paddingTop: 16 }}><Field label="Budget" icon="budget"><select value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} style={inputStyle}>{BUDGETS.map(v => <option key={v} value={v}>{v}</option>)}</select></Field><Field label="Stay" icon="hotel"><select value={form.accommodation} onChange={e => setForm(f => ({ ...f, accommodation: e.target.value }))} style={inputStyle}>{ACCOMMODATIONS.map(v => <option key={v} value={v}>{v}</option>)}</select></Field><Field label="Diet" icon="diet"><select value={form.diet} onChange={e => setForm(f => ({ ...f, diet: e.target.value }))} style={inputStyle}>{DIETS.map(v => <option key={v} value={v}>{v}</option>)}</select></Field><Field label="Pace" icon="pace"><select value={form.pace} onChange={e => setForm(f => ({ ...f, pace: e.target.value }))} style={inputStyle}>{PACES.map(v => <option key={v} value={v}>{v}</option>)}</select></Field></div></motion.div>}</AnimatePresence>
            {!advancedOpen && <div style={{ marginTop: 20, padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.035)', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', lineHeight: 1.55 }}>You can keep this simple. The essentials above are enough to generate a useful first route.</div>}
          </aside>
        </motion.section>

        <AnimatePresence>{result && <motion.div ref={resultRef} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 28 }}><ItineraryResult result={result} form={form} destInfo={destInfo} /></motion.div>}</AnimatePresence>
      </main>
      <style>{`@media (max-width: 760px){.planner-layout{grid-template-columns:1fr!important}.planner-layout aside{position:static!important}.planner-layout input,.planner-layout select{min-height:44px}} @media (max-width: 520px){.planner-layout>div>div{grid-template-columns:1fr!important}.planner-layout>div>div:nth-of-type(2){grid-template-columns:repeat(2,minmax(0,1fr))!important}}`}</style>
    </div>
  )
}

function Field({ label, icon, children }) { return <div><label style={labelStyle}><Icon name={icon} size={14} /> {label}</label>{children}</div> }
function Chip({ active, onClick, children }) { return <button type="button" aria-pressed={active} onClick={onClick} style={{ ...chipStyle, ...(active ? chipActiveStyle : {}) }}>{children}</button> }
function PassportContext({ passport }) { return <div style={{ ...panelStyle, marginBottom: 18, padding: '16px 18px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-saffron-500)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}><Icon name="backpack" size={15} /> Passport context</div><p style={{ ...subtleStyle, margin: '6px 0 12px' }}>Your saved discoveries will influence the route.</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>{[...passport.stamps.map(s => s.name), ...passport.wishlist.map(w => w.title)].slice(0, 8).map((item, index) => <span key={`${item}-${index}`} style={contextTagStyle}>{item}</span>)}</div></div> }

export function ItineraryResult({ result, form, destInfo }) {
  const [openDay, setOpenDay] = useState(0)
  const [packingOpen, setPackingOpen] = useState(false)
  const perDay = destInfo?.avgBudgetPerDay?.[form.budget] || (result.estimatedTotalCost?.INR / form.days) || 0
  const totalBudget = perDay * form.days
  return <div style={{ display: 'grid', gap: 16 }}>
    <section style={resultHeroStyle}><div><p style={eyebrowStyle}>Your route is ready</p><h2 style={{ ...headingStyle, fontSize: '1.55rem' }}>{form.days}-day {form.destination} journey</h2>{result.summary && <p style={{ ...subtleStyle, maxWidth: 620, marginTop: 8 }}>{result.summary}</p>}</div>{totalBudget > 0 && <div style={{ textAlign: 'right' }}><span style={{ ...eyebrowStyle, display: 'block' }}>Estimated total</span><strong style={{ color: '#fbbf24', fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>{formatINR(totalBudget)}</strong></div>}</section>
    {result.personalizedNote && <div style={noteStyle}><Icon name="backpack" size={16} /> {result.personalizedNote}</div>}
    {result.days?.length > 0 && <section style={panelStyle}><p style={eyebrowStyle}>Day by day</p><div style={{ display: 'grid', gap: 8, marginTop: 12 }}>{result.days.map((day, index) => <div key={index} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden', background: openDay === index ? 'rgba(255,107,43,0.07)' : 'rgba(255,255,255,0.02)' }}><button type="button" onClick={() => setOpenDay(openDay === index ? -1 : index)} aria-expanded={openDay === index} style={dayButtonStyle}><span><b style={{ color: '#fff' }}>Day {index + 1}</b><small style={{ display: 'block', color: 'var(--color-saffron-500)', marginTop: 3 }}>{day.title || day.theme || 'Explore and experience'}</small></span><Icon name={openDay === index ? 'chevronUp' : 'chevronDown'} size={16} /></button>{openDay === index && <div style={{ padding: '0 18px 16px' }}>{day.activities?.map((activity, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 10, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}><span style={{ color: '#fbbf24', fontSize: '0.75rem' }}>{activity.time || `${8 + i * 2}:00`}</span><span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.86rem', lineHeight: 1.5 }}>{activity.activity}{activity.note && <small style={{ display: 'block', color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{activity.note}</small>}</span></div>)}</div>}</div>)}</div></section>}
    {result.weatherNote && <div style={noteStyle}><Icon name="weather" size={16} /> <strong>Weather tip:</strong> {result.weatherNote}</div>}
    {result.packingList?.length > 0 && <section style={panelStyle}><button type="button" onClick={() => setPackingOpen(v => !v)} aria-expanded={packingOpen} style={dayButtonStyle}><span><Icon name="backpack" size={16} /> Packing list</span><Icon name={packingOpen ? 'chevronUp' : 'chevronDown'} size={16} /></button>{packingOpen && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 12 }}>{result.packingList.map((item, i) => <span key={i} style={contextTagStyle}>{item}</span>)}</div>}</section>}
  </div>
}

const panelStyle = { background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 18, padding: '28px' }
const resultHeroStyle = { ...panelStyle, display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', background: 'linear-gradient(135deg, rgba(255,107,43,0.14), rgba(255,255,255,0.03))' }
const headingStyle = { margin: 0, color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.45rem' }
const subtleStyle = { color: 'rgba(255,255,255,0.56)', fontSize: '0.87rem', lineHeight: 1.55 }
const eyebrowStyle = { margin: 0, color: 'var(--color-saffron-500)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }
const labelStyle = { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7, color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }
const inputStyle = { width: '100%', minHeight: 44, boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.13)', background: 'rgba(255,255,255,0.055)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.88rem', outline: 'none' }
const chipWrapStyle = { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 9 }
const chipStyle = { minHeight: 36, padding: '7px 12px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.62)', fontSize: '0.78rem', cursor: 'pointer' }
const chipActiveStyle = { borderColor: 'rgba(255,107,43,0.7)', background: 'rgba(255,107,43,0.16)', color: '#fff' }
const suggestionStyle = { padding: '5px 9px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }
const contextTagStyle = { padding: '6px 9px', borderRadius: 7, background: 'rgba(255,107,43,0.09)', border: '1px solid rgba(255,107,43,0.2)', color: 'rgba(255,255,255,0.68)', fontSize: '0.75rem' }
const primaryButtonStyle = { width: '100%', minHeight: 50, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 28, border: 0, borderRadius: 11, background: 'linear-gradient(135deg, #ff6b2b, #d94f20)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, cursor: 'pointer' }
const advancedToggleStyle = { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', marginTop: 18, border: 0, borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.75)', cursor: 'pointer' }
const errorStyle = { display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, padding: '11px 12px', borderRadius: 9, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: '0.82rem' }
const noteStyle = { display: 'flex', gap: 8, alignItems: 'flex-start', padding: '13px 16px', borderRadius: 11, background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.16)', color: 'rgba(255,255,255,0.68)', fontSize: '0.84rem', lineHeight: 1.5 }
const dayButtonStyle = { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 17px', border: 0, background: 'transparent', color: 'rgba(255,255,255,0.5)', textAlign: 'left', cursor: 'pointer' }
