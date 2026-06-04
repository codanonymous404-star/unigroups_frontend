import { motion, AnimatePresence } from 'framer-motion'
import Icon from '../ui/Icons.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useApp }  from '../../context/AppContext.jsx'
import { Avatar }  from '../ui/misc.jsx'
import Badge       from '../ui/Badge.jsx'
import NotificationBell from '../ui/NotificationBell.jsx'
import { spring, springSnappy, springSmooth, springBouncy, springInstant } from '../../utils/animations.js'

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

export default function Navbar({ menuOpen, onMenuToggle, setMenuOpen }) {
  const { user, logout, isAdmin } = useAuth()
  const { dark, toggleDark, currentPage, navigate } = useApp()
  
  return (
    <motion.header
      initial={{ y:-64, opacity:0 }}
      animate={{ y:0, opacity:1 }}
      transition={springSmooth}
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-5 gap-4"
      style={{
        background: dark ? '#0a0a0c' : 'rgba(248,250,255,0.92)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        borderBottom: '1px solid var(--border)',
        boxShadow: dark
          ? '0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.5)'
          : '0 1px 0 rgba(255,255,255,0.9), 0 4px 20px rgba(0,0,0,0.05)',
      }}>
      <motion.button onClick={onMenuToggle} whileTap={{scale:0.88}} whileHover={{scale:1.05}}
        className="lg:hidden p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-colors">
        <Icon name={menuOpen ? 'x' : 'menu'} size={20}/>
      </motion.button>

      <motion.div className="flex items-center gap-2.5 mr-auto"
        initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{...springSmooth, delay:0.1}}>
        <motion.div whileHover={{scale:1.08, rotate:5}} whileTap={{scale:0.95}} transition={springBouncy}
          className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30"
          style={{background:'linear-gradient(135deg,#4f46e5,#7c3aed)'}}>
          <Icon name="graduationCap" size={15} className="text-white"/>
        </motion.div>
        <span className="font-bold text-base text-[var(--text-primary)] tracking-tight hidden sm:block">UniGroups</span>
        {isAdmin && <Badge variant="admin">Admin</Badge>}
      </motion.div>

      <motion.div className="flex items-center gap-1"
        initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} transition={{...springSmooth, delay:0.15}}>
        <NotificationBell/>
        <motion.button onClick={toggleDark} whileHover={{scale:1.08}} whileTap={{scale:0.88, rotate:20}}
          transition={springSnappy}
          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-colors"
          title={dark ? 'Light mode' : 'Dark mode'}>
          <motion.div animate={{ rotate: dark ? 0 : 180 }} transition={springSmooth}>
            {dark ? <Icon name="sun" size={17}/> : <Icon name="moon" size={17}/>}
          </motion.div>
        </motion.button>
        <div className="w-px h-5 mx-1" style={{background:'var(--border)'}}/>
        <motion.div whileHover={{scale:1.02}}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-colors"
          style={{
            background:'var(--bg-raised)',
            border:'1px solid var(--border)',
            backdropFilter:'blur(12px)',
          }}>
          <Avatar initials={user?.name?.slice(0,2)} dept={user?.department} size="xs"/>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-bold text-[var(--text-primary)]">{user?.name}</p>
            <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 tracking-wide">{user?.roll_number}</p>
          </div>
        </motion.div>
        <motion.button onClick={logout} whileHover={{scale:1.08}} whileTap={{scale:0.88}}
          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors ml-1"
          title="Logout">
          <Icon name="logout" size={17}/>
        </motion.button>
      </motion.div>

      {/* Mobile Animated Fullscreen Pop-up Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={springSmooth}
            className="fixed inset-0 z-[100] bg-[var(--bg-base)] flex flex-col justify-between p-6 lg:hidden"
            style={{ 
              backdropFilter: 'blur(20px)',
              background: dark ? 'rgba(6,6,8,0.98)' : 'rgba(241,243,248,0.98)'
            }}
          >
            {/* Header row in modal */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Icon name="graduationCap" size={15} className="text-white"/>
                </div>
                <span className="font-bold text-base text-[var(--text-primary)]">UniGroups</span>
              </div>
              <button 
                onClick={() => setMenuOpen(false)}
                className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95 transition-all"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Content (Middle list) */}
            <div className="flex-1 py-6 flex flex-col justify-center space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)]">Navigation</p>
                <div className="space-y-2">
                  {NAV.map((item) => {
                    const active = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigate(item.id);
                          setMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold border transition-all ${
                          active
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20 shadow-md'
                            : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-raised)]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-indigo-500/10' : 'bg-[var(--bg-raised)]'}`}>
                          <Icon name={item.icon} size={15} className={active ? 'text-indigo-600 dark:text-indigo-400' : 'text-[var(--text-muted)]'} />
                        </div>
                        <span className="flex-1 text-left">{item.label}</span>
                        <Icon name="chevronRight" size={12} className="text-[var(--text-faint)]" />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Admin actions if admin */}
              {isAdmin && (
                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)]">Admin Panel</p>
                  <div className="space-y-2">
                    {ADMIN_NAV.map((item) => {
                      const active = currentPage === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            navigate(item.id);
                            setMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold border transition-all ${
                            active
                              ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20 shadow-md'
                              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-raised)]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-red-500/10' : 'bg-[var(--bg-raised)]'}`}>
                          <Icon name={item.icon} size={15} className={active ? 'text-red-600 dark:text-red-400' : 'text-[var(--text-muted)]'} />
                        </div>
                        <span className="flex-1 text-left">{item.label}</span>
                        <Icon name="chevronRight" size={12} className="text-[var(--text-faint)]" />
                      </button>
                    )
                  })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Profile Details */}
            <div className="pt-4 border-t border-[var(--border)] flex items-center gap-3">
              <Avatar initials={user?.name?.slice(0, 2)} dept={user?.department} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] truncate">{user?.name}</p>
                <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 tracking-wide truncate">{user?.roll_number}</p>
              </div>
              <button 
                onClick={() => { logout(); setMenuOpen(false); }}
                className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 active:scale-95 transition-all border border-red-100 dark:border-red-500/20"
                title="Logout"
              >
                <Icon name="logout" size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
