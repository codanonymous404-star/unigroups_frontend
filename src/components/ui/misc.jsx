import Icon from './Icons.jsx'

// Avatar
export function Avatar({ initials='?', dept, size='md', className='' }) {
  const s = { xs:'w-6 h-6 text-[9px]', sm:'w-8 h-8 text-xs', md:'w-10 h-10 text-sm', lg:'w-12 h-12 text-base', xl:'w-16 h-16 text-xl' }
  const d = {
    SE: 'bg-orange-100 text-orange-600 ring-1 ring-orange-200 dark:bg-orange-400/15 dark:text-orange-400 dark:ring-orange-400/20',
    CS: 'bg-cyan-100 text-cyan-600 ring-1 ring-cyan-200 dark:bg-cyan-400/15 dark:text-cyan-400 dark:ring-cyan-400/20',
  }

  return (
    <div className={`${s[size]||s.md} rounded-xl flex items-center justify-center font-bold font-mono tracking-wide shrink-0 ${d[dept]||'bg-indigo-100 text-indigo-600 ring-1 ring-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:ring-indigo-500/20'} ${className}`}>
      {String(initials).slice(0,2).toUpperCase()}
    </div>
  )
}

// EmptyState — no emoji, pure SVG icons
export function EmptyState({ iconName='search', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-raised)] border border-[var(--border)] flex items-center justify-center mb-4 text-[var(--text-muted)]">
        <Icon name={iconName} size={28}/>
      </div>
      <p className="font-semibold text-[var(--text-primary)]">{title}</p>
      {description && <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// Progress
export function Progress({ current, max, showLabel=true }) {
  const pct = Math.round((current/max)*100)
  const full = current >= max
  return (
    <div>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-[var(--text-muted)]">Members</span>
          <span className="text-xs font-bold text-[var(--text-primary)]">{current}<span className="text-[var(--text-muted)] font-normal">/{max}</span></span>
        </div>
      )}
      <div className="h-1.5 rounded-full bg-[var(--bg-raised)] overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${full ? 'bg-red-500' : 'bg-indigo-500'}`} style={{width:`${pct}%`}}/>
      </div>
      <p className="text-xs text-[var(--text-faint)] mt-1">
        {full ? 'Full — no slots remaining' : `${max-current} slot${max-current!==1?'s':''} remaining`}
      </p>
    </div>
  )
}

// Skeleton
export function Skeleton({ className='' }) {
  return <div className={`rounded-2xl bg-[var(--bg-raised)] animate-pulse ${className}`}/>
}

export default Avatar
