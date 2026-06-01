import api from './axios'
export const chatAPI = {
  getMessages:   (gid, limit = 50) => api.get(`/api/chat/groups/${gid}/messages/`, { params: { limit } }),
  sendMessage:   (gid, content)    => api.post(`/api/chat/groups/${gid}/messages/`, { content }),
  deleteMessage: mid               => api.delete(`/api/chat/messages/${mid}/`),
}
