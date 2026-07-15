import { useState, useRef, useEffect, useCallback } from 'react'
import { useStore, formatDate } from '../store'

interface Props {
  habitId: string
  habitName: string
  onClose: () => void
}

const DOW_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function NotesSheet({ habitId, habitName, onClose }: Props) {
  const { dayNotes, setDayNote } = useStore()
  const notes = dayNotes[habitId] ?? {}

  const today = new Date()
  const todayStr = formatDate(today)

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr)
  const [draft, setDraft] = useState(notes[todayStr] ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea when a date is selected
  useEffect(() => {
    if (selectedDate) {
      setTimeout(() => textareaRef.current?.focus(), 80)
    }
  }, [selectedDate])

  const saveDraft = useCallback(() => {
    if (selectedDate !== null) {
      setDayNote(habitId, selectedDate, draft)
    }
  }, [habitId, selectedDate, draft, setDayNote])

  function changeMonth(delta: number) {
    saveDraft()
    setSelectedDate(null)
    setDraft('')
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  function handleSelectDay(dateStr: string) {
    if (dateStr === selectedDate) return
    saveDraft()
    setSelectedDate(dateStr)
    setDraft(notes[dateStr] ?? '')
  }

  // Build calendar cells: nulls for padding + day numbers
  const firstDow = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const selectedLabel = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          saveDraft()
          onClose()
        }
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: '88vh',
          overflowY: 'auto',
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
        }}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 6 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'var(--border-muted)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4">
          <div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Notes</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{habitName}</p>
          </div>
          <button
            onClick={() => { saveDraft(); onClose() }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', padding: 4,
            }}
            aria-label="Close notes"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between px-4 mb-3">
          <button onClick={() => changeMonth(-1)} style={navBtnStyle}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{monthLabel}</p>
          <button onClick={() => changeMonth(1)} style={navBtnStyle}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Day-of-week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', paddingInline: 12, marginBottom: 2 }}>
          {DOW_LABELS.map((d, i) => (
            <div
              key={i}
              style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-secondary)', paddingBottom: 6 }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', paddingInline: 10, gap: 2 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isSelected = selectedDate === dateStr
            const isToday = dateStr === todayStr
            const hasNote = !!notes[dateStr]
            const isFuture = dateStr > todayStr

            return (
              <button
                key={i}
                onClick={() => handleSelectDay(dateStr)}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 3, minHeight: 44, borderRadius: 8, border: 'none',
                  cursor: 'pointer', padding: '4px 2px',
                  backgroundColor: isSelected
                    ? 'var(--accent)'
                    : isToday
                    ? 'var(--bg)'
                    : 'transparent',
                  outline: isToday && !isSelected ? '1px solid var(--border)' : 'none',
                  opacity: isFuture ? 0.38 : 1,
                }}
              >
                <span style={{
                  fontSize: 14,
                  fontWeight: isToday ? 600 : 400,
                  color: isSelected ? '#000' : 'var(--text-primary)',
                }}>
                  {day}
                </span>
                {/* Note indicator dot */}
                <div style={{
                  width: 4, height: 4, borderRadius: '50%',
                  backgroundColor: isSelected
                    ? 'rgba(0,0,0,0.5)'
                    : 'var(--accent)',
                  opacity: hasNote ? 1 : 0,
                }} />
              </button>
            )
          })}
        </div>

        {/* Note editor */}
        {selectedDate && (
          <div className="px-4 mt-5">
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <p className="text-xs mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                {selectedLabel}
              </p>
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={saveDraft}
                placeholder="Add a note for this day…"
                rows={3}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10,
                  backgroundColor: 'var(--bg)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.5,
                  resize: 'none', outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
                onBlurCapture={(e) => { e.target.style.borderColor = 'var(--border)' }}
              />
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>
                Saves automatically
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid var(--border)',
  borderRadius: 7,
  padding: '5px 10px',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
