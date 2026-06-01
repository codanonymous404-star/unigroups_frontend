export default function EmptyState({ icon='📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl mb-4">{icon}</div>
      <p className="font-semibold text-slate-300">{title}</p>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
