import { useState, useEffect, useRef } from 'react'
import { useStore, Habit, FREE_HABIT_LIMIT, NAME_MAX } from '../store'
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
    theme, setTheme,
    isPro, habits, logs, streak, recalculateStreak,
    renameHabit, deleteHabit, reorderHabits,
  } = useStore()
  const [name, setName] = useState(userName)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Habit | null>(null)
  const dragItem = useRef<number | null>(null)
  const dragOver = useRef<number | null>(null)

  // Make sure the streak reflects the latest logs when the page opens
  useEffect(() => { recalculateStreak() }, [recalculateStreak])

  const isCustom = !PRESETS.includes(accentColor)
  const activeHabitsList = habits.filter((h) => h.active)
  const activeDays = Object.keys(logs).length

  const stats = [
    { label: 'Active days', value: activeDays, accent: false },
    { label: 'Current streak', value: streak.current, accent: true },
    { label: 'Longest streak', value: streak.longest, accent: false },
    { label: 'Habits', value: activeHabitsList.length, accent: false },
  ]

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

        {/* Appearance */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          APPEARANCE
        </p>

        {/* Theme toggle */}
        <div
          className="rounded-xl px-4 py-4 mb-3 flex items-center justify-between gap-3"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Theme</p>
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
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              Unlock Pro to access all colours
            </p>
          )}
        </div>

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

        {/* Habits */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          HABITS
        </p>
        {activeHabitsList.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-secondary)' }}>
            No habits yet — tap + on the home screen to add one.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {activeHabitsList.map((habit, idx) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                onRename={(n) => renameHabit(habit.id, n)}
                onDelete={() => setConfirmDelete(habit)}
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        )}
        <p className="text-xs mt-4 mb-6" style={{ color: 'var(--text-secondary)' }}>
          {isPro ? `${activeHabitsList.length} habits` : `${activeHabitsList.length}/${FREE_HABIT_LIMIT} habits — upgrade for unlimited`}
        </p>
      </div>

      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onUpgrade={() => setShowUpgrade(false)}
        />
      )}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null) }}
        >
          <div
            className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl px-5 pt-6 pb-8"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Delete “{confirmDelete.name}”?
            </h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              This removes the habit and its entire grid history. This can’t be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: 'transparent', border: '1px solid var(--border-muted)', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { deleteHabit(confirmDelete.id); setConfirmDelete(null) }}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: '#ff7b72', color: '#000', border: 'none', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
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
