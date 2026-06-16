import { useRef, useState, useCallback } from 'react'
import { useStore, formatDate } from '../store'
import UpgradeModal from './UpgradeModal'
import { exportBackup, importBackup, daysSinceBackup } from '../utils/backup'

interface Props {
  onBack: () => void
}

export default function Settings({ onBack }: Props) {
  const { isPro, licenseKey, setIsPro, setLicenseKey, lastBackedUp, setLastBackedUp } = useStore()
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
          Pro & Backup
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
                    Keep it safe — it re-unlocks Pro on any device. It doesn't store your habits; back those up separately.
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

        {/* Backup & Restore */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          BACKUP & RESTORE
        </p>

        {/* How it works — make the data vs Pro distinction obvious */}
        <div
          className="rounded-xl px-4 py-4 mb-3"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>How HabitGrid keeps your data</p>
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            Everything is stored on this phone — no account, no cloud sync. That means two separate things move with you:
          </p>

          <div className="flex items-start gap-3 mb-2.5">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1, color: 'var(--accent)' }}>
              <path d="M2 5a1.5 1.5 0 011.5-1.5h3l1.5 1.5h6A1.5 1.5 0 0115.5 6.5v6A1.5 1.5 0 0114 14H3.5A1.5 1.5 0 012 12.5V5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
              <span className="font-semibold">Your history</span> (habits, grids, streaks) lives only on this device. A <span className="font-semibold">backup file</span> is the only copy — it's what moves your data to a new phone.
            </p>
          </div>

          <div className="flex items-start gap-3 mb-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1, color: 'var(--accent)' }}>
              <circle cx="6" cy="9" r="3" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8.5 9H16M13.5 9v2.5M11 9v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
              <span className="font-semibold">Your license key</span> only re-unlocks <span className="font-semibold">Pro</span>. It does <span className="font-semibold">not</span> carry your habits or history.
            </p>
          </div>

          <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: 'var(--bg)', border: `1px solid ${'#e3b341'}55` }}>
            <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
              <span className="font-semibold">Switching phones?</span> You need both — restore your backup to get your history back, then enter your license key to re-unlock Pro.
            </p>
          </div>
        </div>

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

