import { motion } from 'framer-motion'
import Icon from './Icons.jsx'
import { buttonTap, buttonHover, springSnappy, springSmooth, springBouncy, springInstant } from '../../utils/animations.js'

export default function Button({ children, variant='primary', size='md', loading=false, disabled=false, onClick, type='button', className='', fullWidth=false }) {
  const v = {
    primary:   'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 dark:bg-indigo-500 dark:hover:bg-indigo-600',
    secondary: 'bg-[var(--bg-raised)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-strong)]',
    ghost:     'text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]',
    danger:    'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 dark:border-red-500/20',
    success:   'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 dark:bg-green-500/10 dark:hover:bg-green-500/20 dark:text-green-400 dark:border-green-500/20',
    outline:   'border border-[var(--border)] hover:border-indigo-400 text-[var(--text-secondary)] hover:text-indigo-600 dark:hover:text-indigo-400',
  }
  const s = {
    xs: 'px-2.5 py-1 text-xs rounded-lg gap-1',
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-sm rounded-xl gap-2',
  }
  return (
    <motion.button
      type={type} onClick={onClick}
      disabled={disabled||loading}
      whileHover={!disabled && !loading ? buttonHover : {}}
      whileTap={!disabled && !loading ? buttonTap : {}}
      className={`inline-flex items-center justify-center font-semibold transition-colors duration-150 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${v[variant]||v.primary} ${s[size]||s.md} ${fullWidth?'w-full':''} ${className}`}>
      {loading ? <><Icon name="loader" size={14} className="animate-spin"/> Loading…</> : children}
    </motion.button>
  )
}
