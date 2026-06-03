import Icon from '../components/ui/Icons.jsx'
import { useState, useEffect } from 'react'
import { useApp }       from '../context/AppContext.jsx'
import { useAuth }      from '../context/AuthContext.jsx'
import { groupsAPI }    from '../api/groups.js'
import { authAPI }      from '../api/auth.js'
import Button           from '../components/ui/Button.jsx'
import Input            from '../components/ui/Input.jsx'
import Alert            from '../components/ui/Alert.jsx'
import Card             from '../components/ui/Card.jsx'
import DeptSelector     from '../components/forms/DeptSelector.jsx'
import MemberPicker     from '../components/forms/MemberPicker.jsx'
import { extractError } from '../hooks/useApi.js'
import { fadeUp }       from '../utils/animations.js'
import { motion }       from 'framer-motion'

export default function CreateGroup() {
  const { navigate }          = useApp()
  const { user, isAdmin }     = useAuth()
  const studentDept           = !isAdmin ? user?.department : null

  const [dept, setDept]       = useState(studentDept || '')
  const [subjects, setSubjs]  = useState([])
  const [subjId, setSubjId]   = useState('')
  const [maxMembers, setMax]  = useState('')
  const [description, setDesc]= useState('')
  const [people, setPeople]   = useState([])
  const [selected, setSel]    = useState([])
  const [loadSubj, setLoadSubj] = useState(false)
  const [loadPpl, setLoadPpl]   = useState(false)
  const [loading, setLoad]      = useState(false)
  const [done, setDone]         = useState(false)
  const [created, setCreated]   = useState(null)
  const [error, setError]       = useState('')

  // Load subjects when dept changes
  useEffect(() => {
    if (!dept) return
    setLoadSubj(true); setSubjId(''); setSubjs([])
    groupsAPI.subjects(dept)
      .then(r => setSubjs(r.data.subjects || []))
      .catch(console.error)
      .finally(() => setLoadSubj(false))
  }, [dept])

  // Load classmates/students when dept changes
  useEffect(() => {
    if (!dept) return
    setLoadPpl(true); setSel([])
    const fn = isAdmin ? authAPI.getStudentsByDept(dept) : authAPI.classmates()
    fn.then(r => setPeople(isAdmin ? r.data.users || [] : r.data.classmates || []))
      .catch(console.error)
      .finally(() => setLoadPpl(false))
  }, [dept, isAdmin])

  const toggle = id => setSel(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const submit = async e => {
    e.preventDefault(); setError('')
    if (!dept)    { setError('Select a department.'); return }
    if (!subjId)  { setError('Select a subject.'); return }
    const max = parseInt(maxMembers)
    if (!max || max < 2 || max > 20) { setError('Max members must be 2–20.'); return }
    setLoad(true)
    try {
      const r = await groupsAPI.create({
        subject_id:  parseInt(subjId),
        department:  dept,
        max_members: max,
        description: description.trim(),
        member_ids:  selected,
      })
      setCreated(r.data.group)
      setDone(true)
    } catch (err) { setError(extractError(err)) }
    finally { setLoad(false) }
  }

  const reset = () => {
    setDone(false); setCreated(null); setError('')
    setDept(studentDept || ''); setSubjId(''); setMax(''); setDesc(''); setSel([])
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (done) return (
    <div className="max-w-sm mx-auto text-center py-16">
      <div className="w-20 h-20 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
        <Icon name="checkCircle" size={36} className="text-green-400" />
      </div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Group Created!</h2>
      <p className="text-[var(--text-secondary)] text-sm mb-1">
        <span className="text-[var(--text-primary)] font-semibold">"{created?.name}"</span> is now live.
      </p>
      {created?.member_count > 1 &&
        <p className="text-indigo-600 dark:text-indigo-400 text-sm">{created.member_count} members added</p>
      }
      <div className="flex gap-3 justify-center mt-8">
        <Button onClick={() => navigate('my-groups')}>View My Groups</Button>
        <Button variant="secondary" onClick={reset}>Create Another</Button>
      </div>
    </div>
  )

  // ── Subject selector ────────────────────────────────────────────────────────
  const selectedSubj = subjects.find(s => s.id === parseInt(subjId))

  return (
    <div className="max-w-xl space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create a Group</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {isAdmin ? 'Admin: choose any department and subject' : 'Pick a subject and start a team'}
        </p>
      </motion.div>

      <Card>
        <Alert type="error" message={error} onClose={() => setError('')} />
        <form onSubmit={submit} className={`space-y-5 ${error ? 'mt-4' : ''}`}>

          {/* Department */}
          <DeptSelector
            value={dept}
            onChange={v => setDept(v)}
            locked={!isAdmin}
            lockedDept={studentDept}
          />

          {/* Subject dropdown */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Subject <span className="text-red-400">*</span>
            </label>
            {loadSubj ? (
              <div className="h-11 rounded-xl animate-pulse" style={{ background: 'var(--bg-raised)' }} />
            ) : subjects.length === 0 && dept ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-[var(--text-muted)]"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                <Icon name="alertCircle" size={14} />
                No subjects available for this department.
                {isAdmin && <span className="text-indigo-500 ml-1">Add subjects from Admin Panel.</span>}
              </div>
            ) : (
              <div className="grid gap-2">
                {subjects.map(s => (
                  <button key={s.id} type="button"
                    onClick={() => setSubjId(s.id.toString())}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all w-full
                      ${subjId === s.id.toString()
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-400/10'
                        : 'border-[var(--border)] hover:border-indigo-300 hover:bg-[var(--bg-raised)]'}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs
                      ${subjId === s.id.toString()
                        ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                        : 'bg-[var(--bg-raised)] text-[var(--text-muted)]'}`}>
                      {s.code}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${subjId === s.id.toString() ? 'text-indigo-600 dark:text-indigo-400' : 'text-[var(--text-primary)]'}`}>
                        {s.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Group name will be auto-generated: <span className="font-mono">{s.code}-N</span>
                      </p>
                    </div>
                    {subjId === s.id.toString() &&
                      <Icon name="checkCircle" size={16} className="text-indigo-500 shrink-0" />
                    }
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auto-name preview */}
          {selectedSubj && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
              <Icon name="tag" size={14} className="text-[var(--text-muted)] shrink-0" />
              <p className="text-sm text-[var(--text-secondary)]">
                Group name: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{selectedSubj.code}-auto</span>
                <span className="text-xs text-[var(--text-muted)] ml-1">(e.g. {selectedSubj.code}-1, {selectedSubj.code}-2)</span>
              </p>
            </motion.div>
          )}

          {/* Max members */}
          <Input
            label="Max Members"
            type="number"
            placeholder="5"
            hint="2–20"
            value={maxMembers}
            onChange={e => setMax(e.target.value)}
            min={2} max={20}
            required
          />

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Description <span className="text-[var(--text-faint)] font-normal normal-case">(optional)</span>
            </label>
            <div className="relative">
              <Icon name="fileText" size={14} className="absolute left-3.5 top-3.5 text-[var(--text-faint)] pointer-events-none" />
              <textarea rows={2} placeholder="What is this group working on?"
                value={description} onChange={e => setDesc(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-faint)] rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all resize-none" />
            </div>
          </div>

          {/* Member picker */}
          {(dept || studentDept) &&
            <MemberPicker people={people} selected={selected} onToggle={toggle} dept={dept || studentDept} loading={loadPpl} />
          }

          <div className="px-4 py-3 rounded-xl bg-indigo-500/8 border border-indigo-500/15">
            <p className="text-xs text-[var(--text-secondary)]">
              {isAdmin
                ? '🛡️ Admin mode — you will be group leader'
                : '⭐ You will be Group Leader · selected classmates join immediately'}
            </p>
          </div>

          <Button type="submit" size="lg" loading={loading}
            disabled={!dept || !subjId || !maxMembers}
            fullWidth>
            <Icon name="plus" size={16} /> Create Group
          </Button>
        </form>
      </Card>
    </div>
  )
}
