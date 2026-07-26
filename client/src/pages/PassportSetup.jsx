import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/react'
import { usePassport } from '../context/PassportContext.jsx'
import './passportSetup.css'

const COUNTRY_CODES = [
  ['AFG', 'Afghanistan'], ['ALB', 'Albania'], ['DZA', 'Algeria'], ['ARG', 'Argentina'],
  ['ARM', 'Armenia'], ['AUS', 'Australia'], ['AUT', 'Austria'], ['BGD', 'Bangladesh'],
  ['BEL', 'Belgium'], ['BTN', 'Bhutan'], ['BRA', 'Brazil'], ['CAN', 'Canada'],
  ['CHN', 'China'], ['DNK', 'Denmark'], ['EGY', 'Egypt'], ['FRA', 'France'],
  ['DEU', 'Germany'], ['GRC', 'Greece'], ['HKG', 'Hong Kong'], ['IND', 'India'],
  ['IDN', 'Indonesia'], ['IRL', 'Ireland'], ['ISR', 'Israel'], ['ITA', 'Italy'],
  ['JPN', 'Japan'], ['KEN', 'Kenya'], ['MYS', 'Malaysia'], ['MDV', 'Maldives'],
  ['MUS', 'Mauritius'], ['MEX', 'Mexico'], ['NPL', 'Nepal'], ['NLD', 'Netherlands'],
  ['NZL', 'New Zealand'], ['PAK', 'Pakistan'], ['PHL', 'Philippines'], ['PRT', 'Portugal'],
  ['RUS', 'Russia'], ['SAU', 'Saudi Arabia'], ['SGP', 'Singapore'], ['ZAF', 'South Africa'],
  ['KOR', 'South Korea'], ['ESP', 'Spain'], ['LKA', 'Sri Lanka'], ['CHE', 'Switzerland'],
  ['THA', 'Thailand'], ['TUR', 'Turkey'], ['ARE', 'United Arab Emirates'],
  ['GBR', 'United Kingdom'], ['USA', 'United States'], ['VNM', 'Vietnam'],
]

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const PLAYFUL_BLOOD_TYPES = ['UNICORN', 'SHREK', 'TITAN', 'ALIEN']

function getDefaultBloodType(userId = '') {
  const chanceSeed = Array.from(userId).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  if (chanceSeed % 17 === 0) return 'ALIEN'
  return PLAYFUL_BLOOD_TYPES[chanceSeed % 3]
}

function getDefaultCountryCode(defaultBloodType) {
  return defaultBloodType === 'ALIEN' ? 'SPC' : 'ERT'
}

function PassportCombobox({ id, value, onChange, options, placeholder, formatOption }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const normalizedQuery = query.trim().toLowerCase()
  const visibleOptions = normalizedQuery
    ? options.filter((option) => formatOption(option).toLowerCase().includes(normalizedQuery))
    : options

  const getOptionValue = (option) => Array.isArray(option) ? option[0] : option

  const chooseOption = (option) => {
    onChange(getOptionValue(option))
    setQuery('')
    setActiveIndex(-1)
    setIsOpen(false)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((index) => Math.min(index + 1, visibleOptions.length - 1))
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((index) => Math.max(index - 1, 0))
    }

    if (event.key === 'Enter' && isOpen && activeIndex >= 0) {
      event.preventDefault()
      chooseOption(visibleOptions[activeIndex])
    }

    if (event.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div className="passport-combobox">
      <input
        id={id}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value.toUpperCase()
          onChange(nextValue)
          setQuery(event.target.value)
          setActiveIndex(-1)
          setIsOpen(true)
        }}
        onFocus={() => {
          setQuery('')
          setActiveIndex(-1)
          setIsOpen(true)
        }}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={`${id}-listbox`}
        aria-expanded={isOpen}
        autoComplete="off"
        placeholder={placeholder}
      />
      <button
        type="button"
        className="passport-combobox-toggle"
        aria-label={`Show ${id.replace('-', ' ')} options`}
        aria-expanded={isOpen}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          setQuery('')
          setActiveIndex(-1)
          setIsOpen((open) => !open)
        }}
      >
        <span aria-hidden="true">⌄</span>
      </button>
      {isOpen && (
        <div id={`${id}-listbox`} className="passport-combobox-menu" role="listbox">
          {visibleOptions.length ? visibleOptions.map((option, index) => {
            const optionValue = getOptionValue(option)
            return (
              <button
                type="button"
                role="option"
                aria-selected={value === optionValue}
                className={index === activeIndex ? 'is-active' : ''}
                key={optionValue}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseOption(option)}
              >
                {formatOption(option)}
              </button>
            )
          }) : <p>No matching option. You can still enter a code manually.</p>}
        </div>
      )}
    </div>
  )
}

