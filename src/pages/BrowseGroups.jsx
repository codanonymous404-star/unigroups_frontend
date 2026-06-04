import Icon from '../components/ui/Icons.jsx'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp }    from '../context/AppContext.jsx'
import { useAuth }   from '../context/AuthContext.jsx'
import { groupsAPI } from '../api/groups.js'
import GroupCard     from '../components/cards/GroupCard.jsx'
import Input         from '../components/ui/Input.jsx'
import { Skeleton, EmptyState } from '../components/ui/misc.jsx'
import Alert         from '../components/ui/Alert.jsx'
import Button        from '../components/ui/Button.jsx'
import Badge         from '../components/ui/Badge.jsx'
import { extractError } from '../hooks/useApi.js'
import { springSmooth, springSnappy, fadeUp, staggerContainer } from '../utils/animations.js'

const DTABS = [{ k: 'all', l: 'All Depts' }, { k: 'SE', l: 'SE' }, { k: 'CS', l: 'CS' }]
const STABS = [{ k: 'all', l: 'All' }, { k: 'open', l: 'Open' }, { k: 'locked', l: 'Locked' }]

const DEPT_CFG = {
  SE: { bar: 'bg-orange-400', color: 'text-orange-500 dark:text-orange-400', chip: 'bg-orange-50 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-400/20', label: 'Software Engineering' },
  CS: { bar: 'bg-cyan-400',   color: 'text-cyan-500 dark:text-cyan-400',     chip: 'bg-cyan-50 dark:bg-cyan-400/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-400/20',         label: 'Computer Science'     },
}

// ── Group subjects from flat list ─────────────────────────────────────────────
function groupBySubject(groups) {
  const map = {}
  const noSubj = []
  groups.forEach(g => {
    if (g.subject && g.subject_name) {
      if (!map[g.subject]) map[g.subject] = { id: g.subject, name: g.subject_name, groups: [] }
      map[g.subject].groups.push(g)
    } else {
      noSubj.push(g)
    }
  })
  const list = Object.values(map)
  if (noSubj.length) list.push({ id: null, name: 'General', groups: noSubj })
  return list
}

function groupByDeptThenSubject(groups) {
  const SE = groups.filter(g => g.department === 'SE')
  const CS = groups.filter(g => g.department === 'CS')
  return [
    SE.length ? { dept: 'SE', subjects: groupBySubject(SE) } : null,
    CS.length ? { dept: 'CS', subjects: groupBySubject(CS) } : null,
  ].filter(Boolean)
}

// ── Collapsible subject section ───────────────────────────────────────────────
const PREVIEW = 2   // groups shown before "show more"

