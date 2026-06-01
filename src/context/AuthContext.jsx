import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/auth'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) { authAPI.profile().then(r => setUser(r.data.user)).catch(() => { localStorage.clear(); setUser(null) }).finally(() => setLoading(false)) }
    else setLoading(false)
  }, [])
  const register    = useCallback(async d => { const r = await authAPI.register(d); return r.data }, [])
  const verifyEmail = useCallback(async (roll_number, otp_code) => {
    const r = await authAPI.verifyEmail({ roll_number, otp_code })
    localStorage.setItem('access_token', r.data.access_token)
    localStorage.setItem('refresh_token', r.data.refresh_token)
    setUser(r.data.user); return r.data.user
  }, [])
  const login = useCallback(async (roll_number, password) => {
    const r = await authAPI.login({ roll_number, password })
    localStorage.setItem('access_token', r.data.access_token)
    localStorage.setItem('refresh_token', r.data.refresh_token)
    setUser(r.data.user); return r.data.user
  }, [])
  const logout = useCallback(async () => {
    const ref = localStorage.getItem('refresh_token')
    try { if (ref) await authAPI.logout(ref) } catch (_) {}
    localStorage.clear(); setUser(null)
  }, [])
  return (
    <AuthContext.Provider value={{ user, loading, register, verifyEmail, login, logout, isAuth: !!user, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => { const c = useContext(AuthContext); if (!c) throw new Error('needs AuthProvider'); return c }
