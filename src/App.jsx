import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { AppProvider, useApp }   from './context/AppContext.jsx'
import Layout          from './layout/Layout.jsx'
import Login           from './pages/Login.jsx'
import Signup          from './pages/Signup.jsx'
import Dashboard       from './pages/Dashboard.jsx'
import CreateGroup     from './pages/CreateGroup.jsx'
import BrowseGroups    from './pages/BrowseGroups.jsx'
import MyGroups        from './pages/MyGroups.jsx'
import GroupDetails    from './pages/GroupDetails.jsx'
import AdminUsers      from './pages/AdminUsers.jsx'
import AdminGroups     from './pages/AdminGroups.jsx'
import AdminSubjects   from './pages/AdminSubjects.jsx'
import AccountSettings from './pages/AccountSettings.jsx'
import LandingPage     from './pages/LandingPage.jsx'
import Icon            from './components/ui/Icons.jsx'
import { spring, springSnappy, springSmooth, springBouncy, springInstant } from './utils/animations.js'

const PAGES = {
  'dashboard':        Dashboard,
  'create-group':     CreateGroup,
  'browse-groups':    BrowseGroups,
  'my-groups':        MyGroups,
  'group-detail':     GroupDetails,
  'admin-users':      AdminUsers,
  'admin-groups':     AdminGroups,
  'admin-subjects':   AdminSubjects,
  'account-settings': AccountSettings,
}

function PageRouter() { const { currentPage } = useApp(); const Page = PAGES[currentPage] || Dashboard; return <Page /> }

function AuthShell() {
  const [showApp, setShowApp] = useState(false)
  const [mode, setMode] = useState('login')
  if (!showApp) return <LandingPage onEnter={() => setShowApp(true)} />
  return mode === 'login'
    ? <Login onSwitch={() => setMode('signup')} />
    : <Signup onSwitch={() => setMode('login')} />
}

function Loading() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="w-14 h-14 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-xl shadow-indigo-500/30">
        <Icon name="graduationCap" size={22} className="text-white" />
      </motion.div>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
        <Icon name="loader" size={20} className="text-indigo-500" />
      </motion.div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-xs text-[var(--text-muted)]">
        Connecting…
      </motion.p>
    </motion.div>
  )
}

function AppShell() {
  const { isAuth, loading } = useAuth()
  return (
    <AnimatePresence mode="wait">
      {loading
        ? <Loading key="loading" />
        : !isAuth
          ? <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <AuthShell />
            </motion.div>
          : <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <Layout><PageRouter /></Layout>
            </motion.div>
      }
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </AuthProvider>
  )
}
