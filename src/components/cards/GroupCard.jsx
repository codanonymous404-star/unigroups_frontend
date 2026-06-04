import { motion, AnimatePresence } from 'framer-motion'
import Icon    from '../ui/Icons.jsx'
import Badge   from '../ui/Badge.jsx'
import Button  from '../ui/Button.jsx'
import { spring, springSnappy, springSmooth } from '../../utils/animations.js'

const DEPT = {
  SE:{ label:'Software Engineering', gradient:'from-orange-500 to-amber-500',   chip:'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-400/10 dark:text-orange-400 dark:border-orange-400/20' },
  CS:{ label:'Computer Science',     gradient:'from-cyan-500 to-blue-500',       chip:'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-400/10 dark:text-cyan-400 dark:border-cyan-400/20'           },
}

// ── All members list ──────────────────────────────────────────────────────────
function MembersList({ members = [] }) {
  if (!members.length) return null
  return (
    <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
      <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-faint)] mb-1.5">Members</p>
      <div className="flex flex-wrap gap-1">
        {members.map((m, i) => {
          const u        = m.user || m
          const initials = u?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || '?'
          const isLeader = m.role === 'leader'
          return (
            <div key={u?.id || i}
              title={u?.name}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
              {/* Mini avatar */}
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0
                ${u?.department === 'CS'
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
                  : 'bg-gradient-to-br from-orange-500 to-amber-500'}`}>
                {initials}
              </div>
              <span className="text-[10px] font-medium text-[var(--text-secondary)] max-w-[70px] truncate">
                {isLeader && <span className="text-amber-400 mr-0.5">★</span>}
                {u?.name?.split(' ')[0]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function GroupCard({ group, onClick, showJoin = false, onJoin, compact = false, joinLoading = false, members = [] }) {
  const mc   = group.member_count ?? members.length ?? 0
  const full = mc >= group.max_members
  const isMine = !!group.my_role
  const d    = DEPT[group.department] || DEPT.SE
  const pct  = Math.round((mc / group.max_members) * 100)
  const memberList = members.length ? members : (group.members || [])

  // ── Compact mode ─────────────────────────────────────────────────────────
  if (compact) return (
    <motion.div variants={{ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } }}
      whileHover={{ x: 4, transition: springSnappy }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold text-white bg-gradient-to-br ${d.gradient}`}>
        {group.department}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <h3 className="font-bold text-xs text-[var(--text-primary)] truncate">{group.name}</h3>
          {group.my_role && <Badge variant={group.my_role} className="text-[9px]">{group.my_role}</Badge>}
        </div>
        <p className={`text-[10px] font-medium ${group.department === 'SE' ? 'text-orange-500' : 'text-cyan-500'}`}>
          {mc}/{group.max_members} members
        </p>
      </div>
      <Icon name="chevronRight" size={13} className="text-[var(--text-faint)] shrink-0" />
    </motion.div>
  )

  // ── Full card ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.005, transition: springSnappy }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group rounded-xl overflow-hidden cursor-pointer flex flex-col relative"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}>

      {/* Top color bar */}
      <div className={`h-0.5 w-full bg-gradient-to-r ${d.gradient}`} />

      <div className="p-3 flex flex-col gap-2.5 relative">

        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${d.chip}`}>
                {group.department}
              </span>
              {group.subject_name && (
                <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[120px]">· {group.subject_name}</span>
              )}
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)] leading-tight group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
              {group.name}
            </h3>
            {group.description && (
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 line-clamp-1">{group.description}</p>
            )}
          </div>
          <Badge variant={group.status} className="shrink-0 text-[9px]">
            {group.status === 'open'
              ? <><Icon name="unlock" size={8} /> Open</>
              : <><Icon name="lock" size={8} /> Locked</>}
          </Badge>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-[var(--text-muted)]">Members</span>
            <span className="text-[10px] font-bold text-[var(--text-primary)]">
              {mc}<span className="text-[var(--text-muted)] font-normal">/{group.max_members}</span>
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ ...springSmooth, delay: 0.1 }}
              className={`h-full rounded-full bg-gradient-to-r ${
                full ? 'from-red-500 to-red-400'
                : pct >= 75 ? 'from-amber-500 to-amber-400'
                : 'from-indigo-500 to-violet-500'}`} />
          </div>
          <p className="text-[9px] text-[var(--text-faint)] mt-0.5">
            {full ? 'Full' : `${group.max_members - mc} slot${group.max_members - mc !== 1 ? 's' : ''} left`}
          </p>
        </div>

        {/* ALL members shown */}
        {memberList.length > 0 && <MembersList members={memberList} />}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
          {isMine
            ? <Badge variant={group.my_role} className="text-[9px]">
                {group.my_role === 'leader' && <Icon name="crown" size={8} />}{group.my_role}
              </Badge>
            : <span className="text-[9px] text-[var(--text-faint)] flex items-center gap-1">
                <Icon name="calendar" size={9} />{group.created_at?.split('T')[0]}
              </span>
          }
          {showJoin && !isMine && !full && group.status === 'open' &&
            <Button variant="outline" size="sm" loading={joinLoading}
              onClick={e => { e.stopPropagation(); onJoin?.(group.id) }}
              className="text-[10px] py-1 px-2 h-6">
              Join
            </Button>}
          {showJoin && isMine     && <Badge variant="success" className="text-[9px]">Joined</Badge>}
          {showJoin && !isMine && full && <Badge variant="default" className="text-[9px]">Full</Badge>}
          {showJoin && !isMine && group.status === 'locked' && !full && <Badge variant="locked" className="text-[9px]">Locked</Badge>}
        </div>
      </div>
    </motion.div>
  )
}
