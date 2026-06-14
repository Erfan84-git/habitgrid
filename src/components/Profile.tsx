import { useState, useEffect } from 'react'
import { useStore } from '../store'
import UpgradeModal from './UpgradeModal'

interface Props {
  onBack: () => void
}

const PRESETS = [
  '#39d353', // green (default)
  '#58a6ff', // blue
  '#bc8cff', // purple
  '#f778ba', // pink
  '#ffa657', // orange
  '#ff7b72', // coral
  '#e3b341', // gold
  '#3dc9b0', // teal
]

const DEFAULT_COLOR = '#39d353'

export default function Profile({ onBack }: Props) {
  const {
    userName, setUserName,
    accentColor, setAccentColor,
    isPro, habits, logs, streak, recalculateStreak,
  } = useStore()
  const [name, setName] = useState(userName)
  const [showUpgrade, setShowUpgrade] = useState(false)

  // Make sure the streak reflects the latest logs when the page opens
  useEffect(() => { recalculateStreak() }, [recalculateStreak])

  const isCustom = !PRESETS.includes(accentColor)
  const activeHabits = habits.filter((h) => h.active).length
  const activeDays = Object.keys(logs).length

  const stats = [
    { label: 'Active days', value: activeDays, accent: false },
    { label: 'Current streak', value: streak.current, accent: true },
    { label: 'Longest streak', value: streak.longest, accent: false },
    { label: 'Habits', value: activeHabits, accent: false },
  ]

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: 'var(--bg)' }}>
      <header
        className="flex items-center px-4 py-4 pt-safe-top border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm"
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <h1 className="text-base font-semibold mx-auto" style={{ color: 'var(--text-primary)' }}>
          Profile
        </h1>
        <div style={{ width: '52px' }} />
      </header>

      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">

        {/* Name */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          NAME
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setUserName(name)}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
          placeholder="Your name"
          maxLength={40}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mb-1.5"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-muted)',
            color: 'var(--text-primary)',
          }}
        />
        <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
          Used to greet you on the home screen. Saves automatically.
        </p>

        {/* Stats */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          YOUR PROGRESS
        </p>
        <div
          className="rounded-xl px-4 py-4 mb-6"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {stats.map((s) => (
              <div key={s.label}>
                <p
                  className="text-2xl font-semibold font-mono"
                  style={{ color: s.accent ? 'var(--accent)' : 'var(--text-primary)' }}
                >
                  {s.value}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: 'var(--text-secondary)' }}>
            Active days and streaks count any day you logged at least one habit.
          </p>
        </div>

        {/* Appearance */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          APPEARANCE
        </p>
        <div
          data-tour="colours"
          className="rounded-xl px-4 py-4 mb-6"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Grid colour
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '8px', justifyItems: 'center', alignItems: 'center' }}>
            {PRESETS.map((color) => {
              const locked = !isPro && color !== DEFAULT_COLOR
              return (
                <button
                  key={color}
                  onClick={() => locked ? setShowUpgrade(true) : setAccentColor(color)}
                  aria-label={color}
                  style={{
                    width: '100%', aspectRatio: '1', maxWidth: '30px', borderRadius: '50%',
                    backgroundColor: color, border: 'none', cursor: 'pointer',
                    outline: accentColor === color ? `3px solid ${color}` : '3px solid transparent',
                    outlineOffset: '2px',
                    position: 'relative', opacity: locked ? 0.4 : 1,
                  }}
                >
                  {locked && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                      style={{ position: 'absolute', bottom: -1, right: -1, background: 'var(--bg)', borderRadius: '50%', padding: 1 }}>
                      <rect x="1.5" y="4" width="7" height="5" rx="1" fill="currentColor" />
                      <path d="M3 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              )
            })}
            {/* Custom colour picker */}
            {isPro ? (
              <label style={{ cursor: 'pointer', position: 'relative', width: '100%', aspectRatio: '1', maxWidth: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
                />
                <div style={{
                  width: '100%', aspectRatio: '1', borderRadius: '50%',
                  background: 'conic-gradient(hsl(0,100%,60%),hsl(45,100%,60%),hsl(90,100%,60%),hsl(135,100%,60%),hsl(180,100%,60%),hsl(225,100%,60%),hsl(270,100%,60%),hsl(315,100%,60%),hsl(360,100%,60%))',
                  outline: isCustom ? '3px solid white' : '3px solid transparent',
                  outlineOffset: '2px',
                }} />
              </label>
            ) : (
              <button
                onClick={() => setShowUpgrade(true)}
                style={{
                  width: '100%', aspectRatio: '1', maxWidth: '30px', borderRadius: '50%', border: 'none',
                  cursor: 'pointer', position: 'relative', opacity: 0.4,
                  background: 'conic-gradient(hsl(0,100%,60%),hsl(45,100%,60%),hsl(90,100%,60%),hsl(135,100%,60%),hsl(180,100%,60%),hsl(225,100%,60%),hsl(270,100%,60%),hsl(315,100%,60%),hsl(360,100%,60%))',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                  style={{ position: 'absolute', bottom: -1, right: -1, background: 'var(--bg)', borderRadius: '50%', padding: 1, color: 'white' }}>
                  <rect x="1.5" y="4" width="7" height="5" rx="1" fill="currentColor" />
                  <path d="M3 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          {!isPro && (
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              Unlock Pro to access all colours
            </p>
          )}
        </div>
      </div>

      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onUpgrade={() => setShowUpgrade(false)}
        />
      )}
    </div>
  )
}
