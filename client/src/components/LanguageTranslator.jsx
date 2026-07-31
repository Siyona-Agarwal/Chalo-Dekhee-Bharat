import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'
import destinations from '../data/destinations.json'
import states from '../data/states.json'
import artifacts from '../data/artifacts.json'
import gallery from '../data/gallery.json'

const INTERNATIONAL_LANGUAGES = [
  ['en', 'English'], ['es', 'Español'], ['zh-CN', '中文 (简体)'], ['ar', 'العربية'],
  ['pt', 'Português'], ['fr', 'Français'], ['ru', 'Русский'], ['de', 'Deutsch'],
  ['ja', '日本語'], ['it', 'Italiano'],
]

const INDIAN_LANGUAGES = [
  ['hi', 'हिन्दी'], ['bn', 'বাংলা'], ['mr', 'मराठी'], ['te', 'తెలుగు'], ['ta', 'தமிழ்'],
  ['gu', 'ગુજરાતી'], ['ur', 'اردو'], ['kn', 'ಕನ್ನಡ'], ['ml', 'മലയാളം'], ['pa', 'ਪੰਜਾਬੀ'],
  ['or', 'ଓଡ଼ିଆ'], ['as', 'অসমীয়া'],
]

const LANGUAGES = [...INTERNATIONAL_LANGUAGES, ...INDIAN_LANGUAGES]
const PRESERVED_NAMES = [...new Set([
  ...destinations.flatMap(item => [item.name, ...(item.highlights || [])]),
  ...states.flatMap(item => [item.label, item.capital]),
  ...artifacts.map(item => item.name),
  ...gallery.flatMap(item => [item.title, item.region]),
  'India', 'Bharat', 'ISRO', 'Mangalyaan', 'Mohenjo-daro', 'UNESCO',
].filter(name => typeof name === 'string' && name.trim().length > 2))]
  .sort((a, b) => b.length - a.length)

function protectPlaceNames() {
  const walker = document.createTreeWalker(document.getElementById('root'), NodeFilter.SHOW_TEXT)
  const textNodes = []
  let node

  while ((node = walker.nextNode())) {
    const parent = node.parentElement
    if (!parent || parent.closest('.notranslate, [translate="no"], script, style, select, option, textarea, input')) continue
    if (PRESERVED_NAMES.some(name => node.nodeValue.includes(name))) textNodes.push(node)
  }

  for (const textNode of textNodes) {
    let remaining = textNode.nodeValue
    const fragment = document.createDocumentFragment()
    let changed = false

    while (remaining) {
      let match = null
      let matchIndex = remaining.length
      for (const name of PRESERVED_NAMES) {
        const index = remaining.indexOf(name)
        if (index !== -1 && index < matchIndex) {
          match = name
          matchIndex = index
        }
      }
      if (!match) {
        fragment.appendChild(document.createTextNode(remaining))
        break
      }
      if (matchIndex > 0) fragment.appendChild(document.createTextNode(remaining.slice(0, matchIndex)))
      const preserved = document.createElement('span')
      preserved.className = 'notranslate'
      preserved.setAttribute('translate', 'no')
      preserved.textContent = match
      fragment.appendChild(preserved)
      remaining = remaining.slice(matchIndex + match.length)
      changed = true
    }

    if (changed) textNode.replaceWith(fragment)
  }
}

function collectTextNodes() {
  const walker = document.createTreeWalker(document.getElementById('root'), NodeFilter.SHOW_TEXT)
  const nodes = []
  let node
  while ((node = walker.nextNode())) {
    const parent = node.parentElement
    const text = node.nodeValue.trim()
    if (!parent || !text || parent.closest('.notranslate, [translate="no"], script, style, select, option, textarea, input')) continue
    if (text.length <= 1200) nodes.push(node)
  }
  return nodes
}

async function translateText(text, language) {
  const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(language)}&dt=t&q=${encodeURIComponent(text)}`
  const response = await fetch(endpoint)
  if (!response.ok) throw new Error('Translation service unavailable')
  const result = await response.json()
  return result?.[0]?.map(part => part?.[0] || '').join('') || text
}

export default function LanguageTranslator() {
  const [language, setLanguage] = useState(() => window.localStorage.getItem('site_language') || 'en')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const originals = useRef(new Map())
  const location = useLocation()

  useEffect(() => {
    let cancelled = false

    const restoreEnglish = () => {
      for (const [node, original] of originals.current) {
        if (node.isConnected) node.nodeValue = original
      }
      originals.current.clear()
    }

    const translatePage = async () => {
      restoreEnglish()
      if (language === 'en') {
        setBusy(false)
        setError(false)
        return
      }

      setBusy(true)
      setError(false)
      protectPlaceNames()
      const nodes = collectTextNodes()
      const uniqueTexts = [...new Set(nodes.map(node => node.nodeValue))]
      const translations = new Map()

      try {
        for (let index = 0; index < uniqueTexts.length; index += 8) {
          if (cancelled) return
          const batch = uniqueTexts.slice(index, index + 8)
          const results = await Promise.all(batch.map(async text => [text, await translateText(text, language)]))
          results.forEach(([source, translated]) => translations.set(source, translated))
        }

        if (cancelled) return
        nodes.forEach(node => {
          if (!node.isConnected || !translations.has(node.nodeValue)) return
          originals.current.set(node, node.nodeValue)
          node.nodeValue = translations.get(node.nodeValue)
        })
      } catch (translationError) {
        console.warn('Page translation failed:', translationError)
        setError(true)
      } finally {
        if (!cancelled) setBusy(false)
      }
    }

    const timer = window.setTimeout(translatePage, 120)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [language, location.pathname])

  const handleChange = event => {
    const nextLanguage = event.target.value
    setLanguage(nextLanguage)
    window.localStorage.setItem('site_language', nextLanguage)
  }

  return (
    <div
      className="notranslate"
      translate="no"
      style={{
        position: 'fixed', right: '20px', bottom: '20px', zIndex: 1000,
        display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 11px', borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(19,27,46,0.97), rgba(10,15,29,0.97))',
        border: `1px solid ${error ? 'rgba(248,113,113,0.65)' : 'rgba(255,107,43,0.38)'}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.35), 0 0 20px rgba(255,107,43,0.12)',
        backdropFilter: 'blur(12px)',
      }}
      aria-label={error ? 'Translation unavailable' : 'Translate page'}
    >
      <Icon name="language" size={18} title="Translate" />
      <span style={{ color: error ? '#fca5a5' : '#fbbf24', fontFamily: 'var(--font-display)', fontSize: '0.84rem', fontWeight: 700 }}>
        {busy ? 'Translating…' : error ? 'Try again' : 'Translate'}
      </span>
      <label htmlFor="site-language" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        Choose language
      </label>
      <select
        id="site-language"
        value={language}
        onChange={handleChange}
        disabled={busy}
        style={{ border: 0, outline: 0, background: 'transparent', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.82rem', cursor: busy ? 'wait' : 'pointer' }}
      >
        <optgroup label="International languages">
          {INTERNATIONAL_LANGUAGES.map(([code, label]) => <option key={code} value={code} style={{ color: '#111827' }}>{label}</option>)}
        </optgroup>
        <optgroup label="Indian languages">
          {INDIAN_LANGUAGES.map(([code, label]) => <option key={code} value={code} style={{ color: '#111827' }}>{label}</option>)}
        </optgroup>
      </select>
    </div>
  )
}
