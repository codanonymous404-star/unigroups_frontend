export default function Progress({ current, max, showLabel=true }) {
  const pct = Math.round((current/max)*100); const full = current>=max
  return (
    <div>
      {showLabel && <div className="flex justify-between items-center mb-1.5"><span className="text-xs font-medium text-slate-500">Members</span><span className="text-xs font-bold text-slate-200">{current}<span className="text-slate-500 font-normal">/{max}</span></span></div>}
      <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ${full?'bg-red-500':'bg-indigo-500'}`} style={{width:`${pct}%`}}/></div>
      <p className="text-xs text-slate-600 mt-1">{full?'Full — no slots remaining':`${max-current} slot${max-current!==1?'s':''} remaining`}</p>
    </div>
  )
}
