import React, { createContext, useContext, useCallback, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

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
      return {
        ...prev,
        badges: [...prev.badges, { ...badge, earnedAt: new Date().toISOString() }],
      }
    })
    pushToast(`🏅 Badge Unlocked: ${badge.name}!`)
  }, [setPassport, pushToast])

  const addStamp = useCallback((stamp) => {
    setPassport(prev => {
      if (prev.stamps.some(s => s.eraId === stamp.eraId)) return prev
      return {
        ...prev,
        stamps: [...prev.stamps, { ...stamp, earnedAt: new Date().toISOString() }],
      }
    })
    pushToast(`🪬 Heritage Stamp: ${stamp.name}!`)
  }, [setPassport, pushToast])

  const addToWishlist = useCallback((destination) => {
    setPassport(prev => {
      if (prev.wishlist.some(d => d.id === destination.id)) return prev
      return {
        ...prev,
        wishlist: [...prev.wishlist, destination],
      }
    })
    pushToast(`❤️ Added to Wishlist: ${destination.title}`)
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
    pushToast('🔄 Passport Reset')
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
