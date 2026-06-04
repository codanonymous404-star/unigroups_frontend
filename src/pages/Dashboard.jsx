import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../components/ui/Icons.jsx'
import { useEffect, useState } from 'react'
import { useAuth }   from '../context/AuthContext.jsx'
import { useApp }    from '../context/AppContext.jsx'
import { groupsAPI } from '../api/groups.js'
import GroupCard     from '../components/cards/GroupCard.jsx'
import Button        from '../components/ui/Button.jsx'
import Badge         from '../components/ui/Badge.jsx'
import { Skeleton, EmptyState } from '../components/ui/misc.jsx'
import { fadeUp, staggerContainer, springSmooth, springSnappy } from '../utils/animations.js'

const DEPT = {
  SE: { label: 'Software Engineering', bar: 'bg-orange-400', badge: 'se', color: 'text-orange-500 dark:text-orange-400', glow: 'rgba(249,115,22,0.06)' },
  CS: { label: 'Computer Science',     bar: 'bg-cyan-400',   badge: 'cs', color: 'text-cyan-500 dark:text-cyan-400',     glow: 'rgba(6,182,212,0.06)'  },
}

function StatBox({ label, value, icon }) {
  return (
    <motion.div variants={fadeUp} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5">
      <div className="mb-2 text-indigo-600 dark:text-indigo-400"><Icon name={icon} size={22} /></div>
      <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="text-xs font-medium text-[var(--text-muted)] mt-1">{label}</p>
    </motion.div>
  )
}

// ── Subject section inside a dept ────────────────────────────────────────────
const PREVIEW = 2

