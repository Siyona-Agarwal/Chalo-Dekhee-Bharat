import React, { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import allBadges from '../data/badges.json'

// ── XP Level Thresholds ──────────────────────────────────────────────────────
const LEVELS = [
  { name: 'Wanderer',      minXP: 0    },
  { name: 'Explorer',      minXP: 100  },
  { name: 'Adventurer',    minXP: 300  },
  { name: 'Bharat Yatri',  minXP: 700  },
]

export function deriveLevel(xp) {
  let current = LEVELS[0]
  for (const level of LEVELS) {
    if (xp >= level.minXP) current = level
  }
  const idx = LEVELS.indexOf(current)
  const nextLevel = LEVELS[idx + 1] || null
  return {
    name: current.name,
    nextName: nextLevel?.name || null,
    minXP: current.minXP,
    nextMinXP: nextLevel?.minXP || null,
    progress: nextLevel
      ? ((xp - current.minXP) / (nextLevel.minXP - current.minXP)) * 100
      : 100,
  }
}

// ── Default Passport State ───────────────────────────────────────────────────
const DEFAULT_PASSPORT = {
  identity: {
    clerkUserId: '',
    firstName: '',
    lastName: '',
    bloodType: '',
    countryCode: '',
    completedAt: null,
  },
  xp: 0,
  badges: [],       // [{ id, name, icon, earnedAt }]
  stamps: [],       // [{ eraId, name, earnedAt }]
  wishlist: [],     // [{ id, title, imageUrl, region, category }]
  plannerHistory: [],// [{ id, destination, days, budget, style, plan, generatedAt }]
  visitedStates: [], // ['maharashtra', 'rajasthan', ...]
}

// ── Context ──────────────────────────────────────────────────────────────────
export const PassportContext = createContext(null)

export function PassportProvider({ children }) {
  const [passport, setPassport] = useLocalStorage('passport_v1', DEFAULT_PASSPORT)

  useEffect(() => {
    const supportedIds = new Set(allBadges.map(badge => badge.id))
    setPassport(prev => {
      const badges = (prev.badges || []).filter(badge => supportedIds.has(badge.id))
      return badges.length === (prev.badges || []).length ? prev : { ...prev, badges }
    })
  }, [setPassport])

  // Toast queue: [{ id, message, xp }]
  const [toasts, setToasts] = useState([])

  const pushToast = useCallback((message, xpAmount = 0) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, xp: xpAmount }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  // ── Actions ────────────────────────────────────────────────────────────────

  const addXP = useCallback((amount, reason = '') => {
    setPassport(prev => ({ ...prev, xp: (prev.xp || 0) + amount }))
    pushToast(`+${amount} XP${reason ? ` — ${reason}` : ''}`, amount)
  }, [setPassport, pushToast])

  const addBadge = useCallback((badge) => {
    setPassport(prev => {
      if (prev.badges.some(b => b.id === badge.id)) return prev
      const nextBadges = [...prev.badges, { ...badge, earnedAt: new Date().toISOString() }]
      const completionIds = ['badge-005', 'badge-006-hard', 'badge-007-hard', 'badge-008-hard', 'badge-009', 'badge-010', 'badge-011']
      const finalBadge = allBadges.find(item => item.id === 'badge-012')
      const earnsFinalBadge = badge.id !== 'badge-012'
        && completionIds.every(id => nextBadges.some(item => item.id === id))
        && !nextBadges.some(item => item.id === 'badge-012')

      return {
        ...prev,
        badges: earnsFinalBadge && finalBadge
          ? [...nextBadges, { ...finalBadge, earnedAt: new Date().toISOString() }]
          : nextBadges,
      }
    })
    pushToast(`Badge Unlocked: ${badge.name}!`)
  }, [setPassport, pushToast])

  const addStamp = useCallback((stamp) => {
    setPassport(prev => {
      if (prev.stamps.some(s => s.eraId === stamp.eraId)) return prev
      return {
        ...prev,
        stamps: [...prev.stamps, { ...stamp, earnedAt: new Date().toISOString() }],
      }
    })
    pushToast(`Heritage Stamp: ${stamp.name}!`)
  }, [setPassport, pushToast])

  const addToWishlist = useCallback((destination) => {
    setPassport(prev => {
      if (prev.wishlist.some(d => d.id === destination.id)) return prev
      const nextWishlist = [...prev.wishlist, destination]
      const earnedIds = new Set(prev.badges.map(b => b.id))
      const unlocks = []
      const wishlistBadge = allBadges.find(b => b.id === 'badge-009')
      const culinaryBadge = allBadges.find(b => b.id === 'badge-011')
      if (nextWishlist.length >= 5 && !earnedIds.has('badge-009') && wishlistBadge) unlocks.push(wishlistBadge)
      if (nextWishlist.filter(item => item.category === 'Food').length >= 3 && !earnedIds.has('badge-011') && culinaryBadge) unlocks.push(culinaryBadge)
      const nextBadges = [...prev.badges, ...unlocks.map(badge => ({ ...badge, earnedAt: new Date().toISOString() }))]
      const completionIds = ['badge-005', 'badge-006-hard', 'badge-007-hard', 'badge-008-hard', 'badge-009', 'badge-010', 'badge-011']
      const finalBadge = allBadges.find(item => item.id === 'badge-012')
      const earnsFinalBadge = finalBadge
        && completionIds.every(id => nextBadges.some(item => item.id === id))
        && !nextBadges.some(item => item.id === 'badge-012')

      return {
        ...prev,
        wishlist: nextWishlist,
        badges: earnsFinalBadge
          ? [...nextBadges, { ...finalBadge, earnedAt: new Date().toISOString() }]
          : nextBadges,
      }
    })
    pushToast(`Added to Wishlist: ${destination.title}`)
  }, [setPassport, pushToast])

  const removeFromWishlist = useCallback((destinationId) => {
    setPassport(prev => ({
      ...prev,
      wishlist: prev.wishlist.filter(d => d.id !== destinationId),
    }))
  }, [setPassport])

  const savePlannerResult = useCallback((result) => {
    setPassport(prev => ({
      ...prev,
      plannerHistory: [
        { ...result, id: Date.now(), generatedAt: new Date().toISOString() },
        ...prev.plannerHistory.slice(0, 9), // keep last 10
      ],
    }))
  }, [setPassport])

  const markStateVisited = useCallback((stateId) => {
    setPassport(prev => {
      if (prev.visitedStates.includes(stateId)) return prev
      return { ...prev, visitedStates: [...prev.visitedStates, stateId] }
    })
  }, [setPassport])

  const updateIdentity = useCallback((identity) => {
    setPassport(prev => ({
      ...prev,
      identity: {
        ...(prev.identity || DEFAULT_PASSPORT.identity),
        clerkUserId: identity.clerkUserId || '',
        firstName: identity.firstName?.trim() || '',
        lastName: identity.lastName?.trim() || '',
        bloodType: identity.bloodType?.trim() || '',
        countryCode: identity.countryCode?.trim().toUpperCase() || '',
        completedAt: new Date().toISOString(),
      },
    }))
  }, [setPassport])

  const resetPassport = useCallback(() => {
    setPassport(DEFAULT_PASSPORT)
    pushToast('Passport Reset')
  }, [setPassport, pushToast])

  // ── Derived State ──────────────────────────────────────────────────────────
  const level = deriveLevel(passport.xp || 0)

  const value = {
    passport,
    level,
    toasts,
    addXP,
    addBadge,
    addStamp,
    addToWishlist,
    removeFromWishlist,
    savePlannerResult,
    markStateVisited,
    updateIdentity,
    resetPassport,
  }

  return (
    <PassportContext.Provider value={value}>
      {children}
    </PassportContext.Provider>
  )
}

// ── Consumer hook ─────────────────────────────────────────────────────────────
export function usePassport() {
  const ctx = useContext(PassportContext)
  if (!ctx) throw new Error('usePassport must be used within PassportProvider')
  return ctx
}
