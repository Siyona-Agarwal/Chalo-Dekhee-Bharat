import React from 'react'
import { SignIn, useAuth } from '@clerk/react'
import { Navigate, useLocation } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout.jsx'

const appearance = {
  variables: {
    colorPrimary: '#FF6B2B',
    colorBackground: '#FFFDF8',
    colorText: '#16131F',
    colorTextSecondary: '#665E72',
    colorInputBackground: '#FFFDF8',
    colorInputText: '#16131F',
    colorNeutral: '#6B6472',
    colorDanger: '#B42318',
    colorSuccess: '#147A3D',
    colorRing: 'rgba(255, 107, 43, 0.34)',
    fontFamily: 'var(--font-body)',
    borderRadius: '0.9rem',
  },
  options: { socialButtonsVariant: 'blockButton', socialButtonsPlacement: 'top' },
  elements: {
    rootBox: 'cdb-clerk-root',
    cardBox: 'cdb-clerk-card-box',
    card: 'cdb-clerk-card',
    socialButtonsBlockButton: 'cdb-social-button',
    formButtonPrimary: 'cdb-primary-button',
    formFieldInput: 'cdb-form-input',
    formFieldLabel: 'cdb-form-label',
    footerActionLink: 'cdb-footer-link',
  },
}

export default function SignInPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()
  const fallbackRedirectUrl = location.state?.from || '/passport-setup'

  if (isLoaded && isSignedIn) return <Navigate to="/passport-setup" replace />

  return (
    <AuthLayout title="Continue your journey" description="Sign in to keep your travel identity close, wherever your next discovery takes you.">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl={fallbackRedirectUrl}
        appearance={appearance}
      />
    </AuthLayout>
  )
}
