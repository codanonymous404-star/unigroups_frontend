import { motion, AnimatePresence } from 'framer-motion'
import Icon    from '../ui/Icons.jsx'
import Badge   from '../ui/Badge.jsx'
import Button  from '../ui/Button.jsx'
import { Avatar, Progress } from '../ui/misc.jsx'
import { spring, springSnappy, springSmooth, springBouncy, springInstant, fadeUp } from '../../utils/animations.js'

const DEPT = {
  SE:{ label:'Software Engineering', gradient:'from-orange-500 to-amber-500',   chip:'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-400/10 dark:text-orange-400 dark:border-orange-400/20' },
  CS:{ label:'Computer Science',     gradient:'from-cyan-500 to-blue-500',       chip:'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-400/10 dark:text-cyan-400 dark:border-cyan-400/20'           },
}

// ── Inline member avatars row ─────────────────────────────────────────────────
function MemberAvatars({ members = [], maxShow = 4 }) {
  if (!members.length) return null
  const show    = members.slice(0, maxShow)
  const hidden  = members.length - show.length
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {show.map((m, i) => {
          const u        = m.user || m
          const initials = u?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || '?'
          const isLeader = m.role === 'leader'
          return (
            <div key={u?.id || i} className="relative" style={{ zIndex: show.length - i }}>
              <div title={`${u?.name}${isLeader ? ' (Leader)' : ''}`}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-[var(--bg-surface)]
                  ${u?.department === 'CS'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
                    : 'bg-gradient-to-br from-orange-500 to-amber-500'}`}>
                {initials}
                {isLeader && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center" style={{ zIndex: 10 }}>
                    <Icon name="crown" size={7} className="text-white" />
                  </span>
                )}
              </div>
            </div>
          )
        })}
        {hidden > 0 && (
          <div className="w-7 h-7 rounded-full bg-[var(--bg-raised)] border-2 border-[var(--border)] flex items-center justify-center text-[9px] font-bold text-[var(--text-muted)]"
            style={{ zIndex: 0 }}>
            +{hidden}
          </div>
        )}
      </div>
      <div className="flex flex-col">
        {members.slice(0, 2).map((m, i) => {
          const u = m.user || m
          return (
            <span key={i} className="text-[10px] text-[var(--text-muted)] leading-tight truncate max-w-[100px]">
              {m.role === 'leader' ? <span className="text-amber-500">★ </span> : ''}{u?.name?.split(' ')[0]}
            </span>
          )
        })}
        {members.length > 2 && (
          <span className="text-[10px] text-[var(--text-faint)]">+{members.length - 2} more</span>
        )}
      </div>
    </div>
  )
}

export default function GroupCard({ group, onClick, showJoin = false, onJoin, compact = false, joinLoading = false, members = [] }) {
  const mc   = group.member_count ?? group.members?.length ?? members.length ?? 0
  const full = mc >= group.max_members
  const isMine = !!group.my_role
  const d    = DEPT[group.department] || DEPT.SE
  const pct  = Math.round((mc / group.max_members) * 100)

  // Merge members from prop or group.members
  const memberList = members.length ? members : (group.members || [])

  if (compact) return (
    <motion.div variants={fadeUp}
      whileHover={{ x: 4, transition: springSnappy }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer transition-all"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold text-white bg-gradient-to-br ${d.gradient} shadow-lg`}>
        {group.department}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <h3 className="font-bold text-sm text-[var(--text-primary)] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{group.name}</h3>
          {group.my_role && <Badge variant={group.my_role}>{group.my_role === 'leader' && <Icon name="crown" size={9} />}{group.my_role}</Badge>}
          <Badge variant={group.status}>{group.status === 'open' ? <Icon name="unlock" size={9} /> : <Icon name="lock" size={9} />}{group.status}</Badge>
        </div>
        <p className={`text-xs font-medium ${group.department === 'SE' ? 'text-orange-600 dark:text-orange-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
          {d.label} · {mc}/{group.max_members}
        </p>
      </div>
      <Icon name="chevronRight" size={15} className="text-[var(--text-faint)] group-hover:text-[var(--text-muted)] transition-colors shrink-0" />
    </motion.div>
  )

  return (
    <motion.div variants={fadeUp}
      whileHover={{ y: -6, scale: 1.01, transition: springSnappy }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group rounded-2xl overflow-hidden cursor-pointer flex flex-col relative"
      style={{
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}>

      {/* Gradient top bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${d.gradient}`} />

      {/* Hover glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
        style={{
          background: group.department === 'SE'
            ? 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.05), transparent 60%)'
            : 'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.05), transparent 60%)',
        }} />

      <div className="p-5 flex flex-col gap-4 relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-lg border ${d.chip}`}>
                {group.department}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-medium">{d.label}</span>
              {group.subject_name && (
                <span className="text-[11px] text-[var(--text-muted)] font-medium truncate">· {group.subject_name}</span>
              )}
            </div>
            <h3 className="font-bold text-base text-[var(--text-primary)] leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {group.name}
            </h3>
            {group.description && <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">{group.description}</p>}
          </div>
          <Badge variant={group.status}>
            {group.status === 'open' ? <Icon name="unlock" size={9} /> : <Icon name="lock" size={9} />}
            {group.status === 'open' ? 'Open' : 'Locked'}
          </Badge>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-[var(--text-muted)]">Members</span>
            <span className="text-xs font-bold text-[var(--text-primary)]">{mc}<span className="text-[var(--text-muted)] font-normal">/{group.max_members}</span></span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ ...springSmooth, delay: 0.2 }}
              className={`h-full rounded-full bg-gradient-to-r ${full ? 'from-red-500 to-red-400' : pct >= 75 ? 'from-amber-500 to-amber-400' : 'from-indigo-500 to-violet-500'}`} />
          </div>
          <p className="text-xs text-[var(--text-faint)] mt-1">
            {full ? 'Full — no slots remaining' : `${group.max_members - mc} slot${group.max_members - mc !== 1 ? 's' : ''} remaining`}
          </p>
        </div>

        {/* ── Members inline (shown when members are loaded) ── */}
        {memberList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="pt-1" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)] mb-2">Members</p>
            <MemberAvatars members={memberList} maxShow={4} />
          </motion.div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
          {isMine
            ? <Badge variant={group.my_role}>{group.my_role === 'leader' && <Icon name="crown" size={9} />}{group.my_role}</Badge>
            : <span className="text-[11px] text-[var(--text-faint)] flex items-center gap-1"><Icon name="calendar" size={10} />{group.created_at?.split('T')[0]}</span>
          }
          {showJoin && !isMine && !full && group.status === 'open' &&
            <Button variant="outline" size="sm" loading={joinLoading} onClick={e => { e.stopPropagation(); onJoin?.(group.id) }}>
              Request to Join
            </Button>}
          {showJoin && isMine && <Badge variant="success">Joined</Badge>}
          {showJoin && !isMine && full && <Badge variant="default">Full</Badge>}
          {showJoin && !isMine && group.status === 'locked' && !full && <Badge variant="locked">Locked</Badge>}
        </div>
      </div>
    </motion.div>
  )
}
