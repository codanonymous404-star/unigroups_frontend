import Icon from '../ui/Icons.jsx'
import { Avatar } from '../ui/misc.jsx'

export default function MemberPicker({ people=[], selected=[], onToggle, loading }) {
  if (loading) return (
    <div className="rounded-xl border border-[var(--border)] py-8 text-center">
      <p className="text-xs text-[var(--text-muted)]">Loading students…</p>
    </div>
  )
  if (!people.length) return (
    <div className="rounded-xl border-2 border-dashed border-[var(--border)] py-8 text-center">
      <p className="text-sm text-[var(--text-secondary)]">No classmates found.</p>
      <p className="text-xs text-[var(--text-muted)] mt-1">Ask admin to add students first.</p>
    </div>
  )
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Select Members</label>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{selected.length} selected</span>
      </div>
      <div className="rounded-xl border border-[var(--border)] max-h-52 overflow-y-auto bg-[var(--bg-base)]">
        {people.map(p => {
          const is = selected.includes(p.id)
          return (
            <button key={p.id} type="button" onClick={()=>onToggle(p.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[var(--border)] last:border-0 transition-all ${is ? 'bg-indigo-50 dark:bg-indigo-500/8' : 'hover:bg-[var(--bg-raised)]'}`}>
              <Avatar initials={p.name.split(' ').map(w=>w[0]).join('').slice(0,2)} dept={p.department} size="sm"/>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                <p className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400/70">{p.roll_number}</p>
              </div>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${is ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500' : 'border-[var(--border-strong)]'}`}>
                {is && <Icon name="check" size={10} className="text-white" strokeWidth={3}/>}
              </div>
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {people.filter(p=>selected.includes(p.id)).map(p=>(
            <span key={p.id} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg px-2.5 py-1">
              {p.name.split(' ')[0]}
              <button type="button" onClick={()=>onToggle(p.id)} className="opacity-60 hover:opacity-100"><Icon name="x" size={10}/></button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
