// Utility functions for Chalo Dekhe Bharat!

/**
 * Format a number as Indian rupees
 * @param {number} amount
 * @returns {string} e.g. "₹4,500"
 */
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

/**
 * Truncate text to a given length
 * @param {string} text
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(text, maxLen = 120) {
  if (!text || text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '…'
}

/**
 * Get a relative time string (e.g. "2 hours ago")
 * @param {string} isoString
 * @returns {string}
 */
export function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
