import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../components/ui/Icons.jsx'
import { useEffect, useState, useRef } from 'react'
import { useAuth }      from '../context/AuthContext.jsx'
import { useApp }       from '../context/AppContext.jsx'
import { authAPI }      from '../api/auth.js'
import Button           from '../components/ui/Button.jsx'
import Input            from '../components/ui/Input.jsx'
import Alert            from '../components/ui/Alert.jsx'
import Badge            from '../components/ui/Badge.jsx'
import { Avatar, Skeleton, EmptyState } from '../components/ui/misc.jsx'
import DeptSelector     from '../components/forms/DeptSelector.jsx'
import { extractError } from '../hooks/useApi.js'
import { staggerContainer, fadeUp, scaleIn, spring, springSmooth, springSnappy } from '../utils/animations.js'
import api from '../api/axios.js'

// ── Admin API ────────────────────────────────────────────────────────────────
const adminAPI = {
  createSingle:  (d)  => api.post('/api/auth/admin/users/create/', d),
  createBulkCSV: (fd) => api.post('/api/auth/admin/users/bulk-create/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  createBulkJSON:(d)  => api.post('/api/auth/admin/users/bulk-create/', d),
  deleteAll:     ()   => api.delete('/api/auth/admin/users/delete-all/'),
}

const CSV_TEMPLATE = `roll_number,name,email,department,role\nSU72-BSSEM-F25-001,Ahmed Ali,ahmed@su.edu.pk,SE,student\nSU72-BSCS-F25-002,Sara Khan,sara@su.edu.pk,CS,student`
const blankRow = () => ({ roll_number: '', name: '', email: '', department: 'SE', role: 'student' })

// ── Add Single User Modal ────────────────────────────────────────────────────
function AddModal({ onClose, onDone }) {
  const [f, setF]     = useState({ roll_number: '', name: '', email: '', department: 'SE', role: 'student', password: '' })
  const [loading, setL] = useState(false)
  const [error, setErr] = useState('')
  const [result, setRes] = useState(null)
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setErr(''); setRes(null); setL(true)
    try {
      const body = { ...f, roll_number: f.roll_number.toUpperCase().trim() }
      if (!body.password) delete body.password
      const r = await adminAPI.createSingle(body)
      setRes(r.data)
      onDone()
    } catch (err) { setErr(extractError(err)) }
    finally { setL(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={spring}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="font-bold text-base text-[var(--text-primary)]">Add New User</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Auto-verified · No email needed</p>
          </div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-raised)]">
            <Icon name="x" size={18} />
          </motion.button>
        </div>
        <div className="p-5 space-y-4">
          <Alert type="error" message={error} onClose={() => setErr('')} />
          {result ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 space-y-2" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 text-green-500 font-bold text-sm mb-2">
                <Icon name="checkCircle" size={16} /> User created!
              </div>
              <p className="text-xs text-[var(--text-muted)]">Roll: <span className="font-mono font-bold text-indigo-500">{result.user?.roll_number}</span></p>
              {result.auto_password && (
                <p className="text-xs text-[var(--text-muted)]">Password: <code className="font-mono bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-lg">{result.auto_password}</code></p>
              )}
              <Button size="sm" variant="secondary" onClick={() => { setRes(null); setF({ roll_number: '', name: '', email: '', department: 'SE', role: 'student', password: '' }) }}>
                Add Another
              </Button>
            </motion.div>
          ) : (
            <>
              <Input label="Roll Number" placeholder="SU72-BSSEM-F25-017" hint="Format: SU##-DEPT-X##-###"
                value={f.roll_number} onChange={e => setF(p => ({ ...p, roll_number: e.target.value.toUpperCase() }))} mono required />
              <Input label="Full Name" placeholder="Ali Hassan" value={f.name} onChange={set('name')} required />
              <Input label="Email" type="email" placeholder="ali@su.edu.pk" value={f.email} onChange={set('email')} required />
              <DeptSelector value={f.department} onChange={v => setF(p => ({ ...p, department: v }))} />
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { v: 'student', label: 'Student', icon: 'users' },
                    { v: 'admin',   label: 'Admin',   icon: 'shieldCheck' },
                  ].map(r => (
                    <button key={r.v} type="button" onClick={() => setF(p => ({ ...p, role: r.v }))}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer text-left
                        ${f.role === r.v
                          ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400'
                          : 'border-[var(--border)] hover:bg-[var(--bg-raised)] text-[var(--text-secondary)]'}`}>
                      <Icon name={r.icon} size={15} />
                      <span className="text-sm font-semibold">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Input label="Password (optional)" type="password" placeholder="Leave blank → auto ROLL@123"
                hint="Optional" value={f.password} onChange={set('password')} />
              <div className="flex gap-3 pt-1">
                <Button loading={loading} fullWidth onClick={submit}><Icon name="userPlus" size={14} /> Create User</Button>
                <Button variant="secondary" onClick={onClose} className="shrink-0">Cancel</Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Bulk Create Modal ────────────────────────────────────────────────────────
function BulkModal({ onClose, onDone }) {
  const [mode, setMode]       = useState('manual')
  const [rows, setRows]       = useState([blankRow()])
  const [csvFile, setCsvFile] = useState(null)
  const [loading, setL]       = useState(false)
  const [error, setErr]       = useState('')
  const [result, setRes]      = useState(null)
  const fileRef               = useRef()

  const addRow    = () => setRows(r => [...r, blankRow()])
  const removeRow = i => setRows(r => r.filter((_, idx) => idx !== i))
  const setCell   = (i, k, v) => setRows(r => r.map((row, idx) => idx === i ? { ...row, [k]: v } : row))

  const submit = async () => {
    setErr(''); setRes(null); setL(true)
    try {
      let r
      if (mode === 'csv' && csvFile) {
        const fd = new FormData(); fd.append('file', csvFile)
        r = await adminAPI.createBulkCSV(fd)
      } else {
        r = await adminAPI.createBulkJSON({ users: rows })
      }
      setRes(r.data); onDone()
    } catch (err) { setErr(extractError(err)) }
    finally { setL(false) }
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = 'unigroups_users_template.csv'; a.click()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={spring}
        className="w-full sm:max-w-3xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="font-bold text-base text-[var(--text-primary)]">Bulk Create Users</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Manual entry or CSV upload · Password auto = ROLL@123</p>
          </div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-raised)]">
            <Icon name="x" size={18} />
          </motion.button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <Alert type="error" message={error} onClose={() => setErr('')} />

          {/* Mode toggle */}
          <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
            {[{ k: 'manual', l: 'Manual Entry' }, { k: 'csv', l: 'CSV Upload' }].map(({ k, l }) => (
              <button key={k} onClick={() => { setMode(k); setRes(null) }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all
                  ${mode === k
                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                {l}
              </button>
            ))}
          </div>

          {/* Manual rows */}
          {mode === 'manual' && !result && (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}>
                      {['#', 'Roll Number *', 'Full Name *', 'Email *', 'Dept', 'Role', ''].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                        <td className="px-3 py-2 text-[var(--text-faint)] font-mono">{i + 1}</td>
                        <td className="px-2 py-1.5 min-w-[160px]">
                          <input value={row.roll_number} onChange={e => setCell(i, 'roll_number', e.target.value.toUpperCase())}
                            placeholder="SU72-BSSEM-F25-001"
                            className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono text-indigo-600 dark:text-indigo-400 outline-none"
                            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} />
                        </td>
                        <td className="px-2 py-1.5 min-w-[130px]">
                          <input value={row.name} onChange={e => setCell(i, 'name', e.target.value)} placeholder="Full Name"
                            className="w-full px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} />
                        </td>
                        <td className="px-2 py-1.5 min-w-[160px]">
                          <input value={row.email} onChange={e => setCell(i, 'email', e.target.value)} placeholder="email@su.edu.pk" type="email"
                            className="w-full px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} />
                        </td>
                        <td className="px-2 py-1.5">
                          <select value={row.department} onChange={e => setCell(i, 'department', e.target.value)}
                            className="px-2 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                            <option value="SE">SE</option><option value="CS">CS</option>
                          </select>
                        </td>
                        <td className="px-2 py-1.5">
                          <select value={row.role} onChange={e => setCell(i, 'role', e.target.value)}
                            className="px-2 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                            <option value="student">Student</option><option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-2 py-1.5">
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeRow(i)} disabled={rows.length === 1}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 disabled:opacity-30">
                            <Icon name="x" size={12} />
                          </motion.button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button size="sm" variant="outline" onClick={addRow}><Icon name="plus" size={13} /> Add Row</Button>
            </div>
          )}

          {/* CSV upload */}
          {mode === 'csv' && !result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-[var(--text-muted)]">Columns: <code className="font-mono bg-indigo-500/10 text-indigo-500 px-1.5 rounded">roll_number, name, email, department, role</code></p>
                <Button size="sm" variant="ghost" onClick={downloadTemplate}><Icon name="arrowRight" size={12} /> Download Template</Button>
              </div>
              <div onClick={() => fileRef.current.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); setCsvFile(e.dataTransfer.files[0]) }}
                className="rounded-2xl p-8 text-center cursor-pointer transition-all"
                style={{ border: `2px dashed ${csvFile ? 'var(--color-primary, #6366f1)' : 'var(--border)'}`, background: csvFile ? 'var(--bg-raised)' : 'transparent' }}>
                <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => setCsvFile(e.target.files[0])} />
                {csvFile ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 flex items-center justify-center mx-auto mb-3">
                      <Icon name="check" size={22} className="text-indigo-500" />
                    </div>
                    <p className="font-semibold text-sm text-[var(--text-primary)]">{csvFile.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{(csvFile.size / 1024).toFixed(1)} KB · Click to change</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-[var(--bg-raised)] flex items-center justify-center mx-auto mb-3">
                      <Icon name="plus" size={22} className="text-[var(--text-muted)]" />
                    </div>
                    <p className="font-semibold text-sm text-[var(--text-primary)]">Click or drag CSV here</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Only .csv files accepted</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { l: 'Total',   c: result.total,          col: 'text-[var(--text-primary)]' },
                  { l: 'Created', c: result.created_count,  col: 'text-green-500 dark:text-green-400' },
                  { l: 'Failed',  c: result.failed_count,   col: result.failed_count > 0 ? 'text-red-500' : 'text-[var(--text-faint)]' },
                ].map(({ l, c, col }) => (
                  <div key={l} className="rounded-2xl p-4 text-center" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                    <p className={`text-2xl font-bold ${col}`}>{c}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
              {result.created?.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}>
                    <Icon name="checkCircle" size={14} className="text-green-500" />
                    <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Created ({result.created_count})</span>
                  </div>
                  {result.created.map(u => (
                    <div key={u.roll_number} className="px-4 py-2.5 flex items-center gap-3 text-xs" style={{ borderTop: '1px solid var(--border)' }}>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{u.roll_number}</span>
                      <span className="text-[var(--text-secondary)] flex-1">{u.name}</span>
                      {u.auto_password && <code className="font-mono bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-lg">{u.auto_password}</code>}
                    </div>
                  ))}
                </div>
              )}
              {result.failed?.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.05)', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
                    <Icon name="x" size={14} className="text-red-500" />
                    <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Failed ({result.failed_count})</span>
                  </div>
                  {result.failed.map(f => (
                    <div key={f.row} className="px-4 py-2.5 text-xs" style={{ borderTop: '1px solid rgba(239,68,68,0.1)' }}>
                      <span className="text-[var(--text-faint)] mr-2">Row {f.row}</span>
                      <span className="font-mono text-[var(--text-secondary)] mr-2">{f.data.roll_number || '—'}</span>
                      <span className="text-red-400">{Object.entries(f.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(' · ')}</span>
                    </div>
                  ))}
                </div>
              )}
              <Button size="sm" variant="secondary" onClick={() => { setRes(null); setRows([blankRow()]); setCsvFile(null) }}>
                Create More
              </Button>
            </motion.div>
          )}
        </div>

        {!result && (
          <div className="px-5 py-4 shrink-0 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
            <Button loading={loading} onClick={submit} disabled={mode === 'csv' && !csvFile}>
              <Icon name="userPlus" size={14} />
              {mode === 'manual' ? `Create ${rows.length} User${rows.length !== 1 ? 's' : ''}` : 'Upload & Create'}
            </Button>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ── Delete All Confirm Modal ─────────────────────────────────────────────────
function DeleteAllModal({ onClose, onDone, count }) {
  const [loading, setL]  = useState(false)
  const [confirm, setCon] = useState('')
  const [error, setErr]  = useState('')

  const submit = async () => {
    if (confirm !== 'DELETE') { setErr('Type DELETE to confirm'); return }
    setL(true)
    try {
      await adminAPI.deleteAll()
      onDone()
      onClose()
    } catch (err) { setErr(extractError(err)) }
    finally { setL(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={spring}
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid rgba(239,68,68,0.3)' }}>
        <div className="p-5 space-y-4">
          {/* Warning icon */}
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <Icon name="shieldAlert" size={22} className="text-red-500" />
          </div>
          <div>
            <h2 className="font-bold text-base text-[var(--text-primary)]">Delete All Students?</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              This will permanently delete <span className="font-bold text-red-500">{count} student account{count !== 1 ? 's' : ''}</span>. Admin accounts will not be affected. This cannot be undone.
            </p>
          </div>
          <Alert type="error" message={error} onClose={() => setErr('')} />
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Type <span className="text-red-500 font-mono">DELETE</span> to confirm
            </label>
            <input value={confirm} onChange={e => setCon(e.target.value.toUpperCase())}
              placeholder="DELETE"
              className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none"
              style={{ background: 'var(--bg-raised)', border: `2px solid ${confirm === 'DELETE' ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`, color: 'var(--text-primary)' }} />
          </div>
          <div className="flex gap-3">
            <Button variant="danger" loading={loading} fullWidth onClick={submit} disabled={confirm !== 'DELETE'}>
              Delete {count} Students
            </Button>
            <Button variant="secondary" onClick={onClose} className="shrink-0">Cancel</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Edit Dept Modal ──────────────────────────────────────────────────────────
function EditDeptModal({ user, onClose, onSaved }) {
  const [dept, setDept] = useState(user.department || 'SE')
  const [loading, setL] = useState(false); const [error, setErr] = useState('')
  const save = async () => {
    setL(true); setErr('')
    try { await authAPI.updateUser(user.id, { department: dept }); onSaved(); onClose() }
    catch (err) { setErr(extractError(err)) } finally { setL(false) }
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={spring}
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="font-bold text-base text-[var(--text-primary)]">Edit Department</h2>
            <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">{user.roll_number}</p>
          </div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-raised)]">
            <Icon name="x" size={18} />
          </motion.button>
        </div>
        <div className="p-5 space-y-4">
          <Alert type="error" message={error} onClose={() => setErr('')} />
          <DeptSelector value={dept} onChange={setDept} />
          <div className="flex gap-3">
            <Button loading={loading} onClick={save} fullWidth>Save Changes</Button>
            <Button variant="secondary" onClick={onClose} className="shrink-0">Cancel</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── User Card ────────────────────────────────────────────────────────────────
function UserCard({ u, onEdit, onToggleRole, onDelete, changing, deleting }) {
  const initials  = u.name.split(' ').map(w => w[0]).join('').slice(0, 2)
  const dColor    = u.department === 'SE' ? 'text-orange-500 dark:text-orange-400' : u.department === 'CS' ? 'text-cyan-500 dark:text-cyan-400' : 'text-[var(--text-muted)]'
  const dLabel    = u.department === 'SE' ? 'Software Engineering' : u.department === 'CS' ? 'Computer Science' : 'No department'
  const dBorderColor = u.department === 'SE' ? '#fb923c' : u.department === 'CS' ? '#22d3ee' : 'var(--border)'
  return (
    <motion.div variants={fadeUp} layout
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${dBorderColor}` }}>
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar initials={initials} dept={u.department} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-bold text-sm text-[var(--text-primary)] truncate">{u.name}</p>
              {u.role === 'admin' && <Badge variant="admin">Admin</Badge>}
            </div>
            <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-wide">{u.roll_number}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {u.is_verified
                ? <Badge variant="success"><Icon name="check" size={9} /> Verified</Badge>
                : <Badge variant="warning">Unverified</Badge>}
              <span className={`text-xs font-medium ${dColor}`}>{dLabel}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => onEdit(u)} className="flex-1 sm:flex-none">
            <Icon name="pencil" size={12} /> Dept
          </Button>
          <Button variant={u.role === 'admin' ? 'danger' : 'outline'} size="sm"
            loading={changing === u.id} onClick={() => onToggleRole(u)} className="flex-1 sm:flex-none">
            {u.role === 'admin' ? <><Icon name="shieldX" size={12} /> Revoke</> : <><Icon name="shieldCheck" size={12} /> Admin</>}
          </Button>
          <Button variant="danger" size="sm" loading={deleting === u.id} onClick={() => onDelete(u)}>
            <Icon name="x" size={12} />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const { isAdmin } = useAuth(); const { navigate } = useApp()
  const [users, setUsers]         = useState([])
  const [loading, setLoad]        = useState(true)
  const [deptTab, setDeptTab]     = useState('all')
  const [query, setQuery]         = useState('')
  const [error, setError]         = useState('')
  const [ok, setOk]               = useState('')
  const [showAdd, setShowAdd]     = useState(false)
  const [showBulk, setShowBulk]   = useState(false)
  const [showDelAll, setDelAll]   = useState(false)
  const [editUser, setEditUser]   = useState(null)
  const [changing, setChanging]   = useState(null)
  const [deleting, setDeleting]   = useState(null)

  const loadUsers = () => {
    setLoad(true)
    const p = {}; if (deptTab !== 'all') p.dept = deptTab
    authAPI.listUsers(p)
      .then(r => setUsers(r.data.users || []))
      .catch(e => setError(extractError(e)))
      .finally(() => setLoad(false))
  }
  useEffect(() => { if (!isAdmin) { navigate('dashboard'); return }; loadUsers() }, [isAdmin, deptTab])

  const toggleRole = async u => {
    setChanging(u.id); setError(''); setOk('')
    try { await authAPI.updateUser(u.id, { role: u.role === 'admin' ? 'student' : 'admin' }); setOk(`${u.name} updated.`); loadUsers() }
    catch (e) { setError(extractError(e)) } finally { setChanging(null) }
  }
  const del = async u => {
    if (!window.confirm(`Delete ${u.roll_number}?`)) return
    setDeleting(u.id)
    try { await authAPI.deleteUser(u.id); setOk(`${u.name} deleted.`); loadUsers() }
    catch (e) { setError(extractError(e)) } finally { setDeleting(null) }
  }

  const filtered  = users.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.roll_number.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  )
  const studentCnt = users.filter(u => u.role === 'student').length
  const seCnt      = users.filter(u => u.department === 'SE').length
  const csCnt      = users.filter(u => u.department === 'CS').length
  const unCnt      = users.filter(u => !u.department).length
  const unverCnt   = users.filter(u => !u.is_verified).length

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showAdd   && <AddModal     onClose={() => setShowAdd(false)}  onDone={loadUsers} />}
        {showBulk  && <BulkModal    onClose={() => setShowBulk(false)} onDone={loadUsers} />}
        {showDelAll && <DeleteAllModal onClose={() => setDelAll(false)} onDone={() => { loadUsers(); setOk('All students deleted.') }} count={studentCnt} />}
        {editUser  && <EditDeptModal user={editUser} onClose={() => setEditUser(null)} onSaved={loadUsers} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon name="shieldCheck" size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Manage Users</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Add students, assign departments, manage roles</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={loadUsers}><Icon name="refreshCw" size={14} /></Button>
          <Button variant="outline" size="sm" onClick={() => setShowBulk(true)}>
            <Icon name="plus" size={14} /> Bulk Create
          </Button>
          <Button onClick={() => setShowAdd(true)}>
            <Icon name="userPlus" size={15} /> Add User
          </Button>
        </div>
      </motion.div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={ok} />

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: 'SE Students', c: seCnt,    color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-400/8 border-orange-200 dark:border-orange-400/20' },
          { l: 'CS Students', c: csCnt,    color: 'text-cyan-500 dark:text-cyan-400',     bg: 'bg-cyan-50 dark:bg-cyan-400/8 border-cyan-200 dark:border-cyan-400/20' },
          { l: 'Unassigned',  c: unCnt,    color: 'text-[var(--text-secondary)]',          bg: 'bg-[var(--bg-raised)] border-[var(--border)]' },
          { l: 'Unverified',  c: unverCnt, color: 'text-amber-500 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-400/8 border-amber-200 dark:border-amber-400/20' },
        ].map(({ l, c, color, bg }) => (
          <motion.div key={l} variants={fadeUp} className={`rounded-2xl border p-4 text-center ${bg}`}>
            <p className={`text-2xl font-bold ${c > 0 ? color : 'text-[var(--text-faint)]'}`}>{c}</p>
            <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">{l}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 p-1 rounded-xl w-full sm:w-auto" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
          {[{ k: 'all', l: 'All' }, { k: 'SE', l: 'SE' }, { k: 'CS', l: 'CS' }, { k: '', l: 'None' }].map(({ k, l }) => (
            <button key={k} onClick={() => setDeptTab(k)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all
                ${deptTab === k
                  ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <Input icon={<Icon name="search" size={14} />} placeholder="Search name, roll number, email…"
            value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </div>

      {!loading && <p className="text-xs text-[var(--text-muted)]">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>}

      {/* List */}
      {loading
        ? <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        : filtered.length === 0
          ? <EmptyState iconName="users" title="No users found"
              action={
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setShowAdd(true)}><Icon name="userPlus" size={13} /> Add User</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowBulk(true)}><Icon name="plus" size={13} /> Bulk</Button>
                </div>
              } />
          : <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
              {filtered.map(u => (
                <UserCard key={u.id} u={u}
                  onEdit={setEditUser}
                  onToggleRole={toggleRole}
                  onDelete={del}
                  changing={changing}
                  deleting={deleting} />
              ))}
            </motion.div>
      }

      {/* Danger Zone */}
      {!loading && users.length > 0 && (
        <motion.div variants={fadeUp} className="rounded-2xl p-4 mt-4"
          style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.03)' }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-bold text-red-500">Danger Zone</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Delete all student accounts permanently. Admin accounts stay safe.</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setDelAll(true)}>
              <Icon name="x" size={13} /> Delete All Students
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
