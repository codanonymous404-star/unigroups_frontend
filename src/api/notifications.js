import api from './axios'
export const notifAPI = {
  list:      ()  => api.get('/api/notifications/'),
  markRead:  (id)=> api.post('/api/notifications/mark-read/', id ? { id } : {}),
  delete:    (id)=> api.delete(`/api/notifications/${id}/delete/`),
}
