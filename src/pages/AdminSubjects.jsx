import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon          from '../components/ui/Icons.jsx'
import Button        from '../components/ui/Button.jsx'
import Input         from '../components/ui/Input.jsx'
import Alert         from '../components/ui/Alert.jsx'
import Badge         from '../components/ui/Badge.jsx'
import { Skeleton }  from '../components/ui/misc.jsx'
import { extractError } from '../hooks/useApi.js'
import { fadeUp, staggerContainer, spring } from '../utils/animations.js'
import { groupsAPI } from '../api/groups.js'

const DEPTS = [{ v: 'SE', l: 'Software Engineering', color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-400/10 border-orange-200 dark:border-orange-400/20' },
               { v: 'CS', l: 'Computer Science',      color: 'text-cyan-500 dark:text-cyan-400',     bg: 'bg-cyan-50 dark:bg-cyan-400/10 border-cyan-200 dark:border-cyan-400/20' }]

// ── Add Subject Modal ─────────────────────────────────────────────────────────
function AddSubjectModal({ onClose, onDone }) {
  const [f, setF]       = useState({ name: '', code: '', department: 'SE' })
  const [loading, setL] = useState(false)
  const [error, setErr] = useState('')
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }))

  const submit = async () => {
    setErr('')
    if (!f.name.trim() || !f.code.trim()) { setErr('Name and code are required.'); return }
    setL(true)
    try {
      await groupsAPI.subjectCreate({ ...f, code: f.code.toUpperCase().trim(), name: f.name.trim() })
      onDone(); onClose()
    } catch (err) { setErr(extractError(err)) }
    finally { setL(false) }
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
            <h2 className="font-bold text-base text-[var(--text-primary)]">Add Subject</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Groups will be named CODE-1, CODE-2…</p>
          </div>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-raised)]">
            <Icon name="x" size={18} />
          </motion.button>
        </div>
        <div className="p-5 space-y-4">
          <Alert type="error" message={error} onClose={() => setErr('')} />
          <Input label="Subject Name" placeholder="English Presentation" value={f.name} onChange={set('name')} />
          <Input label="Short Code" placeholder="ENG"
            hint="Used for auto group names: ENG-1, ENG-2"
            value={f.code} onChange={e => setF(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Department</label>
            <div className="grid grid-cols-2 gap-3">
              {DEPTS.map(d => (
                <button key={d.v} type="button" onClick={() => setF(p => ({ ...p, department: d.v }))}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left
                    ${f.department === d.v
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-400/10'
                      : 'border-[var(--border)] hover:bg-[var(--bg-raised)]'}`}>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${d.bg} ${d.color}`}>{d.v}</span>
                  <span className={`text-xs font-semibold ${f.department === d.v ? 'text-indigo-600 dark:text-indigo-400' : 'text-[var(--text-secondary)]'}`}>
                    {d.v === 'SE' ? 'Software Eng.' : 'Computer Sci.'}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button loading={loading} fullWidth onClick={submit}><Icon name="plus" size={14} /> Add Subject</Button>
            <Button variant="secondary" onClick={onClose} className="shrink-0">Cancel</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Subject Card ──────────────────────────────────────────────────────────────
function SubjectCard({ s, onToggle, onDelete, toggling, deleting }) {
  const dept = DEPTS.find(d => d.v === s.department)
  return (
    <motion.div variants={fadeUp} layout
      className="rounded-2xl p-4 flex items-center gap-4"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${s.is_active ? 'var(--border)' : 'var(--border)'}`,
        opacity: s.is_active ? 1 : 0.55
      }}>
      {/* Code badge */}
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm border ${dept?.bg} ${dept?.color}`}>
        {s.code}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="font-bold text-sm text-[var(--text-primary)] truncate">{s.name}</p>
          {!s.is_active && <Badge variant="warning">Inactive</Badge>}
        </div>
        <p className={`text-xs font-medium ${dept?.color}`}>{dept?.l}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">Groups: {s.code}-1, {s.code}-2…</p>
      </div>

      <div className="flex gap-2 shrink-0">
        <Button variant={s.is_active ? 'secondary' : 'outline'} size="sm"
          loading={toggling === s.id} onClick={() => onToggle(s)}>
          {s.is_active
            ? <><Icon name="eyeOff" size={12} /> Hide</>
            : <><Icon name="eye" size={12} /> Show</>}
        </Button>
        <Button variant="danger" size="sm" loading={deleting === s.id} onClick={() => onDelete(s)}>
          <Icon name="x" size={12} />
        </Button>
      </div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminSubjects() {
  const [subjects, setSubjs]  = useState([])
  const [loading, setLoad]    = useState(true)
  const [deptTab, setDeptTab] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError]     = useState('')
  const [ok, setOk]           = useState('')
  const [toggling, setTog]    = useState(null)
  const [deleting, setDel]    = useState(null)

  const load = () => {
    setLoad(true)
    groupsAPI.subjectsManage()
      .then(r => setSubjs(r.data.subjects || []))
      .catch(e => setError(extractError(e)))
      .finally(() => setLoad(false))
  }
  useEffect(load, [])

  const toggle = async s => {
    setTog(s.id); setError('')
    try {
      await groupsAPI.subjectToggle(s.id, !s.is_active)
      setOk(`${s.name} ${s.is_active ? 'hidden' : 'shown'}.`)
      load()
    } catch (e) { setError(extractError(e)) }
    finally { setTog(null) }
  }

  const del = async s => {
    if (!window.confirm(`Delete "${s.name}"? Groups using this subject will lose their subject link.`)) return
    setDel(s.id); setError('')
    try {
      await groupsAPI.subjectDelete(s.id)
      setOk(`${s.name} deleted.`)
      load()
    } catch (e) { setError(extractError(e)) }
    finally { setDel(null) }
  }

  const filtered = deptTab === 'all' ? subjects : subjects.filter(s => s.department === deptTab)
  const seCnt = subjects.filter(s => s.department === 'SE').length
  const csCnt = subjects.filter(s => s.department === 'CS').length
  const activeCnt = subjects.filter(s => s.is_active).length

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showAdd && <AddSubjectModal onClose={() => setShowAdd(false)} onDone={() => { load(); setOk('Subject added!') }} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon name="bookOpen" size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Subjects</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Manage subjects for group creation · Groups auto-named CODE-1, CODE-2</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={load}><Icon name="refreshCw" size={14} /></Button>
          <Button onClick={() => setShowAdd(true)}><Icon name="plus" size={15} /> Add Subject</Button>
        </div>
      </motion.div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={ok} />

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate"
        className="grid grid-cols-3 gap-3">
        {[
          { l: 'SE Subjects', c: seCnt,      col: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-400/8 border-orange-200 dark:border-orange-400/20' },
          { l: 'CS Subjects', c: csCnt,      col: 'text-cyan-500 dark:text-cyan-400',     bg: 'bg-cyan-50 dark:bg-cyan-400/8 border-cyan-200 dark:border-cyan-400/20' },
          { l: 'Active',      c: activeCnt,  col: 'text-green-500 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-400/8 border-green-200 dark:border-green-400/20' },
        ].map(({ l, c, col, bg }) => (
          <motion.div key={l} variants={fadeUp} className={`rounded-2xl border p-4 text-center ${bg}`}>
            <p className={`text-2xl font-bold ${col}`}>{c}</p>
            <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">{l}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Dept filter */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
        {[{ k: 'all', l: 'All' }, { k: 'SE', l: 'SE' }, { k: 'CS', l: 'CS' }].map(({ k, l }) => (
          <button key={k} onClick={() => setDeptTab(k)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all
              ${deptTab === k
                ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* List */}
      {loading
        ? <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
        : filtered.length === 0
          ? (
            <div className="rounded-2xl p-12 text-center" style={{ border: '1px dashed var(--border)' }}>
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-raised)] flex items-center justify-center mx-auto mb-4">
                <Icon name="bookOpen" size={24} className="text-[var(--text-muted)]" />
              </div>
              <p className="font-bold text-[var(--text-primary)] mb-1">No subjects yet</p>
              <p className="text-sm text-[var(--text-muted)] mb-4">Add subjects so students can create groups</p>
              <Button size="sm" onClick={() => setShowAdd(true)}><Icon name="plus" size={13} /> Add First Subject</Button>
            </div>
          )
          : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
              {filtered.map(s => (
                <SubjectCard key={s.id} s={s}
                  onToggle={toggle} onDelete={del}
                  toggling={toggling} deleting={deleting} />
              ))}
            </motion.div>
          )
      }
    </div>
  )
}
