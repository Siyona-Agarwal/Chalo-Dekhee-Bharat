/**
 * API service module — all backend calls go through here.
 * The GROQ_API_KEY is NEVER exposed here; it lives on the Express server.
 * All calls use the relative /api prefix (proxied by Vite in dev, same-origin in prod).
 */

const API_BASE = '/api'

/**
 * Generate a travel itinerary via the AI Planner endpoint.
 *
 * @param {Object} payload
 * @param {string} payload.destination
 * @param {number} payload.days
 * @param {string} payload.budget - 'Budget' | 'Comfort' | 'Luxury'
 * @param {string} payload.style  - 'Budget' | 'Comfort' | 'Luxury'
 * @param {string[]} payload.interests
 * @param {Object} payload.passportContext - { stamps, wishlist, visitedStates }
 * @returns {Promise<Object>} structured itinerary JSON
 */
export async function generateItinerary(payload) {
  const response = await fetch(`${API_BASE}/itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    // Parse error message safely — never expose raw stack traces to UI
    let errorMsg = 'Failed to generate itinerary. Please try again.'
    try {
      const errorBody = await response.json()
      if (typeof errorBody.error === 'string') {
        errorMsg = errorBody.error
      }
    } catch {
      // ignore parse errors on error responses
    }
    throw new Error(errorMsg)
  }

  return response.json()
}
