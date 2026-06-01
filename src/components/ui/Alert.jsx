// Alert
export function Alert({ type='error', message, onClose }) {
  if (!message) return null
  const s = {
    error:   { bar:'bg-red-500',   box:'bg-red-50 border-red-200 dark:bg-red-500/8 dark:border-red-500/20',     text:'text-red-600 dark:text-red-400' },
    success: { bar:'bg-green-500', box:'bg-green-50 border-green-200 dark:bg-green-500/8 dark:border-green-500/20', text:'text-green-700 dark:text-green-400' },
    warning: { bar:'bg-amber-500', box:'bg-amber-50 border-amber-200 dark:bg-amber-500/8 dark:border-amber-500/20', text:'text-amber-700 dark:text-amber-400' },
  }
  const v = s[type] || s.error
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${v.box}`}>
      <div className={`w-0.5 self-stretch rounded-full shrink-0 ${v.bar}`}/>
      <span className={`flex-1 font-medium ${v.text}`}>{message}</span>
      {onClose && <button onClick={onClose} className={`shrink-0 opacity-50 hover:opacity-100 text-lg leading-none ${v.text}`}>×</button>}
    </div>
  )
}
export default Alert
