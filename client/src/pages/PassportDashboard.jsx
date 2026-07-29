import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePassport } from '../context/PassportContext.jsx'
import PassportStamp from '../components/PassportStamp.jsx'
import allBadges from '../data/badges.json'
import Icon from '../components/Icon.jsx'
import './passportDashboard.css'

const ERA_META = [
  { id: 'ancient', label: 'Prachin Bharat', code: 'IND-ANC', ink: '#1d4e89', mark: '◉' },
  { id: 'medieval', label: 'Madhyakalin Bharat', code: 'IND-MED', ink: '#a33b28', mark: '✦' },
  { id: 'freedom', label: 'Swatantrata Sangram', code: 'IND-FRE', ink: '#357a55', mark: '✺' },
  { id: 'modern', label: 'Adhunik Bharat', code: 'IND-MOD', ink: '#8a5a20', mark: '◈' },
]

const SECTIONS = [
  { id: 'identity', label: 'Identity' },
  { id: 'stamps', label: 'Stamps' },
  { id: 'collection', label: 'Collection' },
]

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Field({ label, value, mono = false }) {
  return <div className="passport-field"><span>{label}</span><strong className={mono ? 'passport-mono' : ''}>{value || '—'}</strong></div>
}

function Emblem({ className = '' }) {
  return <img className={className} src="/emblem.svg" alt="State Emblem of India" />
}

function EraStamp({ era, earned, earnedAt, index }) {
  return (
    <motion.div className={`era-stamp ${earned ? 'era-stamp--earned' : 'era-stamp--empty'}`} style={{ '--stamp-ink': era.ink }} initial={earned ? { opacity: 0, scale: 1.45, y: -28, rotate: -9 } : false} animate={earned ? { opacity: 1, scale: 1, y: 0, rotate: -3 } : { opacity: .42 }} transition={{ type: 'spring', stiffness: 390, damping: 18, delay: .25 + index * .1 }}>
      <div className="era-stamp__impact" aria-hidden="true" />
      <div className="era-stamp__ring"><span className="era-stamp__mark">{era.mark}</span><b>{era.label}</b><small>{earned ? `ISSUED ${formatDate(earnedAt)}` : 'NOT YET ISSUED'}</small><em>{era.code}</em></div>
    </motion.div>
  )
}

