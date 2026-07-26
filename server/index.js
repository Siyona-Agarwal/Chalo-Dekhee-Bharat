'use strict'
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { clerkMiddleware, getAuth } = require('@clerk/express')
const plannerRouter = require('./routes/planner')

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

// ── CORS (strict allow-list) ────────────────────────────────────────────────
// NOTE(security): Only allow the configured frontend origin. Never use '*'.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173'

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl during dev, same-origin)
    if (!origin || origin === ALLOWED_ORIGIN) {
      return callback(null, true)
    }
    return callback(new Error(`CORS: Origin ${origin} not allowed`))
  },
  methods: ['GET', 'POST'],
  // Authorization is required for Clerk bearer tokens on protected API calls.
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}))

// Clerk parses incoming session cookies and bearer tokens. Public routes stay public;
// individual routes below explicitly decide whether authentication is required.
app.use(clerkMiddleware())

// ── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' })) // Limit body size to prevent DoS

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

const rateLimitStore = new Map()

function rateLimiter(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, [])
  }

  // Filter out old timestamps outside the window
  const timestamps = rateLimitStore.get(ip).filter(ts => ts > windowStart)
  timestamps.push(now)
  rateLimitStore.set(ip, timestamps)

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
  const { isAuthenticated, userId } = getAuth(req)

  if (!isAuthenticated || !userId) {
    return res.status(401).json({ error: 'Authentication is required.' })
  }

  return res.json({ userId })
})

app.use('/api', rateLimiter, plannerRouter)

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// ── Global error handler ─────────────────────────────────────────────────────
// NOTE(security): Never expose stack traces or internal errors to the client.
app.use((err, req, res, _next) => {
  console.error('[Server Error]', err.message)
  res.status(500).json({ error: 'An internal error occurred. Please try again.' })
})

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[Server] Running on http://127.0.0.1:${PORT}`)
})
