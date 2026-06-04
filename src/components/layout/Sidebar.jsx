import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../ui/Icons.jsx'
import { useApp }  from '../../context/AppContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { Avatar }  from '../ui/misc.jsx'
import { spring, springSnappy, springSmooth, springBouncy, springInstant, staggerContainer, fadeUp } from '../../utils/animations.js'

const NAV = [
  { id: 'dashboard',        label: 'Dashboard',     icon: 'dashboard' },
  { id: 'create-group',     label: 'Create Group',  icon: 'plus'      },
  { id: 'browse-groups',    label: 'Browse Groups', icon: 'search'    },
  { id: 'my-groups',        label: 'My Groups',     icon: 'users'     },
  { id: 'account-settings', label: 'Settings',      icon: 'settings'  },
]

const ADMIN_NAV = [
  { id: 'admin-groups',   label: 'All Groups',      icon: 'layers'      },
  { id: 'admin-users',    label: 'Manage Students', icon: 'shieldCheck' },
  { id: 'admin-subjects', label: 'Subjects',        icon: 'bookOpen'    },
]

function NavItem({ item, active, onClick, isAdmin }) {
  return (
    <motion.button onClick={onClick}
      whileHover={{ x: 3, transition: springSnappy }}
      whileTap={{ scale: 0.97, transition: springInstant }}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative overflow-hidden
        ${active
          ? isAdmin
            ? 'text-red-600 dark:text-red-400'
            : 'text-indigo-600 dark:text-indigo-400'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
      style={active ? {
        background: isAdmin ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.08)',
        border: `1px solid ${isAdmin ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)'}`,
        backdropFilter: 'blur(12px)',
      } : {
        background: 'transparent',
        border: '1px solid transparent',
      }}>
      {active && (
        <motion.div
          layoutId={isAdmin ? 'admin-active' : 'nav-active'}
          className="absolute inset-0 rounded-xl"
          style={{
            background: isAdmin
              ? 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(239,68,68,0.02))'
              : 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(99,102,241,0.03))',
          }}
          transition={springSmooth} />
      )}
      <motion.div
        animate={active ? { scale: 1.1 } : { scale: 1 }}
        transition={springBouncy}
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 relative z-10 transition-all"
        style={active ? {
          background: isAdmin ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
        } : {
          background: 'var(--bg-raised)',
        }}>
        <Icon name={item.icon} size={14}
          className={active
            ? isAdmin ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'
            : 'text-[var(--text-muted)]'} />
      </motion.div>
      <span className="relative z-10">{item.label}</span>
      {active && (
        <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={springSnappy} className="ml-auto relative z-10">
          <Icon name="chevronRight" size={13} className={isAdmin ? 'text-red-400 opacity-60' : 'text-indigo-400 opacity-60'} />
        </motion.div>
      )}
    </motion.button>
  )
}

export default function Sidebar({ open, setOpen }) {
  const { currentPage, navigate } = useApp()
  const { isAdmin, user }         = useAuth()
  const go = id => { navigate(id); setOpen(false) }

  return (
    <>
      <aside
        className="fixed top-16 left-0 bottom-0 z-40 w-64 hidden lg:flex flex-col"
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}>

        <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06), transparent 70%)' }} />

        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto relative">
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)]">Navigation</p>

          <motion.div variants={staggerContainer} initial="animate" animate="animate" className="space-y-0.5">
            {NAV.map((item, i) => (
              <motion.div key={item.id} variants={fadeUp} custom={i}>
                <NavItem item={item} active={currentPage === item.id} onClick={() => go(item.id)} isAdmin={false} />
              </motion.div>
            ))}
          </motion.div>

          {isAdmin && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <div className="px-3 pt-5 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)]">Admin</p>
              </div>
              <div className="space-y-0.5">
                {ADMIN_NAV.map((item, i) => (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ ...springSmooth, delay: 0.35 + i * 0.07 }}>
                    <NavItem item={item} active={currentPage === item.id} onClick={() => go(item.id)} isAdmin={true} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </nav>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springSmooth, delay: 0.4 }}
          className="px-3 py-4 relative"
          style={{ borderTop: '1px solid var(--border)' }}>
          <motion.div whileHover={{ scale: 1.01 }}
            className="flex items-center gap-3 px-3 py-3 rounded-xl"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
            <div className="relative shrink-0">
              <Avatar initials={user?.name?.slice(0, 2)} dept={user?.department} size="sm" />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, delay: 1 }}
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[var(--bg-raised)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">{user?.name}</p>
              <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 tracking-wide truncate">{user?.roll_number}</p>
            </div>
          </motion.div>
        </motion.div>
      </aside>
    </>
  )
}
