import React from 'react'
import ReactDOM from 'react-dom/client'
import { motion, AnimatePresence } from 'framer-motion'
import App from './App.jsx'
import './index.css'

function AppWrapper() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="app-root"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ minHeight: '100vh' }}>
        <App/>
      </motion.div>
    </AnimatePresence>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWrapper/>
  </React.StrictMode>
)
