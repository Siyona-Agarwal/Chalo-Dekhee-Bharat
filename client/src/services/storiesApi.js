/**
 * storiesApi.js — Thin API client for the Python FastAPI stories service.
 *
 * All requests go to the configured Python microservice.
 * Auth token is fetched via Clerk's getToken() and passed as Bearer token.
 */

export const STORIES_API_BASE = import.meta.env.VITE_STORIES_API_URL || 'http://localhost:3002'

/**
 * Fetch all explorer stories for a given state.
 * @param {string} stateId — e.g. "rajasthan", "kerala"
 * @returns {Promise<Array>}
 */
export async function getStories(stateId) {
  const res = await fetch(`${STORIES_API_BASE}/api/stories/${encodeURIComponent(stateId)}`)
  if (!res.ok) {
    throw new Error(`Failed to load stories: ${res.status}`)
  }
  return res.json()
}

/**
 * Fetch all stories posted by the currently signed-in user.
 * Used to render adventure pins on the map.
 * @param {string} clerkUserId
 * @param {string} token — Clerk session token
 * @returns {Promise<Array>}
 */
export async function getUserStories(clerkUserId, token) {
  const res = await fetch(`${STORIES_API_BASE}/api/stories/user/${encodeURIComponent(clerkUserId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error(`Failed to load user stories: ${res.status}`)
  }
  return res.json()
}

/**
 * Post a new explorer story (multipart/form-data).
 * @param {Object} params
 * @param {string} params.stateId
 * @param {string} params.explorerName
 * @param {string} params.avatarEmoji
 * @param {string} params.text
 * @param {File|null} params.photo
 * @param {string} params.token — Clerk session token
 * @returns {Promise<Object>} the created story
 */
export async function postStory({ stateId, explorerName, avatarEmoji, text, photo, token }) {
  const formData = new FormData()
  formData.append('stateId', stateId)
  formData.append('explorerName', explorerName)
  formData.append('avatarEmoji', avatarEmoji)
  formData.append('text', text)
  if (photo) {
    formData.append('photo', photo)
  }

  const res = await fetch(`${STORIES_API_BASE}/api/stories`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `Server error ${res.status}`)
  }

  return res.json()
}

/**
 * Delete a story by ID.
 * @param {number} storyId
 * @param {string} token — Clerk session token
 */
export async function deleteStory(storyId, token) {
  const res = await fetch(`${STORIES_API_BASE}/api/stories/${storyId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `Server error ${res.status}`)
  }
}
