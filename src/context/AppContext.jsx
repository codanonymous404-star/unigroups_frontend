import { createContext, useContext, useState, useEffect } from 'react'
const AppContext = createContext(null)
export function AppProvider({ children }) {
  const [currentPage,   setCurrentPage]   = useState('dashboard')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('ug-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('ug-theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('ug-theme', 'light')
    }
  }, [dark])

  const navigate   = (page, group = null) => { if (group) setSelectedGroup(group); setCurrentPage(page); window.scrollTo({ top:0, behavior:'smooth' }) }
  const toggleDark = () => setDark(p => !p)
  return <AppContext.Provider value={{ currentPage, selectedGroup, navigate, dark, toggleDark }}>{children}</AppContext.Provider>
}
export const useApp = () => { const c = useContext(AppContext); if (!c) throw new Error('needs AppProvider'); return c }
