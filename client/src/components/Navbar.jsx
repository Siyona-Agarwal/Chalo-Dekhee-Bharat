import React, { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PassportWidget from './PassportWidget.jsx'

const NAV_LINKS = [
  { to: '/',          label: 'Home',      icon: '🏠' },
  { to: '/museum',    label: 'Museum',    icon: '🏛️' },
  { to: '/gallery',   label: 'Gallery',   icon: '🖼️' },
  { to: '/games',     label: 'Games',     icon: '🎮' },
  { to: '/planner',   label: 'Planner',   icon: '🗺️' },
  { to: '/passport',  label: 'Passport',  icon: '📖' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(15, 14, 23, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        gap: '16px',
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        aria-label="Chalo Dekhe Bharat! - Home"
        style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '1.6rem' }}>🇮🇳</span>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: '800',
            fontSize: '1.05rem',
            color: '#FF6B2B',
            lineHeight: 1.1,
          }}>
            Chalo Dekhe Bharat!
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Explore • Experience • Collect • Travel
          </div>
        </div>
      </Link>

      {/* Desktop nav links */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
        }}
        className="hidden-mobile"
      >
        {NAV_LINKS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            aria-label={label}
            style={({ isActive }) => ({
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              fontWeight: isActive ? '600' : '400',
              color: isActive ? '#FF6B2B' : 'rgba(255,255,255,0.65)',
              background: isActive ? 'rgba(255,107,43,0.12)' : 'transparent',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            })}
          >
            <span role="img" aria-hidden="true">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>

      {/* Passport Widget */}
      <div style={{ flexShrink: 0 }} className="hidden-mobile">
        <PassportWidget />
      </div>

      {/* Mobile Hamburger */}
      <button
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        onClick={() => setMenuOpen(o => !o)}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '1.5rem',
          cursor: 'pointer',
          padding: '4px',
        }}
        className="show-mobile"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '64px',
              left: 0,
              right: 0,
              background: 'rgba(15, 14, 23, 0.97)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '16px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {NAV_LINKS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? '#FF6B2B' : 'rgba(255,255,255,0.8)',
                  background: isActive ? 'rgba(255,107,43,0.12)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                })}
              >
                <span role="img" aria-hidden="true">{icon}</span>
                {label}
              </NavLink>
            ))}
            <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <PassportWidget />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
