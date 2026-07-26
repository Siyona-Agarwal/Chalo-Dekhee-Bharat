import React from 'react'
import { Link } from 'react-router-dom'
import './auth.css'

export default function AuthLayout({ title, description, children }) {
  return (
    <div className="auth-page">
      <section className="auth-story">
        <Link className="auth-brand" to="/" tabIndex={-1}>
          <span className="auth-brand-mark">भारत</span>
          <span>Chalo Dekhe Bharat!</span>
        </Link>
        <div className="auth-map-orbit auth-map-orbit-one" />
        <div className="auth-map-orbit auth-map-orbit-two" />
        <div className="auth-story-copy">
          <p className="auth-eyebrow">YOUR DIGITAL PASSPORT TO INDIA</p>
          <h1>Every journey starts with a place to call your own.</h1>
          <p>Save the stories, landmarks, and routes that make India unforgettable.</p>
        </div>
        <div className="auth-route-card">
          <span className="auth-route-dot" />
          <span>Discover more. Travel deeper.</span>
        </div>
      </section>

      <section className="auth-panel">
        <Link className="auth-mobile-brand" to="/">
          <span>भारत</span> Chalo Dekhe Bharat!
        </Link>
        <div className="auth-card">
          <p className="auth-card-kicker">WELCOME, TRAVELLER</p>
          <h2>{title}</h2>
          <p className="auth-card-description">{description}</p>
          {children}
          <Link className="auth-explore-link" to="/">← Explore India without signing in</Link>
        </div>
      </section>
    </div>
  )
}
