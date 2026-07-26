import { useState, useEffect } from 'react'

/**
 * Generic localStorage persistence hook.
 * NOTE(security): Only non-sensitive game state is stored here (XP, badges, stamps).
 * Auth tokens and secrets are NEVER stored in localStorage.
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - default value if key not found
 * @returns {[*, Function]} - [storedValue, setter]
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (err) {
      // Silently fall back to initialValue on parse errors or missing storage
      console.warn('useLocalStorage: failed to read key', key)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (err) {
      console.warn('useLocalStorage: failed to write key', key)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}
