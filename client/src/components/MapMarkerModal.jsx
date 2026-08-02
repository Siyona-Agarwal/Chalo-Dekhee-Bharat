import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/react'
import { usePassport } from '../context/PassportContext.jsx'
import galleryData from '../data/gallery.json'
import statePages from '../data/statePages.json'
import { getStories, postStory, deleteStory, STORIES_API_BASE } from '../services/storiesApi.js'
import Icon from './Icon.jsx'
import './MapMarkerModal.css'

// ── Constants ─────────────────────────────────────────────────────────────────
const TABS = ['Gallery', 'Explorer Stories']
const AVATAR_EMOJIS = ['🧭', '🌸', '🏔️', '🌊', '🌴', '🦁', '🎨', '⛵', '🏯', '✨', '🌄', '🎭', '🐘', '🕌', '🌺', '🏕️']

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getStatePhotos(stateName) {
  if (!stateName) return []
  const lower = stateName.toLowerCase()
  return galleryData.filter(
    (p) => p.region?.toLowerCase().includes(lower) || p.title?.toLowerCase().includes(lower),
  )
}

// Maps short 2-letter India SVG map codes → statePages.json IDs
const MAP_CODE_TO_PAGE_ID = {
  an: 'andaman-nicobar', ap: 'andhra-pradesh', ar: 'arunachal-pradesh', as: 'assam',
  br: 'bihar', ch: 'chandigarh', ct: 'chhattisgarh', dn: 'dadra-nagar-haveli',
  dd: 'daman-diu', dl: 'delhi', ga: 'goa', gj: 'gujarat', hr: 'haryana',
  hp: 'himachal-pradesh', jk: 'jammu-kashmir', jh: 'jharkhand', ka: 'karnataka',
  kl: 'kerala', la: 'jammu-kashmir', ld: 'lakshadweep', mp: 'madhya-pradesh',
  mh: 'maharashtra', mn: 'manipur', ml: 'meghalaya', mz: 'mizoram',
  nl: 'nagaland', or: 'odisha', py: 'puducherry', pb: 'punjab',
  rj: 'rajasthan', sk: 'sikkim', tn: 'tamil-nadu', tg: 'telangana',
  tr: 'tripura', up: 'uttar-pradesh', uk: 'uttarakhand', ut: 'uttarakhand', wb: 'west-bengal',
}

