import React, { useEffect, useState } from 'react'
import { SignOutButton, UserButton, useAuth, useUser } from '@clerk/react'
import { Link } from 'react-router-dom'
import { authenticatedFetch } from '../services/authenticatedApi.js'

export default function AccountPage() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [serverUserId, setServerUserId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    authenticatedFetch(getToken, '/api/account/me')
      .then(async response => {
        if (!response.ok) throw new Error('We could not load your account details.')
        return response.json()
      })
      .then(data => { if (active) setServerUserId(data.userId) })
      .catch(() => { if (active) setError('Your account is signed in, but the local API is unavailable right now.') })

    return () => { active = false }
  }, [getToken])

  return (
    <section style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--color-deep-900)', padding: 'clamp(32px, 6vw, 72px) 24px', color: '#fff' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(28px, 5vw, 50px)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '30px' }}>
          <UserButton afterSignOutUrl="/" />
          <div>
            <p style={{ margin: 0, color: '#fbbf24', fontSize: '.74rem', fontWeight: 700, letterSpacing: '.13em' }}>TRAVEL ACCOUNT</p>
            <h1 style={{ margin: '5px 0 0', fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Welcome, {user?.firstName || 'traveller'}.</h1>
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,.72)', lineHeight: 1.7 }}>Your Clerk identity is now ready for future saved journeys and personalised travel features. Your existing Digital Passport remains private to this browser and has not been changed.</p>
        <div style={{ margin: '28px 0', padding: '16px', borderRadius: '12px', background: 'rgba(255,107,43,.1)', border: '1px solid rgba(255,107,43,.25)' }}>
          <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.78rem', marginBottom: '6px' }}>CLERK USER ID</div>
          <code style={{ color: '#fff', overflowWrap: 'anywhere' }}>{serverUserId || user?.id || 'Loading…'}</code>
          {error && <p role="status" style={{ color: '#fbbf24', margin: '12px 0 0', fontSize: '.86rem' }}>{error}</p>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <Link to="/passport" style={{ padding: '11px 16px', background: 'linear-gradient(135deg, #FF6B2B, #d97706)', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>Open Digital Passport</Link>
          <SignOutButton redirectUrl="/"><button type="button" style={{ padding: '11px 16px', border: '1px solid rgba(255,255,255,.28)', background: 'transparent', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>Sign out</button></SignOutButton>
        </div>
      </div>
    </section>
  )
}
