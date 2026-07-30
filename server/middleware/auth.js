'use strict'

const { getAuth } = require('@clerk/express')

const clerkConfigured = Boolean(
  process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
)
const authRequired = process.env.REQUIRE_AUTH === 'true'

function requireAuthWhenConfigured(req, res, next) {
  if (!clerkConfigured) {
    if (authRequired) {
      return res.status(503).json({ error: 'Authentication is not configured on the server.' })
    }
    req.userId = null
    return next()
  }

  return requireAuth(req, res, next)
}

function requireAuth(req, res, next) {
  if (!clerkConfigured) {
    return res.status(503).json({ error: 'Authentication is not configured on the server.' })
  }

  const { isAuthenticated, userId } = getAuth(req)
  if (!isAuthenticated || !userId) {
    return res.status(401).json({ error: 'Authentication is required.' })
  }

  req.userId = userId
  return next()
}

module.exports = { clerkConfigured, requireAuth, requireAuthWhenConfigured }
