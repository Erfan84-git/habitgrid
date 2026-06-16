import { useState, useEffect } from 'react'

interface Props {
  onDone: () => void
  accentColor: string
}

// A 7×4 contribution grid that flickers like the splash screen, using the
// same accent-opacity palette.
const GRID_CELLS = 28
const OPACITIES = [0.06, 0.12, 0.22, 0.38, 0.58, 0.78, 1.0]
const randLevel = () => Math.floor(Math.random() * OPACITIES.length)

export default function OnboardingScreen({ onDone, accentColor }: Props) {
  // Show an "Add to Home Screen" hint only on iOS Safari that isn't installed.
  const [showIOSBanner, setShowIOSBanner] = useState(() => {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    return isIOS && !isStandalone
  })

  // Flicker the hero grid, matching the splash screen's matrix animation.
  const [levels, setLevels] = useState<number[]>(() => Array.from({ length: GRID_CELLS }, randLevel))
  useEffect(() => {
    const id = window.setInterval(() => {
      setLevels((prev) => prev.map((l) => (Math.random() > 0.65 ? randLevel() : l)))
    }, 120)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div
      className="flex flex-col min-h-dvh px-5"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Logo + tagline */}
      <div className="flex flex-col items-center pt-14 pb-8">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 11px)',
            gridTemplateRows: 'repeat(4, 11px)',
            gap: '3px',
            marginBottom: '20px',
          }}
        >
          {[0.1,0.3,1,0.5,0.2,0.7,0.4, 0.5,1,0.4,1,0.6,0.3,1, 1,0.5,0.2,0.7,1,0.5,0.3, 0.3,1,0.6,0.4,0.8,1,0.6].map((op, i) => (
            <div key={i} style={{ width:11, height:11, borderRadius:2, backgroundColor: accentColor, opacity: op }} />
          ))}
        </div>
        <h1
          className="text-2xl font-semibold tracking-tight mb-2"
          style={{ color: 'var(--text-primary)', fontFamily: '"DM Mono", monospace' }}
        >
          HabitGrid
        </h1>
        <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          GitHub-style grids for your daily habits
        </p>
      </div>

      {/* Hero: a filled contribution grid + Pro mention */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '32px' }}>

        <div className="flex flex-col items-center">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 30px)',
              gridAutoRows: '30px',
              gap: '6px',
            }}
          >
            {levels.map((level, i) => (
              <div
                key={i}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  backgroundColor: accentColor,
                  opacity: OPACITIES[level],
                }}
              />
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: 'var(--text-secondary)' }}>
            47 days. No streak broken.
          </p>
        </div>

        {/* Pro mention */}
        <div
          className="flex items-center gap-4 px-4 py-4 rounded-xl"
          style={{ backgroundColor: 'var(--surface)', border: `1px solid ${accentColor}33` }}
        >
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-xl"
            style={{ width: 48, height: 48, backgroundColor: 'var(--bg)', color: accentColor }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="8" y="13" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none"/>
              <path d="M11 13V9.5a3 3 0 016 0V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
              <circle cx="14" cy="19" r="2" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
              3 habits free · Pro unlocks more
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Unlimited habits, custom colours, combined grid — one-time $4.99
            </p>
          </div>
        </div>

      </div>

      {/* CTA */}
      <div className="py-6">
        {showIOSBanner && (
          <button
            onClick={() => setShowIOSBanner(false)}
            className="w-full flex items-center justify-center gap-1.5 mb-3 px-3 py-2.5 rounded-lg text-xs text-center"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <span>On iPhone? Tap</span>
            <svg width="12" height="15" viewBox="0 0 14 18" fill="none" style={{ display: 'inline-block', flexShrink: 0 }} aria-label="Share">
              <path d="M7 2v9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M4 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.5 7.5h-1A1.5 1.5 0 001 9v6.5A1.5 1.5 0 002.5 17h9a1.5 1.5 0 001.5-1.5V9a1.5 1.5 0 00-1.5-1.5h-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Share → Add to Home Screen for the full experience.</span>
          </button>
        )}
        <button
          onClick={onDone}
          className="w-full py-4 rounded-xl text-base font-semibold"
          style={{ backgroundColor: accentColor, color: '#000', border: 'none', cursor: 'pointer' }}
        >
          Get started
        </button>
      </div>
    </div>
  )
}
