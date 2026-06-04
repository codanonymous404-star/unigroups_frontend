import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { groupsAPI }  from '../api/groups.js'
import { useApp }     from '../context/AppContext.jsx'
import Icon           from '../components/ui/Icons.jsx'
import Badge          from '../components/ui/Badge.jsx'
import Button         from '../components/ui/Button.jsx'
import { Avatar, Skeleton, EmptyState } from '../components/ui/misc.jsx'
import { generateDeptPDF } from '../utils/pdfExport.js'
import { extractError } from '../hooks/useApi.js'
import { spring } from '../utils/animations.js'

const DEPT = {
  SE: { label:'Software Engineering', bar:'bg-orange-400', accent:'text-orange-600 dark:text-orange-400', chip:'bg-orange-50 border-orange-200 dark:bg-orange-400/10 dark:border-orange-400/20' },
  CS: { label:'Computer Science',     bar:'bg-cyan-400',   accent:'text-cyan-600 dark:text-cyan-400',     chip:'bg-cyan-50 border-cyan-200 dark:bg-cyan-400/10 dark:border-cyan-400/20'     },
}

function StatPill({ icon, value, label, color = 'text-indigo-600 dark:text-indigo-400' }) {
  return (
    <div className="flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl px-5 py-4">
      <div className={`w-9 h-9 rounded-xl bg-[var(--bg-raised)] flex items-center justify-center ${color}`}>
        <Icon name={icon} size={16} />
      </div>
      <div>
        <p className="text-xl font-bold text-[var(--text-primary)] leading-none">{value}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function MemberChip({ member }) {
  const initials = member.user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || '??'
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border)]">
      <Avatar initials={initials} dept={member.user?.department} size="xs" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[90px]">{member.user?.name?.split(' ')[0]}</p>
        {member.role === 'leader' && (
          <div className="flex items-center gap-0.5">
            <Icon name="crown" size={8} className="text-amber-500" />
            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">Leader</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({ count, onConfirm, onClose, loading }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={spring}
        className="w-full max-w-sm rounded-2xl shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid rgba(239,68,68,0.3)' }}>
        <div className="p-5 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <Icon name="x" size={22} className="text-red-500" />
          </div>
          <div>
            <h2 className="font-bold text-base text-[var(--text-primary)]">Delete {count} Group{count !== 1 ? 's' : ''}?</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              This will permanently delete <span className="font-bold text-red-500">{count} group{count !== 1 ? 's' : ''}</span> and all their members. This cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="danger" loading={loading} fullWidth onClick={onConfirm}>
              Delete {count} Group{count !== 1 ? 's' : ''}
            </Button>
            <Button variant="secondary" onClick={onClose} className="shrink-0">Cancel</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function GroupRow({ group, selected, onToggle, onView }) {
  const mc   = group.member_count ?? group.members?.length ?? 0
  const full = mc >= group.max_members
  const d    = DEPT[group.department] || DEPT.SE
  const pct  = Math.round((mc / group.max_members) * 100)

  return (
    <div className={`bg-[var(--bg-surface)] border-2 rounded-2xl overflow-hidden transition-all duration-150
      ${selected
        ? 'border-indigo-500 dark:border-indigo-400 shadow-lg shadow-indigo-500/10'
        : 'border-[var(--border)] hover:border-indigo-400/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5'}`}>
      <div className={`h-0.5 w-full ${d.bar}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button type="button" onClick={() => onToggle(group.id)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
                ${selected
                  ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500'
                  : 'border-[var(--border-strong)] hover:border-indigo-400'}`}>
              {selected && <Icon name="check" size={10} className="text-white" strokeWidth={3} />}
            </button>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm text-[var(--text-primary)] truncate leading-snug">{group.name}</h3>
              <span className={`text-[10px] font-semibold ${d.accent}`}>{d.label}</span>
              {group.subject_name && <span className="text-[10px] text-[var(--text-muted)]"> · {group.subject_name}</span>}
            </div>
          </div>
          <Badge variant={group.status}>
            {group.status === 'open' ? <Icon name="unlock" size={8} /> : <Icon name="lock" size={8} />}
            {group.status}
          </Badge>
        </div>

        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-[var(--text-muted)] font-medium">Members</span>
            <span className="text-[10px] font-bold text-[var(--text-primary)]">
              {mc}<span className="text-[var(--text-muted)] font-normal">/{group.max_members}</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-raised)] overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${full ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-indigo-500'}`}
              style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] text-[var(--text-faint)] mt-0.5">
            {full ? 'Full' : `${group.max_members - mc} slot${group.max_members - mc !== 1 ? 's' : ''} left`}
          </p>
        </div>

        {group.members?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {group.members.slice(0, 3).map((m, i) => <MemberChip key={i} member={m} />)}
            {group.members.length > 3 && (
              <div className="flex items-center px-2.5 py-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border)]">
                <span className="text-xs text-[var(--text-muted)] font-medium">+{group.members.length - 3}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <span className="text-[10px] text-[var(--text-faint)] flex items-center gap-1">
            <Icon name="calendar" size={9} />
            {group.created_at?.split('T')[0]}
          </span>
          <Button variant="ghost" size="xs" onClick={() => onView(group)}
            className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-[11px]">
            View <Icon name="chevronRight" size={11} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AdminGroups() {
  const { navigate }              = useApp()
  const [groups,   setGroups]     = useState([])
  const [loading,  setLoading]    = useState(true)
  const [search,   setSearch]     = useState('')
  const [deptFilter, setDept]     = useState('all')
  const [statusFilter, setStatus] = useState('all')
  const [sortBy,   setSort]       = useState('newest')
  const [selected, setSelected]   = useState(new Set())
  const [showDel,  setShowDel]    = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [error,    setError]      = useState('')
  const [ok,       setOk]         = useState('')

  const loadGroups = async () => {
    setLoading(true)
    try {
      const r = await groupsAPI.list()
      const gs = r.data.groups || []
      const withMembers = await Promise.all(gs.map(async g => {
        try { const mr = await groupsAPI.members(g.id); return { ...g, members: mr.data.members || [] } }
        catch { return { ...g, members: [] } }
      }))
      setGroups(withMembers)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadGroups() }, [])

  const filtered = groups
    .filter(g => {
      if (deptFilter !== 'all' && g.department !== deptFilter) return false
      if (statusFilter !== 'all' && g.status !== statusFilter) return false
      if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'newest')  return new Date(b.created_at) - new Date(a.created_at)
      if (sortBy === 'oldest')  return new Date(a.created_at) - new Date(b.created_at)
      if (sortBy === 'members') return (b.member_count ?? 0) - (a.member_count ?? 0)
      if (sortBy === 'name')    return a.name.localeCompare(b.name)
      return 0
    })

  const toggleOne = id => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const selectAllDept = dept => {
    const ids = filtered.filter(g => g.department === dept).map(g => g.id)
    const allSel = ids.every(id => selected.has(id))
    setSelected(prev => { const n = new Set(prev); if (allSel) ids.forEach(id => n.delete(id)); else ids.forEach(id => n.add(id)); return n })
  }
  const selectAll = () => {
    const ids = filtered.map(g => g.id)
    const allSel = ids.every(id => selected.has(id))
    setSelected(allSel ? new Set() : new Set(ids))
  }

  const downloadPDF = dept => {
    const sel = groups.filter(g => selected.has(g.id) && (dept ? g.department === dept : true))
    if (!sel.length) return
    generateDeptPDF(sel, dept)
  }

  // ── Bulk delete ──────────────────────────────────────────────────────────
  const bulkDelete = async () => {
    setDeleting(true); setError('')
    try {
      const ids = [...selected]
      await Promise.all(ids.map(id => groupsAPI.delete(id)))
      setOk(`${ids.length} group${ids.length !== 1 ? 's' : ''} deleted.`)
      setSelected(new Set())
      setShowDel(false)
      await loadGroups()
    } catch (e) { setError(extractError(e)) }
    finally { setDeleting(false) }
  }

  const selectedCount = selected.size
  const seSelected    = filtered.filter(g => g.department === 'SE' && selected.has(g.id)).length
  const csSelected    = filtered.filter(g => g.department === 'CS' && selected.has(g.id)).length
  const totalMembers  = groups.reduce((s, g) => s + (g.member_count ?? 0), 0)
  const seGroups      = groups.filter(g => g.department === 'SE').length
  const csGroups      = groups.filter(g => g.department === 'CS').length

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showDel && (
          <DeleteConfirmModal
            count={selectedCount}
            loading={deleting}
            onConfirm={bulkDelete}
            onClose={() => setShowDel(false)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon name="shieldCheck" size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">All Groups</h1>
            <Badge variant="admin">Admin</Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Select groups to download PDF or bulk delete</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('admin-users')}>
          <Icon name="users" size={14} /> Manage Students
        </Button>
      </div>

      {/* Alerts */}
      {ok && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-green-600 dark:text-green-400"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <Icon name="checkCircle" size={15} /> {ok}
          <button onClick={() => setOk('')} className="ml-auto"><Icon name="x" size={13} /></button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-500"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <Icon name="x" size={15} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><Icon name="x" size={13} /></button>
        </div>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatPill icon="users"    value={groups.length} label="Total Groups"  color="text-indigo-600 dark:text-indigo-400" />
          <StatPill icon="userPlus" value={totalMembers}  label="Total Members" color="text-green-600 dark:text-green-400" />
          <StatPill icon="monitor"  value={seGroups}      label="SE Groups"     color="text-orange-600 dark:text-orange-400" />
          <StatPill icon="code2"    value={csGroups}      label="CS Groups"     color="text-cyan-600 dark:text-cyan-400" />
        </div>
      )}

      {/* Action bar — shown when selected */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl flex-wrap"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
              <Icon name="check" size={12} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-sm font-bold text-[var(--text-primary)]">
              {selectedCount} group{selectedCount !== 1 ? 's' : ''} selected
            </span>
            {seSelected > 0 && <Badge variant="se">{seSelected} SE</Badge>}
            {csSelected > 0 && <Badge variant="cs">{csSelected} CS</Badge>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* PDF downloads */}
            {seSelected > 0 && (
              <Button variant="secondary" size="sm" onClick={() => downloadPDF('SE')}>
                <Icon name="fileText" size={13} /> SE PDF
              </Button>
            )}
            {csSelected > 0 && (
              <Button variant="secondary" size="sm" onClick={() => downloadPDF('CS')}>
                <Icon name="fileText" size={13} /> CS PDF
              </Button>
            )}
            {selectedCount > 1 && seSelected > 0 && csSelected > 0 && (
              <Button variant="secondary" size="sm" onClick={() => downloadPDF(null)}>
                <Icon name="fileText" size={13} /> All PDF
              </Button>
            )}

            {/* Divider */}
            <div className="w-px h-5 bg-[var(--border)]" />

            {/* Bulk delete */}
            <Button variant="danger" size="sm" onClick={() => setShowDel(true)}>
              <Icon name="x" size={13} /> Delete {selectedCount}
            </Button>

            <button onClick={() => setSelected(new Set())}
              className="text-xs text-[var(--text-muted)] font-semibold hover:text-[var(--text-primary)] transition-colors">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="text" placeholder="Search groups…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-faint)] rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
        </div>
        <div className="flex gap-1.5">
          {[{ v: 'all', l: 'All' }, { v: 'SE', l: 'SE' }, { v: 'CS', l: 'CS' }].map(({ v, l }) => (
            <button key={v} onClick={() => setDept(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                ${deptFilter === v ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600' : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-strong)]'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {[{ v: 'all', l: 'All' }, { v: 'open', l: 'Open' }, { v: 'locked', l: 'Locked' }].map(({ v, l }) => (
            <button key={v} onClick={() => setStatus(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                ${statusFilter === v ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600' : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-strong)]'}`}>
              {l}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSort(e.target.value)}
          className="px-3 py-2 text-xs font-semibold bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-secondary)] rounded-xl outline-none focus:border-indigo-500 transition-all cursor-pointer">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="members">Most Members</option>
          <option value="name">A–Z</option>
        </select>
        <span className="text-xs text-[var(--text-muted)] ml-auto">
          <span className="font-bold text-[var(--text-primary)]">{filtered.length}</span> groups
        </span>
      </div>

      {/* Quick select */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[var(--text-muted)] font-medium">Quick select:</span>
          <button onClick={selectAll}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
            {filtered.every(g => selected.has(g.id)) ? 'Deselect All' : 'Select All'}
          </button>
          {['SE', 'CS'].map(d => {
            const dg = filtered.filter(g => g.department === d)
            if (!dg.length) return null
            const allSel = dg.every(g => selected.has(g.id))
            return (
              <button key={d} onClick={() => selectAllDept(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                  ${d === 'SE'
                    ? 'border-orange-200 dark:border-orange-400/25 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-400/8 hover:bg-orange-100'
                    : 'border-cyan-200 dark:border-cyan-400/25 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-400/8 hover:bg-cyan-100'}`}>
                {allSel ? `Deselect ${d}` : `Select ${d}`} ({dg.length})
              </button>
            )
          })}
        </div>
      )}

      {/* Groups grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-52" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState iconName="fileText" title="No groups found" description="Try changing your filters" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g, i) => (
            <GroupRow key={g.id} group={g} index={i}
              selected={selected.has(g.id)}
              onToggle={toggleOne}
              onView={group => navigate('group-detail', group)} />
          ))}
        </div>
      )}
    </div>
  )
}
