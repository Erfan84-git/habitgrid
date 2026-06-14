import { useRef, useState, useCallback } from 'react'
import { useStore, Habit, FREE_HABIT_LIMIT, NAME_MAX, formatDate } from '../store'
import UpgradeModal from './UpgradeModal'
import { exportBackup, importBackup, daysSinceBackup } from '../utils/backup'

interface Props {
  onBack: () => void
  onReplayTour: () => void
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

export default function Settings({ onBack, onReplayTour }: Props) {
  const { habits, accentColor, renameHabit, deleteHabit, reorderHabits, setAccentColor, isPro, licenseKey, setIsPro, setLicenseKey, lastBackedUp, setLastBackedUp } = useStore()
  const dragItem = useRef<number | null>(null)
  const dragOver = useRef<number | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [keyInput, setKeyInput] = useState('')
  const [keyStatus, setKeyStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [keyError, setKeyError] = useState<string | null>(null)

  const handleActivateKey = useCallback(async () => {
    const trimmed = keyInput.trim()
    if (!trimmed) return
    setKeyStatus('loading')
    setKeyError(null)
    try {
      const res = await fetch(`/api/verify-license?key=${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      if (data.valid) {
        setIsPro(true)
        setLicenseKey(trimmed)
        setKeyInput('')
        setKeyStatus('idle')
      } else {
        setKeyError(data.error ?? 'Invalid license key. Double-check and try again.')
        setKeyStatus('error')
      }
    } catch {
      setKeyError('Could not reach the server. Check your connection.')
      setKeyStatus('error')
    }
  }, [keyInput, setIsPro, setLicenseKey])

  const handleExport = useCallback(() => {
    exportBackup()
    setLastBackedUp(formatDate(new Date()))
  }, [setLastBackedUp])

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportError(null)
    const result = await importBackup(file)
    if (result.ok) {
      window.location.reload()
    } else {
      setImportError(result.error ?? 'Something went wrong.')
      setImporting(false)
    }
    e.target.value = ''
  }, [])

  const activeHabits = habits.filter((h) => h.active)
  const isCustom = !PRESETS.includes(accentColor)

  function handleDragStart(idx: number) { dragItem.current = idx }
  function handleDragEnter(idx: number) { dragOver.current = idx }
  function handleDragEnd() {
    if (dragItem.current === null || dragOver.current === null) return
    const reordered = [...habits]
    const [moved] = reordered.splice(dragItem.current, 1)
    reordered.splice(dragOver.current, 0, moved)
    reorderHabits(reordered)
    dragItem.current = null
    dragOver.current = null
  }

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
          Settings
        </h1>
        <div style={{ width: '52px' }} />
      </header>

      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">

        {/* Pro status */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          HABITGRID PRO
        </p>
        <div
          data-tour="pro"
          className="rounded-xl px-4 py-4 mb-6"
          style={{ backgroundColor: 'var(--surface)', border: `1px solid ${isPro ? 'var(--accent)' : 'var(--border)'}` }}
        >
          {isPro ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 4" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>You're Pro ✨</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    Thanks for backing HabitGrid — everything's unlocked for good.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mb-3">
                {['Unlimited habits', 'Every colour + custom picker', 'Combined grid & sharing'].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: 'var(--accent)' }}>
                      <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{f}</span>
                  </div>
                ))}
              </div>

              {licenseKey && (
                <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>License key</p>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {licenseKey.slice(0, 8)}••••••••
                  </p>
                  <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>
                    Keep it safe — it re-activates Pro on any device.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Already purchased?</p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                Enter the license key from your purchase receipt email.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => { setKeyInput(e.target.value); setKeyStatus('idle'); setKeyError(null) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleActivateKey()}
                  placeholder="Paste license key"
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
                    backgroundColor: 'var(--bg)', border: `1px solid ${keyStatus === 'error' ? '#ff7b72' : 'var(--border)'}`,
                    color: 'var(--text-primary)', outline: 'none', fontFamily: '"DM Mono", monospace',
                  }}
                />
                <button
                  onClick={handleActivateKey}
                  disabled={keyStatus === 'loading' || !keyInput.trim()}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                    backgroundColor: 'var(--accent)', color: '#000', border: 'none',
                    cursor: keyStatus === 'loading' || !keyInput.trim() ? 'default' : 'pointer',
                    opacity: keyStatus === 'loading' || !keyInput.trim() ? 0.6 : 1,
                    flexShrink: 0,
                  }}
                >
                  {keyStatus === 'loading' ? '…' : 'Activate'}
                </button>
              </div>
              {keyError && (
                <p className="text-xs mt-2" style={{ color: '#ff7b72' }}>{keyError}</p>
              )}
              <button
                onClick={() => setShowUpgrade(true)}
                className="text-xs mt-3 block"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 0 }}
              >
                Don't have a key? Unlock Pro →
              </button>
            </div>
          )}
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

        {/* Habits */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          HABITS
        </p>

        {activeHabits.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-secondary)' }}>
            No habits yet. Use the + button to add one.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {habits.filter((h) => h.active).map((habit, idx) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                onRename={(name) => renameHabit(habit.id, name)}
                onDelete={() => deleteHabit(habit.id)}
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        )}

        <p className="text-xs mt-4 mb-8" style={{ color: 'var(--text-secondary)' }}>
          {isPro ? `${activeHabits.length} habits` : `${activeHabits.length}/${FREE_HABIT_LIMIT} habits — upgrade for unlimited`}
        </p>

        {/* Backup & Restore */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          BACKUP & RESTORE
        </p>
        <div
          data-tour="backup"
          className="rounded-xl px-4 py-4 mb-2"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Your data</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            {lastBackedUp
              ? `Last backup: ${daysSinceBackup(lastBackedUp) === 0 ? 'today' : `${daysSinceBackup(lastBackedUp)} days ago`}`
              : 'No backup yet — save one to protect your data'}
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#000',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Create backup
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                cursor: importing ? 'default' : 'pointer',
                opacity: importing ? 0.6 : 1,
              }}
            >
              {importing ? 'Restoring…' : 'Restore backup'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </div>

          {importError && (
            <p className="text-xs mt-3" style={{ color: '#ff7b72' }}>{importError}</p>
          )}
        </div>

        <p className="text-xs pb-6" style={{ color: 'var(--text-secondary)' }}>
          Save the file to iCloud Drive or Google Drive. Restoring will replace all current data.
        </p>

        {/* Getting started */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          GETTING STARTED
        </p>
        <button
          onClick={onReplayTour}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3.5 mb-2 text-left"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, color: 'var(--accent)' }}>
            <path d="M15 9A6 6 0 113.3 6.5M3 3v3.5h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Replay the walkthrough
          </span>
        </button>
        <p className="text-xs pb-6" style={{ color: 'var(--text-secondary)' }}>
          See the welcome screen and the guide on creating a habit and logging progress again.
        </p>

        {/* Contact */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          FEEDBACK
        </p>
        <a
          href="mailto:aruna.maurya12@gmail.com?subject=HabitGrid%20feedback"
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3.5 mb-2 text-left no-underline"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, color: 'var(--accent)' }}>
            <rect x="2" y="3.5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3 5l6 4.5L15 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Contact the builder
          </span>
        </a>
        <p className="text-xs pb-4" style={{ color: 'var(--text-secondary)' }}>
          Found a bug or have an idea? I'd love to hear it.
        </p>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 pb-10 pt-4">
          <a
            href="/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            Privacy Policy
          </a>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>v1.0</span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <a
            href="https://github.com/aruna09/habitgrid"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            Open source
          </a>
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

interface HabitRowProps {
  habit: Habit
  onRename: (name: string) => void
  onDelete: () => void
  onDragStart: () => void
  onDragEnter: () => void
  onDragEnd: () => void
}

function HabitRow({ habit, onRename, onDelete, onDragStart, onDragEnter, onDragEnd }: HabitRowProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(habit.name)

  function save() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== habit.name) onRename(trimmed)
    setEditing(false)
  }
  function cancel() {
    setDraft(habit.name)
    setEditing(false)
  }

  return (
    <div
      draggable={!editing}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className="flex items-center gap-3 px-3 py-3 rounded-lg"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="cursor-grab" style={{ color: 'var(--border-muted)', opacity: editing ? 0.3 : 1 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="4" y="4" width="3" height="3" rx="1" />
          <rect x="9" y="4" width="3" height="3" rx="1" />
          <rect x="4" y="9" width="3" height="3" rx="1" />
          <rect x="9" y="9" width="3" height="3" rx="1" />
        </svg>
      </div>

      {editing ? (
        <input
          type="text"
          value={draft}
          autoFocus
          maxLength={NAME_MAX}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            else if (e.key === 'Escape') cancel()
          }}
          onBlur={save}
          className="flex-1 text-sm rounded-md px-2 py-1 outline-none"
          style={{
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--accent)',
            color: 'var(--text-primary)',
            minWidth: 0,
          }}
        />
      ) : (
        <button
          onClick={() => { setDraft(habit.name); setEditing(true) }}
          className="flex-1 text-sm text-left truncate"
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'text', padding: 0, minWidth: 0 }}
        >
          {habit.name}
        </button>
      )}

      {editing ? (
        <button
          onMouseDown={(e) => e.preventDefault()} /* keep input focus so onBlur->save wins */
          onClick={save}
          aria-label="Save name"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--accent)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <>
          <button
            onClick={() => { setDraft(habit.name); setEditing(true) }}
            aria-label="Edit name"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)' }}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M11.5 2.5a1.4 1.4 0 012 2L5 13l-3 1 1-3 8.5-8.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            aria-label="Delete habit"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
