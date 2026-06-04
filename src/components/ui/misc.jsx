import Icon from './Icons.jsx'

// Avatar
export function Avatar({ initials='?', dept, size='md', className='' }) {
  const s = { xs:'w-6 h-6 text-[9px]', sm:'w-8 h-8 text-xs', md:'w-10 h-10 text-sm', lg:'w-12 h-12 text-base', xl:'w-16 h-16 text-xl' }
  const d = {
    SE: 'bg-orange-100 text-orange-600 ring-1 ring-orange-200 dark:bg-orange-400/15 dark:text-orange-400 dark:ring-orange-400/20',
    CS: 'bg-cyan-100 text-cyan-600 ring-1 ring-cyan-200 dark:bg-cyan-400/15 dark:text-cyan-400 dark:ring-cyan-400/20',
  }
  const useHijab = localStorage.getItem('use_hijab_avatar') === 'true';

  return (
    <div className={`${s[size]||s.md} rounded-xl flex items-center justify-center font-bold font-mono tracking-wide shrink-0 ${d[dept]||'bg-indigo-100 text-indigo-600 ring-1 ring-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:ring-indigo-500/20'} ${className} overflow-hidden`}>
      {useHijab ? (
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Hijab outer drape */}
          <path d="M50 10 C22 10 15 28 15 50 C15 72 24 90 50 90 C76 90 85 72 85 50 C85 28 78 10 50 10 Z" fill="#1e1e24" />
          {/* Hijab inner wrap */}
          <path d="M50 16 C30 16 23 28 23 50 C23 68 30 82 50 82 C70 82 77 68 77 50 C77 28 70 16 50 16 Z" fill="#2d2d38" />
          {/* Face cutout */}
          <path d="M50 25 C41 25 36 32 36 46 C36 53 40 59 50 59 C60 59 64 53 64 46 C64 32 59 25 50 25 Z" fill="#ffdfba" />
          {/* Closed/Modest Eyes */}
          <path d="M42 38 C44 39 46 39 48 38" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M52 38 C54 39 56 39 58 38" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
          {/* Burqa/Niqab covering */}
          <path d="M36 44 C36 52 40 59 50 59 C60 59 64 52 64 44 L68 85 H32 Z" fill="#1e1e24" />
        </svg>
      ) : (
        String(initials).slice(0,2).toUpperCase()
      )}
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
