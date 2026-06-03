import api from './axios'
export const groupsAPI = {
  list:           p         => api.get('/api/groups/',                   { params: p }),
  create:         d         => api.post('/api/groups/create/',           d),
  detail:         id        => api.get(`/api/groups/${id}/`),
  update:         (id, d)   => api.patch(`/api/groups/${id}/update/`,    d),
  delete:         id        => api.delete(`/api/groups/${id}/delete/`),
  members:        id        => api.get(`/api/groups/${id}/members/`),
  myGroups:       ()        => api.get('/api/groups/my-groups/'),
  sendRequest:    d         => api.post('/api/groups/join-request/',     d),
  myRequests:     ()        => api.get('/api/groups/my-requests/'),
  acceptRequest:  rid       => api.post('/api/groups/accept-request/',   { request_id: rid }),
  rejectRequest:  rid       => api.post('/api/groups/reject-request/',   { request_id: rid }),
  lock:           gid       => api.post('/api/groups/lock/',             { group_id: gid }),
  unlock:         gid       => api.post('/api/groups/unlock/',           { group_id: gid }),
  removeMember:   (gid,uid) => api.delete('/api/groups/remove-member/',  { data: { group_id: gid, user_id: uid } }),
  addMember:      d         => api.post('/api/groups/add-member/',       d),
  // ── Subjects ──────────────────────────────────────────────────────────────
  subjects:       (dept)    => api.get('/api/groups/subjects/', { params: dept ? { dept } : {} }),
  subjectsManage: ()        => api.get('/api/groups/subjects/manage/'),
  subjectCreate:  d         => api.post('/api/groups/subjects/manage/',  d),
  subjectToggle:  (id, active) => api.patch('/api/groups/subjects/manage/', { id, is_active: active }),
  subjectDelete:  id        => api.delete('/api/groups/subjects/manage/', { data: { id } }),
}
