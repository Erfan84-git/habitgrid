import { useEffect, useRef, useState, type CSSProperties } from 'react'

export interface TourStep {
  selector: string
  title: string
  body: string
  index: number
  total: number
  screen?: 'grid' | 'settings' | 'profile'
}

/**
 * A coachmark that spotlights a live DOM element (matched by `step.selector`)
 * and floats a tooltip beside it. The overlay lets taps pass through so the
 * user can actually perform the highlighted action. If the target can't be
 * found (e.g. it needs 2+ habits, or a screen is mid-transition) it falls back
 * to a centered card so the tour never gets stuck.
 */
export function Coachmark({
  step,
  onSkip,
  onNext,
  nextLabel = 'Next',
}: {
  step: TourStep
  onSkip: () => void
  onNext?: () => void
  nextLabel?: string
}) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const scrolledFor = useRef<string | null>(null)

  useEffect(() => {
    let raf = 0
    const measure = () => {
      const el = document.querySelector(step.selector)
      if (el) {
        // Scroll the target into a comfortable position once per step, so the
        // tooltip never lands under the status bar / off-screen.
        if (scrolledFor.current !== step.selector) {
          scrolledFor.current = step.selector
          el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }
        setRect(el.getBoundingClientRect())
      } else {
        setRect(null)
      }
    }
    measure()
    const onChange = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }
    window.addEventListener('resize', onChange)
    window.addEventListener('scroll', onChange, true)
    const id = window.setInterval(measure, 300)
    return () => {
      window.removeEventListener('resize', onChange)
      window.removeEventListener('scroll', onChange, true)
      window.clearInterval(id)
      cancelAnimationFrame(raf)
    }
  }, [step.selector])

  const vw = typeof window !== 'undefined' ? window.innerWidth : 390
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const tipWidth = Math.min(300, vw - 24)
  const SAFE_TOP = 56 // keep clear of the status bar / notch

  // Tooltip body (shared between anchored and centered modes)
  const tooltip = (
    <>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 4 }}>
        {step.title}
      </p>
      <p style={{ fontSize: 13, lineHeight: 1.4, color: 'var(--text-secondary)', margin: 0 }}>
        {step.body}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: '"DM Mono", monospace' }}>
          {step.index} of {step.total}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={onSkip}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', padding: '4px 8px' }}
          >
            Skip tour
          </button>
          {onNext && (
            <button
              onClick={onNext}
              style={{ backgroundColor: 'var(--accent)', border: 'none', color: '#000', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '5px 12px', borderRadius: 7 }}
            >
              {nextLabel}
            </button>
          )}
        </div>
      </div>
    </>
  )

  const cardStyle: CSSProperties = {
    pointerEvents: 'auto',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '14px 16px',
    boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
  }

  // Centered fallback when there's no anchor element.
  if (!rect) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 60, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.66)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: tipWidth, ...cardStyle }}>
          {tooltip}
        </div>
      </div>
    )
  }

  const pad = 8
  const left = Math.max(12, Math.min(rect.left + rect.width / 2 - tipWidth / 2, vw - tipWidth - 12))
  const spaceBelow = vh - rect.bottom
  const placeBelow = spaceBelow > 200

  const tooltipPos: CSSProperties = placeBelow
    ? { top: Math.max(SAFE_TOP, rect.bottom + 14), left }
    : { bottom: vh - rect.top + 14, left }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, pointerEvents: 'none' }}>
      {/* Spotlight ring (its huge box-shadow dims everything else) */}
      <div
        style={{
          position: 'absolute',
          left: rect.left - pad,
          top: rect.top - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          borderRadius: 14,
          border: '2px solid var(--accent)',
          animation: 'tour-pulse 1.6s ease-in-out infinite',
        }}
      />
      {/* Tooltip */}
      <div style={{ position: 'absolute', width: tipWidth, ...tooltipPos, ...cardStyle }}>
        {tooltip}
      </div>
    </div>
  )
}
