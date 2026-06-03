import { useState } from 'react'
import { motion } from 'framer-motion'
import Icon          from '../components/ui/Icons.jsx'
import { useAuth }   from '../context/AuthContext.jsx'
import Button        from '../components/ui/Button.jsx'
import Input         from '../components/ui/Input.jsx'
import Alert         from '../components/ui/Alert.jsx'
import { Avatar }    from '../components/ui/misc.jsx'
import { extractError } from '../hooks/useApi.js'
import { fadeUp, staggerContainer, spring } from '../utils/animations.js'
import api from '../api/axios.js'

const changePassword = (d) => api.post('/api/auth/change-password/', d)

// ── Password strength helper ─────────────────────────────────────────────────
function strength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }
  let s = 0
  if (pw.length >= 8)               s++
  if (/[A-Z]/.test(pw))             s++
  if (/[0-9]/.test(pw))             s++
  if (/[^A-Za-z0-9]/.test(pw))      s++
  const map = [
    { label: 'Too short',  color: 'bg-red-500' },
    { label: 'Weak',       color: 'bg-red-400' },
    { label: 'Fair',       color: 'bg-amber-400' },
    { label: 'Good',       color: 'bg-blue-400' },
    { label: 'Strong',     color: 'bg-green-500' },
  ]
  return { score: s, ...map[s] }
}

// ── Change Password Section ──────────────────────────────────────────────────
function ChangePasswordSection() {
  const [f, setF]         = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [show, setShow]   = useState({ old: false, new: false, confirm: false })
  const [loading, setL]   = useState(false)
  const [error, setErr]   = useState('')
  const [success, setOk]  = useState('')
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }))
  const pw = strength(f.new_password)

  const submit = async () => {
    setErr(''); setOk('')
    if (!f.old_password || !f.new_password || !f.confirm_password) { setErr('All fields are required.'); return }
    if (f.new_password !== f.confirm_password) { setErr('New passwords do not match.'); return }
    if (f.new_password.length < 8) { setErr('Password must be at least 8 characters.'); return }
    setL(true)
    try {
      const r = await changePassword(f)
      setOk(r.data.message || 'Password changed!')
      setF({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) { setErr(extractError(err)) }
    finally { setL(false) }
  }

  return (
    <motion.div variants={fadeUp}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <Icon name="lock" size={16} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Change Password</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Keep your account secure</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <Alert type="error"   message={error}   onClose={() => setErr('')} />
        <Alert type="success" message={success} />

        {/* Current password */}
        <div className="relative">
          <Input
            label="Current Password"
            type={show.old ? 'text' : 'password'}
            placeholder="Enter current password"
            value={f.old_password}
            onChange={set('old_password')}
          />
          <button type="button"
            onClick={() => setShow(s => ({ ...s, old: !s.old }))}
            className="absolute right-3 top-8 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <Icon name={show.old ? 'eyeOff' : 'eye'} size={15} />
          </button>
        </div>

        {/* New password */}
        <div className="relative">
          <Input
            label="New Password"
            type={show.new ? 'text' : 'password'}
            placeholder="Min 8 characters"
            value={f.new_password}
            onChange={set('new_password')}
          />
          <button type="button"
            onClick={() => setShow(s => ({ ...s, new: !s.new }))}
            className="absolute right-3 top-8 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <Icon name={show.new ? 'eyeOff' : 'eye'} size={15} />
          </button>
        </div>

        {/* Strength bar */}
        {f.new_password.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300
                  ${i < pw.score ? pw.color : 'bg-[var(--border)]'}`} />
              ))}
            </div>
            <p className={`text-xs font-medium ${
              pw.score <= 1 ? 'text-red-400' :
              pw.score === 2 ? 'text-amber-400' :
              pw.score === 3 ? 'text-blue-400' : 'text-green-500'
            }`}>{pw.label}</p>
          </motion.div>
        )}

        {/* Confirm password */}
        <div className="relative">
          <Input
            label="Confirm New Password"
            type={show.confirm ? 'text' : 'password'}
            placeholder="Repeat new password"
            value={f.confirm_password}
            onChange={set('confirm_password')}
          />
          <button type="button"
            onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
            className="absolute right-3 top-8 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <Icon name={show.confirm ? 'eyeOff' : 'eye'} size={15} />
          </button>
          {/* Match indicator */}
          {f.confirm_password.length > 0 && (
            <div className={`absolute right-10 top-8.5 flex items-center ${
              f.new_password === f.confirm_password ? 'text-green-500' : 'text-red-400'
            }`}>
              <Icon name={f.new_password === f.confirm_password ? 'checkCircle' : 'x'} size={14} />
            </div>
          )}
        </div>

        <Button loading={loading} onClick={submit} className="w-fit">
          <Icon name="lock" size={14} /> Update Password
        </Button>
      </div>
    </motion.div>
  )
}

// ── Profile Info Section ─────────────────────────────────────────────────────
function ProfileInfoSection({ user }) {
  const initials   = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || '?'
  const deptLabel  = user?.department === 'SE' ? 'Software Engineering'
                   : user?.department === 'CS' ? 'Computer Science' : 'Not Set'
  const deptColor  = user?.department === 'SE' ? 'text-orange-500 dark:text-orange-400'
                   : user?.department === 'CS' ? 'text-cyan-500 dark:text-cyan-400' : 'text-[var(--text-muted)]'

  return (
    <motion.div variants={fadeUp}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <Icon name="users" size={16} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Profile Info</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Your account details</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <Avatar initials={initials} dept={user?.department} size="xl" />
          <div>
            <p className="font-bold text-base text-[var(--text-primary)]">{user?.name}</p>
            <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{user?.roll_number}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {user?.is_verified
                ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-400/10 px-2 py-0.5 rounded-full">
                    <Icon name="check" size={9} /> Verified
                  </span>
                : <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-400/10 px-2 py-0.5 rounded-full">
                    Unverified
                  </span>
              }
              {user?.role === 'admin' &&
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-400/10 px-2 py-0.5 rounded-full">
                  <Icon name="shieldCheck" size={9} /> Admin
                </span>
              }
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-3">
          {[
            { icon: 'mail',          label: 'Email',       value: user?.email },
            { icon: 'graduationCap', label: 'Department',  value: deptLabel, className: deptColor },
            { icon: 'users',         label: 'Role',        value: user?.role === 'admin' ? 'Administrator' : 'Student' },
          ].map(({ icon, label, value, className }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--bg-raised)' }}>
                <Icon name={icon} size={14} className="text-[var(--text-muted)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
                <p className={`text-sm font-medium truncate ${className || 'text-[var(--text-primary)]'}`}>{value || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AccountSettings() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 mb-1">
          <Icon name="settings" size={18} className="text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Account Settings</h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">Manage your profile and security</p>
      </motion.div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
        <ProfileInfoSection user={user} />
        <ChangePasswordSection />
      </motion.div>
    </div>
  )
}
