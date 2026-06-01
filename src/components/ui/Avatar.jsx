export default function Avatar({ initials='?', dept, size='md', className='' }) {
  const s = { xs:'w-6 h-6 text-[9px]', sm:'w-8 h-8 text-xs', md:'w-10 h-10 text-sm', lg:'w-12 h-12 text-base', xl:'w-16 h-16 text-xl' }
  const d = { SE:'bg-orange-400/15 text-orange-400 ring-1 ring-orange-400/20', CS:'bg-cyan-400/15 text-cyan-400 ring-1 ring-cyan-400/20' }
  return <div className={`${s[size]||s.md} rounded-xl flex items-center justify-center font-bold font-mono tracking-wide shrink-0 ${d[dept]||'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/20'} ${className}`}>{String(initials).slice(0,2).toUpperCase()}</div>
}
