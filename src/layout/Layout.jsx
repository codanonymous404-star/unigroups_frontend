import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar  from '../components/layout/Navbar.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Avatar } from '../components/ui/misc.jsx'
import Icon from '../components/ui/Icons.jsx'
import { springSmooth } from '../utils/animations.js'

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

const pageTransition = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.18 } },
}

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const { currentPage, navigate, dark } = useApp()
  const { user, logout, isAdmin } = useAuth()
  
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Navbar menuOpen={open} onMenuToggle={() => setOpen(p=>!p)} setMenuOpen={setOpen}/>
      <Sidebar open={open} setOpen={setOpen}/>
      
      <main className="lg:pl-64 pt-16 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="p-4 sm:p-6 max-w-5xl mx-auto">
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Animated Fullscreen Pop-up Menu */}
      <AnimatePresence>
        {open && (
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
                onClick={() => setOpen(false)}
                className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95 transition-all"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Content (Middle list) */}
            <div className="flex-1 py-6 flex flex-col justify-center space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)]">Navigation</p>
                <div className="grid grid-cols-2 gap-2">
                  {NAV.map((item) => {
                    const active = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigate(item.id);
                          setOpen(false);
                        }}
                        className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-bold border transition-all ${
                          active
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20 shadow-md'
                            : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-raised)]'
                        }`}
                      >
                        <Icon name={item.icon} size={14} className={active ? 'text-indigo-600 dark:text-indigo-400' : 'text-[var(--text-muted)]'} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Admin actions if admin */}
              {isAdmin && (
                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)]">Admin Panel</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ADMIN_NAV.map((item) => {
                      const active = currentPage === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            navigate(item.id);
                            setOpen(false);
                          }}
                          className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-xs font-bold border transition-all ${
                            active
                              ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20 shadow-md'
                              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-raised)]'
                        }`}
                      >
                        <Icon name={item.icon} size={14} className={active ? 'text-red-600 dark:text-red-400' : 'text-[var(--text-muted)]'} />
                        <span className="truncate">{item.label}</span>
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
                onClick={() => { logout(); setOpen(false); }}
                className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 active:scale-95 transition-all border border-red-100 dark:border-red-500/20"
                title="Logout"
              >
                <Icon name="logout" size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
