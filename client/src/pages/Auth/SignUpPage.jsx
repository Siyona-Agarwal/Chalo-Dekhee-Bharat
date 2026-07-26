import React from 'react'
import { SignUp, useAuth } from '@clerk/react'
import { Navigate } from 'react-router-dom'
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

export default function SignUpPage() {
  const { isLoaded, isSignedIn } = useAuth()

  if (isLoaded && isSignedIn) return <Navigate to="/passport-setup" replace />

  return (
    <AuthLayout title="Create your travel identity" description="Save the places that call to you and make every future journey more personal.">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/passport-setup"
        appearance={appearance}
      />
    </AuthLayout>
  )
}