export default function PassportDashboard() {
  const { passport, level } = usePassport()
  const [isOpen, setIsOpen] = useState(false)
  const [spreadIndex, setSpreadIndex] = useState(0)
  const [pendingSpread, setPendingSpread] = useState(null)
  const [turnDirection, setTurnDirection] = useState(1)
  const identity = passport.identity || {}
  const xp = passport.xp || 0
  const stamps = passport.stamps || []
  const earnedIds = useMemo(() => new Set((passport.badges || []).map(badge => badge.id)), [passport.badges])
  const firstName = identity.firstName?.trim() || level.name
  const lastName = identity.lastName?.trim() || 'Wanderer'
  const countryCode = identity.countryCode?.trim().toUpperCase() || 'IND'
  const passportNumber = `CD${String(Math.max(1, xp)).padStart(7, '0')}`
  const progress = Math.min(100, level.nextMinXP ? ((xp - level.minXP) / (level.nextMinXP - level.minXP)) * 100 : 100)
  const heritageComplete = ERA_META.every(era => stamps.some(stamp => stamp.eraId === era.id))
  const activeSpread = pendingSpread ?? spreadIndex
  const isTurning = pendingSpread !== null

  const openPassport = () => {
    setSpreadIndex(0)
    setPendingSpread(null)
    setIsOpen(true)
  }

  const requestSpread = nextIndex => {
    if (isTurning || nextIndex === spreadIndex || nextIndex < 0 || nextIndex >= SECTIONS.length) return
    setTurnDirection(nextIndex > spreadIndex ? 1 : -1)
    setPendingSpread(nextIndex)
  }

  const finishPageTurn = () => {
    if (pendingSpread === null) return
    setSpreadIndex(pendingSpread)
    setPendingSpread(null)
  }

  const page = pageNumber => {
    switch (pageNumber) {
      case 0:
        return <section className="passport-page passport-page--identity"><div className="page-kicker">Republic of India · Explorer document</div><div className="identity-heading"><Emblem className="identity-emblem" /><div><p>भारत गणराज्य</p><h2>Passport identity</h2></div><span className="document-code">P &lt; IND</span></div><div className="identity-main"><div className="portrait-frame"><div className="portrait-placeholder">{firstName.slice(0, 1)}{lastName.slice(0, 1)}</div><span>Explorer portrait</span></div><div className="identity-fields"><Field label="Surname" value={lastName.toUpperCase()} /><Field label="Given names" value={firstName.toUpperCase()} /><Field label="Nationality" value="INDIAN" /><Field label="Country code" value={countryCode} mono /><Field label="Document no." value={passportNumber} mono /><Field label="Date of issue" value={formatDate(identity.completedAt)} /></div></div><div className="mrz-block"><div>P&lt;IND{lastName.toUpperCase().replace(/[^A-Z]/g, '<')}&lt;&lt;{firstName.toUpperCase().replace(/[^A-Z]/g, '<')}</div><div>{passportNumber}&lt;&lt;&lt;&lt;{countryCode}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div></div><div className="page-footer"><span>CHALO DEKHE BHARAT</span><span>01</span></div></section>
      case 1:
        return <section className="passport-page passport-page--record"><div className="page-kicker">Personal travel record</div><div className="record-hero"><div><span className="record-label">Current rank</span><h2>{level.name}</h2><p>{xp} XP collected across your journey</p></div><div className="rank-seal"><span>{String(Math.max(1, Math.floor(xp / 100))).padStart(2, '0')}</span><small>RANK</small></div></div><div className="xp-meter" aria-label={`${Math.round(progress)} percent to next rank`}><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: .65, delay: .25 }} /></div><div className="record-grid"><div><strong>{stamps.length}/4</strong><span>heritage stamps</span></div><div><strong>{passport.visitedStates?.length || 0}</strong><span>states visited</span></div><div><strong>{passport.wishlist?.length || 0}</strong><span>wishlist places</span></div><div><strong>{passport.plannerHistory?.length || 0}</strong><span>trip plans</span></div></div><div className="record-note"><span className="record-note__mark">✦</span><p>{heritageComplete ? 'All four eras have been entered in your passport.' : 'Every era, game, and destination adds a new mark to your journey.'}</p></div><div className="page-footer"><span>ISSUED FOR CURIOUS TRAVELLERS</span><span>02</span></div></section>
      case 2:
        return <section className="passport-page passport-page--stamps"><div className="page-kicker">Heritage entry visas</div><h2 className="page-title">Four eras of India</h2><p className="page-intro">Earn each stamp by completing every artifact in its museum room.</p><div className="era-stamp-grid">{ERA_META.map((era, index) => { const stamp = stamps.find(item => item.eraId === era.id); return <EraStamp key={era.id} era={era} index={index} earned={Boolean(stamp)} earnedAt={stamp?.earnedAt} /> })}</div><div className="stamp-progress"><span>{stamps.length}/4 issued</span><div><motion.i initial={{ width: 0 }} animate={{ width: `${(stamps.length / 4) * 100}%` }} transition={{ duration: .6, delay: .25 }} /></div></div><div className="page-footer"><span>HERITAGE ARCHIVE</span><span>03</span></div></section>
      case 3:
        return <section className="passport-page passport-page--achievements"><div className="page-kicker">Achievement seals</div><h2 className="page-title">Your explorer marks</h2><p className="page-intro">Eight milestones, impressed like real immigration marks.</p><div className="achievement-grid">{allBadges.map((badge, index) => <PassportStamp key={badge.id} badge={badge} index={index} earned={earnedIds.has(badge.id)} />)}</div><div className="page-footer"><span>{passport.badges.length}/{allBadges.length} SEALS EARNED</span><span>04</span></div></section>
      case 4:
        return <section className="passport-page passport-page--collection"><div className="page-kicker">Personal collection</div><h2 className="page-title">Places to remember</h2><p className="page-intro">Your saved destinations, pressed into the pages for later.</p>{passport.wishlist?.length ? <div className="collection-grid">{passport.wishlist.slice(0, 6).map((item, index) => <motion.div className="collection-card" key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, rotate: index % 2 ? 1.2 : -1 }} transition={{ delay: .18 + index * .06 }}><div className="collection-photo" style={{ backgroundImage: `url(${item.imageUrl})` }} /><strong>{item.title}</strong><span>{item.region}</span></motion.div>)}</div> : <div className="empty-collection">Your first saved place will appear here.</div>}<div className="page-footer"><span>WISHLIST CURATION</span><span>05</span></div></section>
      default:
        return <section className="passport-page passport-page--history"><div className="page-kicker">Journey log</div><h2 className="page-title">Recent expeditions</h2><p className="page-intro">A quiet record of where your curiosity has taken you.</p>{passport.plannerHistory?.length ? passport.plannerHistory.slice(0, 5).map((trip, index) => <motion.div className="trip-row" key={trip.id || index} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .18 + index * .07 }}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{trip.destination}</strong><small>{trip.days} days · {trip.budget}</small></div><em>{formatDate(trip.generatedAt)}</em></motion.div>) : <div className="empty-collection">Your first itinerary will be recorded here.</div>}<div className="page-footer"><span>EXPLORER LOG</span><span>06</span></div></section>
    }
  }

  const currentLeft = spreadIndex * 2
  const currentRight = currentLeft + 1
  const targetLeft = activeSpread * 2
  const targetRight = targetLeft + 1
  const staticLeft = isTurning && turnDirection < 0 ? targetLeft : currentLeft
  const staticRight = isTurning && turnDirection > 0 ? targetRight : currentRight

  return (
    <main className="passport-dashboard">
      <div className="passport-atmosphere passport-atmosphere--one" /><div className="passport-atmosphere passport-atmosphere--two" />
      <header className="passport-dashboard__header"><div><span className="passport-dashboard__eyebrow">CHALO DEKHE BHARAT · TRAVEL DOCUMENT</span><h1>My Passport</h1></div><div className="passport-dashboard__summary"><span>{level.name}</span><b>{xp} XP</b></div></header>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.section key="closed" className="passport-lobby" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} transition={{ duration: .28 }}>
            <div className="passport-lobby__intro"><span className="passport-dashboard__eyebrow">YOUR PERSONAL INDIA ARCHIVE</span><h2>A passport for the places you have yet to become.</h2><p>Collect heritage stamps, master the games, and keep every next destination close.</p><button className="passport-primary-button" type="button" onClick={openPassport}>Open your passport <Icon name="arrowRight" size={16} /></button></div>
            <motion.button type="button" className="passport-cover" onClick={openPassport} whileHover={{ y: -7, rotateY: -4, rotateZ: -1 }} whileTap={{ scale: .98 }} aria-label="Open your Bharat travel passport"><div className="passport-cover__edge" /><div className="passport-cover__content"><span className="passport-cover__script">भारत गणराज्य</span><span className="passport-cover__country">REPUBLIC OF INDIA</span><Emblem className="passport-cover__emblem" /><span className="passport-cover__devanagari">पासपोर्ट</span><span className="passport-cover__passport">PASSPORT</span><span className="passport-cover__serial">CD / EXPLORER EDITION</span></div><span className="passport-cover__open">Open passport <Icon name="arrowRight" size={16} /></span></motion.button>
            <div className="passport-lobby__facts"><span><b>{stamps.length}</b> heritage stamps</span><span><b>{passport.badges.length}</b> achievement seals</span><span><b>{passport.wishlist?.length || 0}</b> places saved</span></div>
          </motion.section>
        ) : (
          <motion.section key="open" className="passport-open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="passport-open__toolbar"><button type="button" className="passport-back-button" onClick={() => !isTurning && setIsOpen(false)}>← Cover</button><nav aria-label="Passport sections">{SECTIONS.map((section, index) => <button type="button" key={section.id} className={activeSpread === index ? 'is-active' : ''} onClick={() => requestSpread(index)} disabled={isTurning} aria-current={activeSpread === index ? 'page' : undefined}>{section.label}</button>)}</nav><span className="passport-open__status">ACTIVE DOCUMENT · {passportNumber}</span></div>
            <div className="passport-book-stage">
              <button className="passport-page-control passport-page-control--previous" type="button" onClick={() => requestSpread(spreadIndex - 1)} disabled={isTurning || spreadIndex === 0} aria-label="Previous passport section">←</button>
              <motion.div className="passport-book" initial={{ scale: .68, x: '-22%', y: 18 }} animate={{ scale: 1, x: 0, y: 0 }} transition={{ duration: .72, ease: [0.22, 1, 0.36, 1] }}>
                <div className="passport-book__back-cover" aria-hidden="true" /><div className="passport-book__page-stack passport-book__page-stack--bottom" aria-hidden="true" /><div className="passport-book__page-stack passport-book__page-stack--side" aria-hidden="true" />
                <div className="passport-book__spread" aria-live="polite"><div className="passport-book__slot passport-book__slot--left">{page(staticLeft)}</div><div className="passport-book__slot passport-book__slot--right">{page(staticRight)}</div></div>
                <AnimatePresence>
                  {isTurning && <motion.div key={`${spreadIndex}-${pendingSpread}`} className={`passport-book__leaf passport-book__leaf--${turnDirection > 0 ? 'forward' : 'backward'}`} initial={{ rotateY: 0 }} animate={{ rotateY: turnDirection > 0 ? -180 : 180 }} transition={{ duration: .78, ease: [0.645, 0.045, 0.355, 1] }} onAnimationComplete={finishPageTurn}>
                    <div className="passport-book__leaf-face passport-book__leaf-front">{page(turnDirection > 0 ? currentRight : currentLeft)}</div>
                    <div className="passport-book__leaf-face passport-book__leaf-back">{page(turnDirection > 0 ? targetLeft : targetRight)}</div>
                  </motion.div>}
                </AnimatePresence>
                <div className="passport-book__hinge" aria-hidden="true" />
                <motion.div className="passport-book__opening-mask" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: .25, delay: .42 }} aria-hidden="true" />
                <motion.div className="passport-book__opening-cover" initial={{ rotateY: 0 }} animate={{ rotateY: -180 }} transition={{ duration: .9, delay: .12, ease: [0.65, 0, 0.2, 1] }} aria-hidden="true"><div><Emblem /><span>REPUBLIC OF INDIA</span><b>PASSPORT</b></div></motion.div>
              </motion.div>
              <button className="passport-page-control passport-page-control--next" type="button" onClick={() => requestSpread(spreadIndex + 1)} disabled={isTurning || spreadIndex === SECTIONS.length - 1} aria-label="Next passport section">→</button>
            </div>
            <div className="passport-page-position"><span>{String(activeSpread * 2 + 1).padStart(2, '0')}—{String(activeSpread * 2 + 2).padStart(2, '0')}</span><b>{SECTIONS[activeSpread].label}</b></div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  )
}