export default function PassportSetup() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { passport, updateIdentity } = usePassport()
  const identity = passport.identity || {}
  const belongsToCurrentUser = Boolean(user?.id && identity.clerkUserId === user.id)
  const [firstName, setFirstName] = useState(identity.firstName || '')
  const [lastName, setLastName] = useState(identity.lastName || '')
  const [bloodType, setBloodType] = useState(identity.bloodType || '')
  const [countryCode, setCountryCode] = useState(identity.countryCode || '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    setFirstName(belongsToCurrentUser ? identity.firstName || '' : user.firstName || '')
    setLastName(belongsToCurrentUser ? identity.lastName || '' : user.lastName || '')
    setBloodType(belongsToCurrentUser ? identity.bloodType || '' : '')
    setCountryCode(belongsToCurrentUser ? identity.countryCode || '' : '')
  }, [belongsToCurrentUser, identity, user])

  const preview = useMemo(() => ({
    firstName: firstName.trim() || 'REQUIRED',
    lastName: lastName.trim() || 'WANDERER',
    bloodType: bloodType.trim() || getDefaultBloodType(user?.id),
    countryCode: countryCode.trim().toUpperCase() || getDefaultCountryCode(bloodType.trim() || getDefaultBloodType(user?.id)),
  }), [firstName, lastName, bloodType, countryCode, user?.id])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!firstName.trim()) {
      setError('First name is required for your travel identity.')
      return
    }

    setError('')
    const finalBloodType = bloodType.trim() || getDefaultBloodType(user?.id)
    const finalCountryCode = countryCode.trim() || getDefaultCountryCode(finalBloodType)

    updateIdentity({
      clerkUserId: user?.id,
      firstName,
      lastName,
      bloodType: finalBloodType,
      countryCode: finalBloodType === 'ALIEN' && !countryCode.trim() ? 'SPC' : finalCountryCode,
    })

    try {
      await user?.update({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
      })
    } catch (err) {
      console.warn('Could not update Clerk profile name')
    }

    navigate('/passport', { replace: true })
  }

  return (
    <div className="passport-setup-page">
      <section className="passport-setup-card" aria-labelledby="passport-setup-title">
        <div className="passport-setup-copy">
          <p className="passport-setup-kicker">DIGITAL PASSPORT DETAILS</p>
          <h1 id="passport-setup-title">Create your traveller identity</h1>
          <p>
            These details appear inside your Chalo Dekhe Bharat passport. Only your first
            name is required. Optional fields can be added now or updated later.
          </p>
        </div>

        <form className="passport-setup-form" onSubmit={handleSubmit}>
          <div className="passport-setup-grid">
            <label>
              <span>First name <strong>required</strong></span>
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
                aria-describedby={error ? 'passport-setup-error' : undefined}
                required
              />
            </label>

            <label>
              <span>Last name <em>optional</em></span>
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
                placeholder="Optional"
              />
            </label>

            <label>
              <span>Blood type <em>optional</em></span>
              <PassportCombobox
                id="blood-type"
                value={bloodType}
                onChange={setBloodType}
                options={BLOOD_TYPES}
                placeholder="Optional"
                formatOption={(type) => type}
              />
            </label>

            <label>
              <span>Country code <em>optional</em></span>
              <PassportCombobox
                id="country-code"
                value={countryCode}
                onChange={setCountryCode}
                options={COUNTRY_CODES}
                placeholder="Optional"
                formatOption={([code, country]) => `${code} — ${country}`}
              />
            </label>
          </div>

          {error && <p className="passport-setup-error" id="passport-setup-error">{error}</p>}

          <div className="passport-preview" aria-label="Passport preview">
            <div><span>Type</span><strong>{preview.bloodType}</strong></div>
            <div><span>Country Code</span><strong>{preview.countryCode}</strong></div>
            <div><span>Surname</span><strong>{preview.lastName.toUpperCase()}</strong></div>
            <div><span>Given Name(s)</span><strong>{preview.firstName.toUpperCase()}</strong></div>
          </div>

          <button type="submit">Save and open passport</button>
        </form>
      </section>
    </div>
  )
}
