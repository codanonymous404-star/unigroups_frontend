import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar  from '../components/layout/Navbar.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import { useApp } from '../context/AppContext.jsx'

const pageTransition = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.18 } },
}

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const { currentPage } = useApp()
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
    </div>
  )
}
