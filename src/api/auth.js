import api from './axios'
export const authAPI = {
  register:          d       => api.post('/api/auth/register/',     d),
  verifyEmail:       d       => api.post('/api/auth/verify-email/', d),
  resendOtp:         rn      => api.post('/api/auth/resend-otp/',   { roll_number: rn }),
  login:             d       => api.post('/api/auth/login/',        d),
  logout:            ref     => api.post('/api/auth/logout/',       { refresh_token: ref }),
  profile:           ()      => api.get('/api/auth/profile/'),
  updateProfile:     d       => api.patch('/api/auth/profile/',     d),
  classmates:        ()      => api.get('/api/auth/classmates/'),
  listUsers:         p       => api.get('/api/auth/users/',         { params: p }),
  getUser:           id      => api.get(`/api/auth/users/${id}/`),
  updateUser:        (id, d) => api.patch(`/api/auth/users/${id}/`, d),
  deleteUser:        id      => api.delete(`/api/auth/users/${id}/`),
  getStudentsByDept: dept    => api.get('/api/auth/users/',         { params: { role: 'student', dept } }),
}
