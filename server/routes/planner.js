'use strict'

const express = require('express')
const router = express.Router()
const OpenAI = require('openai')

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'

const openai = new OpenAI({
  apiKey: NVIDIA_API_KEY,
  baseURL: NVIDIA_BASE_URL,
})

// ── Input validation helpers ──────────────────────────────────────────────
const VALID_BUDGETS = ['Budget', 'Comfort', 'Luxury']
const VALID_STYLES  = [
  'Budget', 'Comfort', 'Luxury', 'Adventure', 'Cultural', 'Family',
  'Relaxation', 'Food & Culinary', 'Wildlife & Nature', 'Spiritual',
]
const VALID_INTERESTS = [
  'History', 'Nature', 'Wildlife', 'Food', 'Festivals',
  'Adventure', 'Yoga', 'Architecture', 'Photography', 'Beaches',
  'Yoga & Wellness', 'Adventure Sports', 'Art & Craft',
]

function sanitizeString(val, maxLen = 100) {
  if (typeof val !== 'string') return null
  return val.trim().slice(0, maxLen).replace(/[<>"]/g, '') // Strip basic HTML chars
}

function normalizePassportContext(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { stamps: [], wishlist: [], visitedStates: [] }
  }

  const stamps = Array.isArray(value.stamps)
    ? value.stamps.slice(0, 50).map(stamp => {
      if (typeof stamp === 'string') return sanitizeString(stamp, 80)
      return stamp && typeof stamp === 'object'
        ? sanitizeString(stamp.name || stamp.eraId, 80)
        : null
    }).filter(Boolean)
    : []
  const wishlist = Array.isArray(value.wishlist)
    ? value.wishlist.slice(0, 50).map(item => {
      if (typeof item === 'string') return sanitizeString(item, 100)
      return item && typeof item === 'object'
        ? { title: sanitizeString(item.title, 100), region: sanitizeString(item.region, 50) }
        : null
    }).filter(Boolean)
    : []
  const visitedStates = Array.isArray(value.visitedStates)
    ? value.visitedStates.slice(0, 50).map(state => sanitizeString(state, 50)).filter(Boolean)
    : []

  return { stamps, wishlist, visitedStates }
}

function validateItineraryInput(body) {
  const errors = []

  const destination = sanitizeString(body.destination, 80)
  if (!destination || destination.length < 2) {
    errors.push('destination is required (2–80 characters)')
  }

  const days = parseInt(body.days, 10)
  if (isNaN(days) || days < 1 || days > 30) {
    errors.push('days must be an integer between 1 and 30')
  }

  const budget = body.budget
  if (!VALID_BUDGETS.includes(budget)) {
    errors.push(`budget must be one of: ${VALID_BUDGETS.join(', ')}`)
  }

  // Allow single string or array of styles for multi-select support
  let selectedStyles = []
  if (Array.isArray(body.style)) {
    selectedStyles = body.style.filter(s => VALID_STYLES.includes(s))
  } else if (typeof body.style === 'string') {
    selectedStyles = body.style
      .split(',')
      .map(s => s.trim())
      .filter(s => VALID_STYLES.includes(s))
  }

  if (selectedStyles.length === 0) {
    errors.push(`style must contain at least one valid style: ${VALID_STYLES.join(', ')}`)
  }

  const style = selectedStyles.join(', ')

  const interests = Array.isArray(body.interests)
    ? body.interests.filter(i => VALID_INTERESTS.includes(i)).slice(0, 5)
    : []

  const origin = sanitizeString(body.origin, 50) || 'Unknown'
  const month = sanitizeString(body.month, 20) || 'Not sure yet'
  const travelers = sanitizeString(body.travelers, 30) || 'Solo'
  const accommodation = sanitizeString(body.accommodation, 30) || 'Hotel'
  const diet = sanitizeString(body.diet, 30) || 'No preference'
  const pace = sanitizeString(body.pace, 20) || 'Balanced'

  // Passport context — optional, used for personalization
  const passportContext = normalizePassportContext(body.passportContext)

  return { errors, destination, days, budget, style, interests, origin, month, travelers, accommodation, diet, pace, passportContext }
}

// ── Build personalized prompt ─────────────────────────────────────────────
function buildSystemPrompt(destination, days, budget, style, interests, origin, month, travelers, accommodation, diet, pace, passportContext) {
  const { stamps = [], wishlist = [], visitedStates = [] } = passportContext

  const stampNames = stamps.filter(Boolean)
  const wishlistItems = wishlist.map(w => {
    if (typeof w === 'string') return w
    return w.title ? `${w.title} (${w.region || 'India'})` : null
  }).filter(Boolean)

  let personalizationNote = ''
  if (stampNames.length > 0) {
    personalizationNote += `\n- The user has collected Heritage Stamps for: ${stampNames.join(', ')}. Weight suggestions toward regions/eras they've already explored.`
  }
  if (wishlistItems.length > 0) {
    personalizationNote += `\n- The user has wishlisted: ${wishlistItems.join(', ')}. Prioritize these if they match the destination.`
  }
  if (visitedStates.length > 0) {
    personalizationNote += `\n- The user has explored: ${visitedStates.join(', ')}. Suggest complementary destinations they haven't visited yet.`
  }

  return `You are an expert Indian travel planner and cultural guide. Generate a detailed, realistic, day-by-day travel itinerary for the given destination.

USER PREFERENCES:
- Origin City: ${origin} (Base transport recommendations on this origin)
- Travel Month/Season: ${month} (Tailor the packingList and weather note to this month)
- Travelers & Trip Type: ${travelers} (Match activities to this group type)
- Accommodation Preference: ${accommodation} (Recommend accommodation types matching this)
- Dietary Preference: ${diet} (Provide food suggestions respecting this diet)
- Pace: ${pace} (Match daily activities and downtime to this pace)

PERSONALIZATION CONTEXT (use this to bias your suggestions):${personalizationNote || '\n- No prior exploration data available; generate a general recommendation.'}

OUTPUT FORMAT: You MUST respond with ONLY valid JSON matching this exact schema (no markdown, no commentary):
{
  "destination": string,
  "totalDays": number,
  "budgetLevel": string,
  "estimatedTotalCost": { "INR": number, "USD": number },
  "weatherNote": string,
  "bestTimeToVisit": string,
  "packingList": string[],
  "days": [
    {
      "day": number,
      "theme": string,
      "morning": { "activity": string, "location": string, "duration": string, "tip": string },
      "afternoon": { "activity": string, "location": string, "duration": string, "tip": string },
      "evening": { "activity": string, "location": string, "duration": string, "tip": string },
      "meals": { "breakfast": string, "lunch": string, "dinner": string },
      "accommodation": { "name": string, "type": string, "estimatedCost": { "INR": number } },
      "transport": string,
      "estimatedDayCost": { "INR": number, "USD": number }
    }
  ],
  "personalizedNote": string
}

The personalizedNote field MUST explain how the user's exploration history (museum stamps, wishlist, visited states) influenced the itinerary. If no context was available, say so honestly.`
}

// ── POST /api/itinerary ───────────────────────────────────────────────────
router.post('/itinerary', async (req, res) => {
  const { errors, destination, days, budget, style, interests, origin, month, travelers, accommodation, diet, pace, passportContext } =
    validateItineraryInput(req.body)

  if (errors.length > 0) {
    return res.status(400).json({ error: `Validation failed: ${errors.join('; ')}` })
  }

  const systemPrompt = buildSystemPrompt(destination, days, budget, style, interests, origin, month, travelers, accommodation, diet, pace, passportContext)
  const userMessage = `Generate a ${days}-day ${budget} ${style} travel itinerary for ${destination}, India.${interests.length > 0 ? ` Focus on: ${interests.join(', ')}.` : ''}`

  try {
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-8b-instruct",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 4096,
      stream: false
    })

    const rawContent = completion.choices[0]?.message?.content

    if (!rawContent) {
      console.error('[Planner] Empty response from AI')
      return res.status(502).json({ error: 'Received an empty response from the AI. Please try again.' })
    }

    // Parse and validate the JSON response
    // The Llama 3.3 instruct model might occasionally wrap JSON in markdown blocks (e.g., \`\`\`json ... \`\`\`)
    let jsonStr = rawContent
    if (jsonStr.includes('\`\`\`json')) {
      jsonStr = jsonStr.split('\`\`\`json')[1].split('\`\`\`')[0].trim()
    } else if (jsonStr.includes('\`\`\`')) {
      jsonStr = jsonStr.split('\`\`\`')[1].split('\`\`\`')[0].trim()
    }

    let itinerary
    try {
      itinerary = JSON.parse(jsonStr)
    } catch (parseErr) {
      console.error('[Planner] Failed to parse AI JSON response:', parseErr, jsonStr)
      return res.status(502).json({ error: 'AI returned an invalid response. Please try again.' })
    }

    // Validate essential fields exist before sending to client
    if (!itinerary.days || !Array.isArray(itinerary.days)) {
      return res.status(502).json({ error: 'AI response missing itinerary days. Please try again.' })
    }

    // Normalize days to UI-expected shape: { title, theme, activities[], meal }
    const normalizedDays = itinerary.days.map((day) => {
      const activities = []
      if (day.morning)   activities.push({ time: 'Morning',   activity: day.morning.activity,   note: day.morning.tip   || day.morning.location })
      if (day.afternoon) activities.push({ time: 'Afternoon', activity: day.afternoon.activity, note: day.afternoon.tip || day.afternoon.location })
      if (day.evening)   activities.push({ time: 'Evening',   activity: day.evening.activity,   note: day.evening.tip   || day.evening.location })
      // Fallback: if activities[] array already present from model
      if (activities.length === 0 && Array.isArray(day.activities)) {
        activities.push(...day.activities)
      }
      const meal = day.meals ? `${day.meals.breakfast || ''} · ${day.meals.lunch || ''} · ${day.meals.dinner || ''}`.replace(/^ · | · $/g, '') : null
      return {
        title: day.title || `Day ${day.day || ''}`.trim(),
        theme: day.theme || '',
        activities,
        meal: meal || null,
      }
    })

    const normalized = {
      destination: itinerary.destination,
      summary: itinerary.summary || `${days}-day ${style} itinerary for ${destination}`,
      weatherNote: itinerary.weatherNote || itinerary.bestTimeToVisit || '',
      packingList: itinerary.packingList || [],
      personalizedNote: itinerary.personalizedNote || '',
      days: normalizedDays,
      estimatedTotalCost: itinerary.estimatedTotalCost,
    }

    return res.json(normalized)

  } catch (err) {
    // Network/fetch errors
    console.error('[Planner] OpenAI SDK error:', err.message)
    return res.status(502).json({ error: 'Could not reach the AI service. Please check your connection and try again.' })
  }
})

module.exports = router
