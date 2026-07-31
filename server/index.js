'use strict'
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const express = require('express')
const cors = require('cors')
const { clerkMiddleware } = require('@clerk/express')
const plannerRouter = require('./routes/planner')
const { clerkConfigured, requireAuth } = require('./middleware/auth')

const app = express()
app.disable('x-powered-by')
const PORT = parseInt(process.env.PORT || '3001', 10)

// ── CORS (strict allow-list) ────────────────────────────────────────────────
// NOTE(security): Only allow the configured frontend origin. Never use '*'.
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl during dev, same-origin)
    if (!origin || ALLOWED_ORIGINS.has(origin)) {
      return callback(null, true)
    }
    const error = new Error('CORS origin not allowed')
    error.status = 403
    return callback(error)
  },
  methods: ['GET', 'POST'],
  // Authorization is required for Clerk bearer tokens on protected API calls.
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}))

// Clerk parses incoming session cookies and bearer tokens. Public routes stay public;
// individual routes below explicitly decide whether authentication is required.
if (clerkConfigured) {
  app.use(clerkMiddleware())
} else {
  console.warn('[Auth] Clerk is not configured; protected endpoints will be unavailable.')
  app.use((req, res, next) => next())
}

// ── API middleware ──────────────────────────────────────────────────────────
app.use('/api', (req, res, next) => {
  if (req.method === 'POST' && req.path === '/itinerary') return rateLimiter(req, res, next)
  return next()
})

app.use(express.json({ limit: '50kb', strict: true }))

app.use((err, req, res, next) => {
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON.' })
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' })
  }
  return next(err)
})

// ── Security Headers ────────────────────────────────────────────────────────
// NOTE(security): Applied to all responses.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Security-Policy', "default-src 'none'")
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  next()
})

// ── Simple in-memory rate limiter ──────────────────────────────────────────
// TODO(security): Replace with Redis-backed rate limiter for multi-instance prod deployments.
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 10              // max 10 requests/min per IP
const MAX_IN_FLIGHT = 2
const MAX_TRACKED_CLIENTS = 10000

const rateLimitStore = new Map()

function rateLimiter(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const existing = rateLimitStore.get(ip) || { timestamps: [], inFlight: 0, lastSeen: now }
  const timestamps = existing.timestamps.filter(ts => ts > windowStart)

  if (existing.inFlight >= MAX_IN_FLIGHT) {
    return res.status(429).json({ error: 'Too many itinerary requests in progress. Please try again shortly.' })
  }

  if (rateLimitStore.size >= MAX_TRACKED_CLIENTS && !rateLimitStore.has(ip)) {
    for (const [storedIp, entry] of rateLimitStore) {
      if (entry.lastSeen <= windowStart) rateLimitStore.delete(storedIp)
    }
    if (rateLimitStore.size >= MAX_TRACKED_CLIENTS) {
      return res.status(503).json({ error: 'Rate limiter is temporarily at capacity. Please try again later.' })
    }
  }

  timestamps.push(now)
  existing.timestamps = timestamps
  existing.inFlight += 1
  existing.lastSeen = now
  rateLimitStore.set(ip, existing)
  res.once('finish', () => {
    const current = rateLimitStore.get(ip)
    if (current) {
      current.inFlight = Math.max(0, current.inFlight - 1)
      current.lastSeen = Date.now()
    }
  })

  if (timestamps.length > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' })
  }

  next()
}

// ── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Minimal protected endpoint for the account page and future user-specific features.
app.get('/api/account/me', (req, res) => {
  return requireAuth(req, res, () => res.json({ userId: req.userId }))
})

app.use('/api', plannerRouter)

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// ── Global error handler ─────────────────────────────────────────────────────
// NOTE(security): Never expose stack traces or internal errors to the client.
app.use((err, req, res, _next) => {
  console.error('[Server Error]', err)
  const status = err?.status && err.status >= 400 && err.status < 500 ? err.status : 500
  res.status(status).json({
    error: status === 403 ? 'Origin is not allowed.' : 'An internal error occurred. Please try again.',
  })
})

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[Server] Running on http://127.0.0.1:${PORT}`)
})
