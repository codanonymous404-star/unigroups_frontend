import Icon from '../ui/Icons.jsx'

const DEPTS = [
  { value:'SE', label:'Software Engineering', icon:'monitor', active:'border-orange-400 bg-orange-50 dark:bg-orange-400/8', text:'text-orange-600 dark:text-orange-400' },
  { value:'CS', label:'Computer Science',     icon:'code2',   active:'border-cyan-400 bg-cyan-50 dark:bg-cyan-400/8',     text:'text-cyan-600 dark:text-cyan-400'     },
]

export default function DeptSelector({ value, onChange, locked=false, lockedDept }) {
  if (locked && lockedDept) {
    const d = DEPTS.find(x=>x.value===lockedDept)
    if (!d) return null
    return (
      <div>
        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Department</label>
        <div className={`flex items-center gap-4 p-4 rounded-xl border-2 ${d.active}`}>
          <Icon name={d.icon} size={22} className={d.text}/>
          <div className="flex-1"><p className={`text-sm font-bold ${d.text}`}>{d.label}</p><p className="text-xs text-[var(--text-muted)] mt-0.5">Auto-assigned</p></div>
          <Icon name="lock" size={14} className="text-[var(--text-faint)]"/>
        </div>
      </div>
    )
  }
  return (
    <div>
      <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
        Department <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 gap-3">
        {DEPTS.map(d=>(
          <button key={d.value} type="button" onClick={()=>onChange(d.value)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer
              ${value===d.value ? d.active : 'border-[var(--border)] hover:bg-[var(--bg-raised)] hover:border-[var(--border-strong)]'}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${value===d.value ? d.active : 'bg-[var(--bg-raised)]'}`}>
              <Icon name={d.icon} size={16} className={value===d.value ? d.text : 'text-[var(--text-muted)]'}/>
            </div>
            <span className={`text-sm font-semibold ${value===d.value ? d.text : 'text-[var(--text-secondary)]'}`}>{d.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
