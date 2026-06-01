export default function Badge({ children, variant='default', className='' }) {
  const v = {
    open:     'text-green-700 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-400/10 dark:border-green-400/25',
    locked:   'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-400/10 dark:border-slate-400/20',
    leader:   'text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/25',
    member:   'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-400/10 dark:border-slate-400/20',
    admin:    'text-red-700 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-400/10 dark:border-red-400/25',
    se:       'text-orange-700 bg-orange-100 border-orange-200 dark:text-orange-400 dark:bg-orange-400/10 dark:border-orange-400/25',
    cs:       'text-cyan-700 bg-cyan-100 border-cyan-200 dark:text-cyan-700 dark:bg-cyan-400/10 dark:border-cyan-400/25',
    success:  'text-green-700 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-400/10 dark:border-green-400/25',
    danger:   'text-red-700 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-400/10 dark:border-red-400/25',
    warning:  'text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/25',
    pending:  'text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/25',
    accepted: 'text-green-700 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-400/10 dark:border-green-400/25',
    rejected: 'text-red-700 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-400/10 dark:border-red-400/25',
    brand:    'text-indigo-700 bg-indigo-100 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-400/10 dark:border-indigo-400/25',
    default:  'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-400/10 dark:border-slate-400/20',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${v[variant]||v.default} ${className}`}>
      {children}
    </span>
  )
}