function getStateData(stateId) {
  if (!stateId) return null
  const lower = stateId.toLowerCase()
  const mappedId = MAP_CODE_TO_PAGE_ID[lower] || lower
  return statePages.find(
    (s) => s.id === mappedId || s.id === lower || s.name?.toLowerCase() === lower,
  ) || null
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PhotoGrid({ photos, passport, addToWishlist, removeFromWishlist }) {
  if (!photos.length) {
    return (
      <div className="mmm-no-photos">
        <p>No gallery photos found for this state yet.</p>
      </div>
    )
  }

  const isWishlisted = (photo) => passport.wishlist.some((w) => w.id === photo.id)

  return (
    <div className="mmm-photo-grid">
      {photos.map((photo, i) => (
        <motion.div
          key={photo.id}
          className="mmm-photo-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.35 }}
        >
          <img
            src={photo.imageUrl || photo.dayImageUrl}
            alt={photo.title}
            loading="lazy"
          />
          <div className="mmm-photo-overlay">
            <p className="mmm-photo-title">{photo.title}</p>
            <p className="mmm-photo-region">{photo.region}</p>
          </div>
          <button
            className={`mmm-wishlist-btn${isWishlisted(photo) ? ' wishlisted' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              isWishlisted(photo)
                ? removeFromWishlist(photo.id)
                : addToWishlist({
                    id: photo.id,
                    title: photo.title,
                    imageUrl: photo.imageUrl || photo.dayImageUrl,
                    region: photo.region,
                    category: photo.category,
                  })
            }}
            aria-label={isWishlisted(photo) ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isWishlisted(photo) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isWishlisted(photo) ? '♥' : '♡'}
          </button>
        </motion.div>
      ))}
    </div>
  )
}

function StoryCard({ story, currentUserId, onDelete }) {
  return (
    <motion.div
      className="mmm-story-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      layout
    >
      <div className="mmm-story-top">
        <div className="mmm-story-avatar" aria-hidden="true">
          {story.avatarEmoji}
        </div>
        <div className="mmm-story-meta">
          <p className="mmm-story-author">{story.explorerName}</p>
          <span className="mmm-story-date">{formatDate(story.createdAt)}</span>
        </div>
        {story.isSeeded && (
          <span className="mmm-story-seeded-badge">Community</span>
        )}
        {!story.isSeeded && story.clerkUserId === currentUserId && (
          <button
            className="mmm-story-delete-btn"
            onClick={() => onDelete(story.id)}
            aria-label="Delete story"
            title="Delete your story"
          >
            ✕
          </button>
        )}
      </div>
      <p className="mmm-story-text">{story.text}</p>
      {story.photoUrl && (
        <img
          className="mmm-story-photo"
          src={`${STORIES_API_BASE}${story.photoUrl}`}
          alt="Story photo"
          loading="lazy"
        />
      )}
    </motion.div>
  )
}

function AddStoryForm({ stateId, onSuccess, onCancel, token, defaultName }) {
  const [name, setName] = useState(defaultName || '')
  const [avatar, setAvatar] = useState('🧭')
  const [text, setText] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const charCount = text.length
  const charClass = charCount > 280 ? 'over' : charCount > 240 ? 'warn' : ''

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Please enter your name.'); return }
    if (!text.trim()) { setError('Please write something about your adventure.'); return }
    if (charCount > 280) { setError('Story must be 280 characters or less.'); return }

    setSubmitting(true)
    setError(null)
    try {
      const newStory = await postStory({
        stateId,
        explorerName: name.trim(),
        avatarEmoji: avatar,
        text: text.trim(),
        photo,
        token,
      })
      onSuccess(newStory)
    } catch (err) {
      setError(err.message || 'Failed to post story. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.form
      className="mmm-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <h3 className="mmm-form-title">📍 Pin Your Adventure</h3>

      <div className="mmm-form-row">
        {/* Name */}
        <div className="mmm-form-group">
          <label className="mmm-form-label" htmlFor="mmm-name">Your name</label>
          <input
            id="mmm-name"
            className="mmm-form-input"
            type="text"
            placeholder="Explorer name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        {/* Avatar emoji */}
        <div className="mmm-form-group">
          <label className="mmm-form-label">Avatar</label>
          <div className="mmm-emoji-grid">
            {AVATAR_EMOJIS.map((em) => (
              <button
                key={em}
                type="button"
                className={`mmm-emoji-btn${avatar === em ? ' selected' : ''}`}
                onClick={() => setAvatar(em)}
                aria-label={`Select ${em} as avatar`}
                aria-pressed={avatar === em}
              >
                {em}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Story text */}
      <div className="mmm-form-group">
        <label className="mmm-form-label" htmlFor="mmm-text">Your adventure story</label>
        <textarea
          id="mmm-text"
          className="mmm-form-textarea"
          placeholder="What made this place unforgettable? (280 characters)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <span className={`mmm-char-count ${charClass}`}>{charCount}/280</span>
      </div>

      {/* Photo upload */}
      <div className="mmm-form-group">
        <label className="mmm-form-label">Photo (optional)</label>
        <div className="mmm-upload-area">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handlePhotoChange}
            aria-label="Upload a photo for your story"
          />
          {photoPreview ? (
            <img className="mmm-upload-preview" src={photoPreview} alt="Preview" />
          ) : (
            <p className="mmm-upload-label">
              📷 Click to upload a photo (JPEG, PNG, WebP — max 5 MB)
            </p>
          )}
        </div>
      </div>

      {error && <p className="mmm-form-error">{error}</p>}

      <div className="mmm-form-actions">
        <button type="button" className="mmm-cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="mmm-submit-btn"
          disabled={submitting || charCount > 280}
        >
          {submitting ? 'Posting…' : 'Post Adventure'}
        </button>
      </div>
    </motion.form>
  )
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function MapMarkerModal({ stateId, onClose }) {
  const navigate = useNavigate()
  const { passport, addToWishlist, removeFromWishlist } = usePassport()
  const { isSignedIn, user } = useUser()
  const { getToken } = useAuth()

  const [activeTab, setActiveTab] = useState(0)
  const [stories, setStories] = useState([])
  const [storiesLoading, setStoriesLoading] = useState(false)
  const [storiesError, setStoriesError] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const stateData = getStateData(stateId)
  const photos = getStatePhotos(stateData?.name || stateId)

  // Resolve display name
  const stateName = stateData?.name
    || (stateId ? stateId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'India')

  // Fetch stories when tab is switched to stories or on mount
  useEffect(() => {
    if (activeTab !== 1 || !stateId) return
    setStoriesLoading(true)
    setStoriesError(null)
    getStories(stateId.toLowerCase())
      .then(setStories)
      .catch(() => setStoriesError('Could not load stories. Is the Python service running on port 3002?'))
      .finally(() => setStoriesLoading(false))
  }, [activeTab, stateId])

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleStoryPosted = useCallback((newStory) => {
    setStories((prev) => [newStory, ...prev])
    setShowForm(false)
  }, [])

  const handleDeleteStory = useCallback(async (storyId) => {
    try {
      const token = await getToken()
      await deleteStory(storyId, token)
      setStories((prev) => prev.filter((s) => s.id !== storyId))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }, [getToken])

  const handleAddClick = useCallback(() => {
    setShowForm(true)
  }, [])

  // Token wrapper for AddStoryForm
  const [clerkToken, setClerkToken] = useState(null)
  useEffect(() => {
    if (!showForm || !isSignedIn) return
    getToken().then(setClerkToken)
  }, [showForm, isSignedIn, getToken])

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="mmm-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        role="dialog"
        aria-modal="true"
        aria-label={`Explorer Stories for ${stateName}`}
      >
        {/* Panel */}
        <motion.div
          className="mmm-panel"
          initial={{ y: '100%', opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 280, mass: 0.9 }}
        >
          {/* Drag handle (mobile) */}
          <div className="mmm-handle" aria-hidden="true" />

          {/* Close */}
          <button
            className="mmm-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>

          {/* Hero */}
          <div className="mmm-hero">
            <img
              className="mmm-hero-img"
              src={stateData?.heroImage || '/images/states/default.jpg'}
              alt={stateName}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <div className="mmm-hero-gradient" />
            <div className="mmm-hero-content">
              <h2 className="mmm-state-name">{stateName}</h2>
              {stateData?.tagline && (
                <p className="mmm-state-tagline">{stateData.tagline}</p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mmm-tabs" role="tablist">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === i}
                className={`mmm-tab${activeTab === i ? ' active' : ''}`}
                onClick={() => setActiveTab(i)}
                id={`mmm-tab-${i}`}
                aria-controls={`mmm-tabpanel-${i}`}
              >
                {tab}
                {activeTab === i && (
                  <motion.div
                    className="mmm-tab-indicator"
                    layoutId="mmm-tab-underline"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="mmm-body">
            {/* ── Tab 0: Gallery ── */}
            {activeTab === 0 && (
              <div
                role="tabpanel"
                id="mmm-tabpanel-0"
                aria-labelledby="mmm-tab-0"
              >
                <PhotoGrid
                  photos={photos}
                  passport={passport}
                  addToWishlist={addToWishlist}
                  removeFromWishlist={removeFromWishlist}
                />
              </div>
            )}

            {/* ── Tab 1: Stories ── */}
            {activeTab === 1 && (
              <div
                role="tabpanel"
                id="mmm-tabpanel-1"
                aria-labelledby="mmm-tab-1"
              >
                {/* Header row */}
                <div className="mmm-stories-header">
                  <span className="mmm-stories-count">
                    {storiesLoading ? 'Loading…' : `${stories.length} stor${stories.length !== 1 ? 'ies' : 'y'}`}
                  </span>
                  {isSignedIn ? (
                    !showForm && (
                      <button className="mmm-add-btn" onClick={handleAddClick}>
                        <span>+</span> Add Adventure
                      </button>
                    )
                  ) : (
                    <span className="mmm-sign-in-prompt">
                      <Icon name="passport" size={13} /> Sign in to share your adventure
                    </span>
                  )}
                </div>

                {/* Add story form */}
                <AnimatePresence>
                  {showForm && isSignedIn && (
                    <AddStoryForm
                      key="add-form"
                      stateId={stateId.toLowerCase()}
                      token={clerkToken}
                      defaultName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                      onSuccess={handleStoryPosted}
                      onCancel={() => setShowForm(false)}
                    />
                  )}
                </AnimatePresence>

                {/* Stories list */}
                {storiesLoading ? (
                  <div className="mmm-loading">
                    <div className="mmm-spinner" role="status" aria-label="Loading stories" />
                    Loading stories…
                  </div>
                ) : storiesError ? (
                  <div className="mmm-no-stories">
                    <span className="mmm-no-stories-emoji">⚠️</span>
                    {storiesError}
                  </div>
                ) : stories.length === 0 ? (
                  <div className="mmm-no-stories">
                    <span className="mmm-no-stories-emoji">🧭</span>
                    No stories here yet.<br />Be the first explorer to share an adventure!
                  </div>
                ) : (
                  <div className="mmm-story-list">
                    <AnimatePresence>
                      {stories.map((story) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          currentUserId={user?.id}
                          onDelete={handleDeleteStory}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {/* Visit State Page button */}
            <button
              className="mmm-visit-btn"
              onClick={() => { navigate(`/state/${encodeURIComponent(stateId.toLowerCase())}`) ; onClose() }}
            >
              <Icon name="location" size={15} />
              Explore {stateName} in detail →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