function SubjectSection({ subject, navigate, membersMap, deptKey }) {
  const [open,     setOpen]     = useState(true)
  const [expanded, setExpanded] = useState(false)
  const cfg    = DEPT[deptKey]
  const groups = subject.groups || []
  const total  = groups.length
  const visible = expanded ? groups : groups.slice(0, PREVIEW)
  const hidden  = total - PREVIEW

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-[var(--bg-raised)]"
        style={{ borderBottom: open ? '1px solid var(--border)' : 'none' }}>
        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
            deptKey === 'SE'
              ? 'bg-orange-50 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-400/20'
              : 'bg-cyan-50 dark:bg-cyan-400/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-400/20'
          }`}>
            {subject.name}
          </div>
          <Badge variant={deptKey === 'SE' ? 'se' : 'cs'}>{total} group{total !== 1 ? 's' : ''}</Badge>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visible.map(g => (
                  <GroupCard key={g.id} group={g}
                    members={membersMap[g.id] || []}
                    onClick={() => navigate('group-detail', g)} />
                ))}
              </div>
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

// ── Dept section ─────────────────────────────────────────────────────────────
function DeptSection({ dept, data, navigate, membersMap }) {
  const cfg       = DEPT[dept]
  const groups    = data?.groups || []
  const bySubject = data?.by_subject || []

  return (
    <section>
      {/* Dept header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`h-5 w-1 rounded-full ${cfg.bar}`} />
          <h2 className="font-bold text-[var(--text-primary)]">{cfg.label}</h2>
          <Badge variant={cfg.badge}>{groups.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('browse-groups')}
          className="text-indigo-600 dark:text-indigo-400">
          View all <Icon name="arrowRight" size={13} />
        </Button>
      </div>

      {groups.length === 0 ? (
        <EmptyState iconName={dept === 'SE' ? 'monitor' : 'code2'} title={`No ${cfg.label} groups`}
          action={<Button variant="outline" size="sm" onClick={() => navigate('create-group')}><Icon name="plus" size={13} /> Create one</Button>} />
      ) : bySubject.length > 0 ? (
        // Subject-grouped view
        <div className="space-y-3">
          {bySubject.map((subj, i) => (
            <motion.div key={subj.id || 'general'} variants={fadeUp} custom={i}>
              <SubjectSection subject={subj} navigate={navigate} membersMap={membersMap} deptKey={dept} />
            </motion.div>
          ))}
        </div>
      ) : (
        // Fallback flat grid
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.slice(0, 4).map(g => (
            <GroupCard key={g.id} group={g}
              members={membersMap[g.id] || []}
              onClick={() => navigate('group-detail', g)} />
          ))}
        </div>
      )}
    </section>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user }             = useAuth()
  const { navigate }         = useApp()
  const [byDept, setByDept]  = useState({ SE: { groups: [], by_subject: [] }, CS: { groups: [], by_subject: [] } })
  const [all,    setAll]     = useState([])
  const [mine,   setMine]    = useState([])
  const [membersMap, setMap] = useState({})
  const [loading, setLoad]   = useState(true)

  useEffect(() => {
    Promise.all([groupsAPI.list(), groupsAPI.myGroups()])
      .then(async ([a, m]) => {
        const allGroups = a.data.groups || []
        const myGroups  = m.data.groups || []
        setAll(allGroups)
        setByDept(a.data.by_department || { SE: { groups: [], by_subject: [] }, CS: { groups: [], by_subject: [] } })
        setMine(myGroups)

        // Fetch members for all visible groups
        const ids = [...new Set(allGroups.map(g => g.id))]
        const results = await Promise.allSettled(
          ids.map(id => groupsAPI.members(id).then(r => ({ id, members: r.data.members || [] })))
        )
        const map = {}
        results.forEach(r => { if (r.status === 'fulfilled') map[r.value.id] = r.value.members })
        setMap(map)
      })
      .catch(console.error)
      .finally(() => setLoad(false))
  }, [])

  const open   = all.filter(g => g.status === 'open').length
  const myDept = user?.department

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-1">Welcome back</p>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">{user?.name}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{user?.roll_number}</span>
            {myDept && <Badge variant={myDept === 'SE' ? 'se' : 'cs'}>{myDept === 'SE' ? 'Software Engineering' : 'Computer Science'}</Badge>}
          </div>
        </div>
        <Button onClick={() => navigate('create-group')}><Icon name="plus" size={15} /> New Group</Button>
      </div>

      {loading ? (
        /* Unified Loading Skeletons */
        <div className="space-y-10">
          {/* Stats Skeletons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          
          {/* Quick Actions Skeleton */}
          <div className="space-y-3">
            <div className="h-4 w-28 bg-[var(--border)] rounded animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          </div>

          {/* Groups Skeletons */}
          <div className="space-y-6">
            <div className="h-6 w-48 bg-[var(--border)] rounded animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-40" />)}
            </div>
          </div>
        </div>
      ) : (
        /* Loaded Content with Staggered Entrance Animation */
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-10">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatBox label="Total Groups" value={all.length}        icon="layers" />
            <StatBox label="My Groups"    value={mine.length}       icon="users" />
            <StatBox label="Open Groups"  value={open}              icon="unlock" />
            <StatBox label="Locked"       value={all.length - open} icon="lock" />
          </div>

          {/* Quick actions */}
          <motion.div variants={fadeUp}>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">Quick Actions</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: 'plus',   label: 'Create Group',  desc: 'Start a new team',       page: 'create-group'  },
                { icon: 'search', label: 'Browse Groups', desc: 'Find groups to join',     page: 'browse-groups' },
                { icon: 'users',  label: 'My Groups',     desc: 'View your memberships',   page: 'my-groups'     },
              ].map(a => (
                <motion.button key={a.page} onClick={() => navigate(a.page)}
                  whileHover={{ x: 4, scale: 1.01, borderColor: 'rgba(99,102,241,0.4)', boxShadow: '0 8px 30px rgba(99,102,241,0.08)', transition: { type: 'spring', stiffness: 500, damping: 28 } }}
                  whileTap={{ scale: 0.97, transition: { type: 'spring', stiffness: 600, damping: 30 } }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] transition-colors group text-left">
                  <motion.div whileHover={{ scale: 1.12, rotate: [-3, 3, -3, 0], transition: { duration: 0.3 } }}
                    className="w-11 h-11 rounded-xl bg-[var(--bg-raised)] group-hover:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 transition-colors">
                    <Icon name={a.icon} size={18} />
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{a.label}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{a.desc}</p>
                  </div>
                  <motion.div whileHover={{ x: 3 }} transition={{ type: 'spring', stiffness: 500 }}>
                    <Icon name="arrowRight" size={15} className="text-[var(--text-faint)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
                  </motion.div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Groups by dept → subject */}
          <motion.div variants={fadeUp} className="space-y-12">
            {myDept !== 'CS'
              ? <><DeptSection dept="SE" data={byDept.SE} navigate={navigate} membersMap={membersMap} />
                  <DeptSection dept="CS" data={byDept.CS} navigate={navigate} membersMap={membersMap} /></>
              : <><DeptSection dept="CS" data={byDept.CS} navigate={navigate} membersMap={membersMap} />
                  <DeptSection dept="SE" data={byDept.SE} navigate={navigate} membersMap={membersMap} /></>
            }
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