function SubjectSection({ subject, joining, onJoin, navigate, membersMap, deptKey }) {
  const [open,     setOpen]    = useState(true)
  const [expanded, setExpanded] = useState(false)
  const cfg     = DEPT_CFG[deptKey] || DEPT_CFG.SE
  const total   = subject.groups.length
  const visible = expanded ? subject.groups : subject.groups.slice(0, PREVIEW)
  const hidden  = total - PREVIEW

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      {/* Subject header */}
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-[var(--bg-raised)]"
        style={{ borderBottom: open ? '1px solid var(--border)' : 'none' }}>
        <div className="flex items-center gap-2.5">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${cfg.chip}`}>
            {subject.name}
          </span>
          <Badge variant={deptKey === 'SE' ? 'se' : 'cs'}>
            {total} group{total !== 1 ? 's' : ''}
          </Badge>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={springSnappy}>
          <Icon name="chevronDown" size={15} className="text-[var(--text-muted)]" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springSmooth}>
            <div className="p-4 space-y-3">
              {/* Groups grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visible.map(g => (
                  <GroupCard key={g.id} group={g}
                    members={membersMap[g.id] || []}
                    showJoin
                    joinLoading={joining === g.id}
                    onJoin={onJoin}
                    onClick={() => navigate('group-detail', g)} />
                ))}
              </div>

              {/* Show more / less */}
              {total > PREVIEW && (
                <button
                  onClick={() => setExpanded(e => !e)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[var(--bg-raised)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  style={{ border: '1px dashed var(--border)' }}>
                  {expanded
                    ? <><Icon name="chevronUp" size={13} /> Show less</>
                    : <><Icon name="chevronDown" size={13} /> {hidden} more group{hidden !== 1 ? 's' : ''}</>
                  }
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Dept block ────────────────────────────────────────────────────────────────
function DeptBlock({ deptData, joining, onJoin, navigate, membersMap }) {
  const cfg = DEPT_CFG[deptData.dept]
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={`h-5 w-1 rounded-full ${cfg.bar}`} />
        <h2 className="font-bold text-[var(--text-primary)]">{cfg.label}</h2>
        <Badge variant={deptData.dept === 'SE' ? 'se' : 'cs'}>
          {deptData.subjects.reduce((a, s) => a + s.groups.length, 0)}
        </Badge>
      </div>
      <div className="space-y-3">
        {deptData.subjects.map(subj => (
          <SubjectSection key={subj.id || 'general'}
            subject={subj}
            deptKey={deptData.dept}
            joining={joining}
            onJoin={onJoin}
            navigate={navigate}
            membersMap={membersMap} />
        ))}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BrowseGroups() {
  const { navigate }         = useApp()
  const { user }             = useAuth()
  const myDept               = user?.department

  const [groups,  setGrps]   = useState([])
  const [membersMap, setMap] = useState({})
  const [loading, setLoad]   = useState(true)
  const [query,   setQ]      = useState('')
  const [dept,    setDept]   = useState(myDept || 'all')
  const [status,  setStat]   = useState('all')
  const [joining, setJoin]   = useState(null)
  const [success, setOk]     = useState('')
  const [error,   setErr]    = useState('')

  const load = useCallback(() => {
    setLoad(true)
    const p = {}
    if (dept !== 'all')    p.dept   = dept
    if (status !== 'all')  p.status = status
    if (query.trim())      p.search = query.trim()
    groupsAPI.list(p)
      .then(async r => {
        const all = r.data.groups || []
        setGrps(all)
        // fetch members for all groups
        const results = await Promise.allSettled(
          all.map(g => groupsAPI.members(g.id).then(r => ({ id: g.id, members: r.data.members || [] })))
        )
        const map = {}
        results.forEach(r => { if (r.status === 'fulfilled') map[r.value.id] = r.value.members })
        setMap(map)
      })
      .catch(e => setErr(extractError(e)))
      .finally(() => setLoad(false))
  }, [dept, status, query])

  useEffect(() => { load() }, [dept, status])
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t) }, [query])

  const join = async id => {
    setJoin(id); setErr(''); setOk('')
    try { const r = await groupsAPI.sendRequest({ group_id: id }); setOk(r.data.message); load() }
    catch (e) { setErr(extractError(e)) }
    finally { setJoin(null) }
  }

  // Build grouped structure
  const isSearching = query.trim().length > 0
  const deptBlocks  = (!isSearching && dept === 'all')
    ? groupByDeptThenSubject(groups)
    : dept !== 'all'
      ? [{ dept, subjects: groupBySubject(groups) }]
      : null   // searching — flat grid

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Browse Groups</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Find and join study or project groups
          {myDept && <span className="text-indigo-600 dark:text-indigo-400"> · Your department shown first</span>}
        </p>
      </div>

      <Alert type="success" message={success} />
      <Alert type="error"   message={error} onClose={() => setErr('')} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input icon={<Icon name="search" size={15} />} placeholder="Search groups…"
            value={query} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl shrink-0"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
          {STABS.map(t => (
            <button key={t.k} onClick={() => setStat(t.k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${status === t.k
                  ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'}`}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* Dept tabs */}
      <div className="flex gap-2 flex-wrap">
        {DTABS.map(({ k, l }) => (
          <button key={k} onClick={() => setDept(k)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border
              ${dept === k
                ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-[var(--bg-surface)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/30'}`}>
            {l}
            {k !== 'all' && k === myDept &&
              <Badge variant={k === 'SE' ? 'se' : 'cs'} className="text-[9px] !px-1.5 !py-0">Mine</Badge>}
          </button>
        ))}
      </div>

      {!loading && (
        <p className="text-xs text-[var(--text-muted)]">
          {groups.length} group{groups.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : groups.length === 0 ? (
        <EmptyState iconName="search" title="No groups found"
          description={query ? `No results for "${query}"` : 'Try a different filter'}
          action={
            <Button variant="outline" size="sm" onClick={() => { setQ(''); setDept('all'); setStat('all') }}>
              Clear filters
            </Button>
          } />
      ) : isSearching ? (
        // Search results — flat grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map(g => (
            <GroupCard key={g.id} group={g}
              members={membersMap[g.id] || []}
              showJoin joinLoading={joining === g.id} onJoin={join}
              onClick={() => navigate('group-detail', g)} />
          ))}
        </div>
      ) : deptBlocks ? (
        // Subject-grouped view
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
          {deptBlocks.map((db, i) => (
            <motion.div key={db.dept} variants={fadeUp} custom={i}>
              <DeptBlock deptData={db} joining={joining} onJoin={join} navigate={navigate} membersMap={membersMap} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        // Single dept flat with subjects
        <div className="space-y-3">
          {groupBySubject(groups).map(subj => (
            <SubjectSection key={subj.id || 'general'}
              subject={subj}
              deptKey={dept}
              joining={joining}
              onJoin={join}
              navigate={navigate}
              membersMap={membersMap} />
          ))}
        </div>
      )}
    </div>
  )
}
