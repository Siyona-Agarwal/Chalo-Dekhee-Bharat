import React from 'react'
import { useAuth } from '@clerk/react'
import { Navigate, useLocation } from 'react-router-dom'

export default function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()

  if (!isLoaded) {
    return <div aria-live="polite" style={{ minHeight: '100vh', background: 'var(--color-deep-900)' }} />
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  }

  return children
}
