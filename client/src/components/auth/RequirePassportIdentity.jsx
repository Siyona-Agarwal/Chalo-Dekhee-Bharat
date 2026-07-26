import React from 'react'
import { useUser } from '@clerk/react'
import { Navigate, useLocation } from 'react-router-dom'
import { usePassport } from '../../context/PassportContext.jsx'

export default function RequirePassportIdentity({ children }) {
  const { user } = useUser()
  const { passport } = usePassport()
  const location = useLocation()
  const identity = passport.identity || {}
  const hasFirstName = Boolean(identity.firstName?.trim())
  const belongsToCurrentUser = Boolean(user?.id && identity.clerkUserId === user.id)

  if ((!hasFirstName || !belongsToCurrentUser) && location.pathname !== '/passport-setup') {
    return <Navigate to="/passport-setup" replace state={{ from: location.pathname }} />
  }

  return children
}
