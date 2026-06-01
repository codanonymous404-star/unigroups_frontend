import { motion } from 'framer-motion'
import { spring, springSnappy, springSmooth, springBouncy, springInstant } from '../../utils/animations.js'

export default function Input({ label, hint, icon, type='text', placeholder='', value, onChange, required=false, min, max, disabled=false, mono=false, className='' }) {
  return (
    <motion.div
      className={`flex flex-col gap-1.5 ${className}`}
      initial={{ opacity:0, y:10 }}
      animate={{ opacity:1, y:0 }}
      transition={springSmooth}>
      {label && (
        <div className="flex justify-between">
          <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            {label}{required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {hint && <span className="text-xs text-[var(--text-faint)]">{hint}</span>}
        </div>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">{icon}</span>}
        <input
          type={type} placeholder={placeholder} value={value} onChange={onChange}
          required={required} min={min} max={max} disabled={disabled}
          className={`w-full py-2.5 px-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 focus:scale-[1.01] disabled:opacity-40 ${icon ? 'pl-10' : ''} ${mono ? 'font-mono tracking-wider uppercase text-indigo-600 dark:text-indigo-400' : ''}`}
          style={{background:'var(--bg-raised)',border:'1px solid var(--border)',backdropFilter:'blur(12px)'}}
        />
      </div>
    </motion.div>
  )
}
