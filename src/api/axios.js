import axios from 'axios'
const BASE_URL = (import.meta.env.VITE_API_URL || 'https://unigroupsbackend-production.up.railway.app').replace(/\/+$/, '')
const api = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' }, timeout: 15000 })
api.interceptors.request.use((c) => { const t = localStorage.getItem('access_token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c }, e => Promise.reject(e))
let refreshing = false, queue = []
const drain = (err, token = null) => { queue.forEach(p => err ? p.reject(err) : p.resolve(token)); queue = [] }
api.interceptors.response.use(r => r, async err => {
  const orig = err.config
  if (err.response?.status === 401 && !orig._retry) {
    if (refreshing) return new Promise((res, rej) => queue.push({ resolve: res, reject: rej })).then(t => { orig.headers.Authorization = `Bearer ${t}`; return api(orig) })
    orig._retry = true; refreshing = true
    const ref = localStorage.getItem('refresh_token')
    if (!ref) { localStorage.clear(); window.location.reload(); return Promise.reject(err) }
    try {
      const { data } = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, { refresh: ref })
      localStorage.setItem('access_token', data.access); drain(null, data.access)
      orig.headers.Authorization = `Bearer ${data.access}`; return api(orig)
    } catch (e) { drain(e, null); localStorage.clear(); window.location.reload(); return Promise.reject(e) }
    finally { refreshing = false }
  }
  return Promise.reject(err)
})
export default api
