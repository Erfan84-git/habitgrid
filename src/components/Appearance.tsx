import { useState } from 'react'
import { useStore } from '../store'
import UpgradeModal from './UpgradeModal'

interface Props {
  onBack: () => void
}

const PRESETS = [
  '#39d353',
  '#58a6ff',
  '#bc8cff',
  '#f778ba',
  '#ffa657',
  '#ff7b72',
  '#e3b341',
  '#3dc9b0',
]
const DEFAULT_COLOR = '#39d353'

export default function Appearance({ onBack }: Props) {
  const { accentColor, setAccentColor, theme, setTheme, isPro } = useStore()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const isCustom = !PRESETS.includes(accentColor)

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
          Appearance
        </h1>
        <div style={{ width: '52px' }} />
      </header>

      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">

        {/* Theme */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          THEME
        </p>
        <div
          className="rounded-xl px-4 py-4 mb-6 flex items-center justify-between gap-3"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Mode</p>
          <div
            style={{ display: 'flex', borderRadius: 9, padding: 2, backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            {(['dark', 'light'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
                  backgroundColor: theme === t ? 'var(--accent)' : 'transparent',
                  color: theme === t ? '#000' : 'var(--text-secondary)',
                }}
              >
                {t === 'dark' ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 9.5A5.5 5.5 0 016.5 2.5a5.5 5.5 0 107 7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M12.6 3.4l-1 1M4.4 11.6l-1 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                )}
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Grid colour */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          GRID COLOUR
        </p>
        <div
          className="rounded-xl px-4 py-4 mb-2"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
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
                  outline: isCustom ? '3px solid var(--text-primary)' : '3px solid transparent',
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
            <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
              Pro unlocks all colours and the custom picker.
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
