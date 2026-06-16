import { useState, useEffect } from 'react'

interface Props {
  onDone: () => void
  onStart: () => void
  firstRun: boolean
  accentColor: string
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '').padEnd(6, '0')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

const OPACITIES = [0.06, 0.12, 0.22, 0.38, 0.58, 0.78, 1.0]

function randLevel() {
  return Math.floor(Math.random() * OPACITIES.length)
}

function buildMonthCells(year: number, month: number): (boolean | null)[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow = new Date(year, month, 1).getDay()
  const numCols = Math.ceil((startDow + daysInMonth) / 7)
  const cells: (boolean | null)[] = []
  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < 7; row++) {
      const dayNum = col * 7 + row - startDow + 1
      cells.push(dayNum >= 1 && dayNum <= daysInMonth ? true : null)
    }
  }
  return cells
}

export default function SplashScreen({ onDone, onStart, firstRun, accentColor }: Props) {
  const now = new Date()
  const cells = buildMonthCells(now.getFullYear(), now.getMonth())

  const [levels, setLevels] = useState<number[]>(() =>
    cells.map((c) => (c ? randLevel() : 0))
  )
  const [exiting, setExiting] = useState(false)
  const [panelUp, setPanelUp] = useState(false)
  const [showIOSHint, setShowIOSHint] = useState(() => {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    return isIOS && !isStandalone
  })

  // Returning users: auto-fade after 2s, then continue to the app.
  useEffect(() => {
    if (firstRun) return
    const t = setTimeout(() => setExiting(true), 2000)
    return () => clearTimeout(t)
  }, [firstRun])

  useEffect(() => {
    if (!exiting) return
    const t = setTimeout(onDone, 450)
    return () => clearTimeout(t)
  }, [exiting, onDone])

  // First run: let the animation breathe, then slide the panel up.
  useEffect(() => {
    if (!firstRun) return
    const t = setTimeout(() => setPanelUp(true), 1000)
    return () => clearTimeout(t)
  }, [firstRun])

  // Flicker the matrix
  useEffect(() => {
    const interval = setInterval(() => {
      setLevels((prev) =>
        prev.map((l, i) => (cells[i] && Math.random() > 0.65 ? randLevel() : l))
      )
    }, 120)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [r, g, b] = hexToRgb(accentColor)
  const CELL = 18
  const GAP = 5

  const matrix = (
    <div
      style={{
        display: 'grid',
        gridAutoFlow: 'column',
        gridTemplateRows: `repeat(7, ${CELL}px)`,
        gridAutoColumns: `${CELL}px`,
        gap: `${GAP}px`,
      }}
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          style={{
            width: CELL,
            height: CELL,
            borderRadius: '4px',
            backgroundColor: cell
              ? `rgba(${r}, ${g}, ${b}, ${OPACITIES[levels[i]]})`
              : 'transparent',
          }}
        />
      ))}
    </div>
  )

  const wordmark = (
    <p
      style={{
        margin: 0,
        color: accentColor,
        fontSize: '30px',
        fontWeight: 600,
        fontFamily: '"DM Mono", monospace',
        letterSpacing: '-0.02em',
      }}
    >
      HabitGrid
    </p>
  )

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.45s ease',
        zIndex: 1000,
      }}
    >
      {/* Matrix + wordmark, centered in the space above the panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
        {matrix}
        {wordmark}
        {firstRun && (
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', padding: '0 24px' }}>
            GitHub-style grids for your daily habits
          </p>
        )}
      </div>

      {firstRun && (
        <div
          style={{
            transform: panelUp ? 'translateY(0)' : 'translateY(110%)',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            backgroundColor: 'var(--surface)',
            borderTop: `1px solid ${accentColor}33`,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            boxShadow: '0 -12px 40px rgba(0,0,0,0.5)',
            padding: '22px 20px calc(24px + env(safe-area-inset-bottom))',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Track up to 3 habits — free
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Pro unlocks unlimited habits, custom colours and the combined grid — one-time $4.99
          </p>

          {showIOSHint && (
            <button
              onClick={() => setShowIOSHint(false)}
              style={{
                width: '100%', marginTop: 14, padding: '10px 12px', borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                backgroundColor: 'var(--bg)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', textAlign: 'center',
              }}
            >
              <span>On iPhone? Tap</span>
              <svg width="12" height="15" viewBox="0 0 14 18" fill="none" style={{ flexShrink: 0 }} aria-label="Share">
                <path d="M7 2v9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M4 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.5 7.5h-1A1.5 1.5 0 001 9v6.5A1.5 1.5 0 002.5 17h9a1.5 1.5 0 001.5-1.5V9a1.5 1.5 0 00-1.5-1.5h-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Share → Add to Home Screen</span>
            </button>
          )}

          <button
            onClick={onStart}
            style={{
              width: '100%', marginTop: 16, padding: '16px', borderRadius: 14,
              backgroundColor: accentColor, color: '#000', border: 'none',
              fontSize: 16, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Let's go →
          </button>
        </div>
      )}
    </div>
  )
}
