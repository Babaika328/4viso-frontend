import client from './client'

export const adminApi = {
  users:        ()          => client.get('/api/admin/users'),
  user:         id          => client.get(`/api/admin/users/${id}`),
  updateRole:   (id, data)  => client.patch(`/api/admin/users/${id}/role`, data),
  setActive:    (id, data)  => client.patch(`/api/admin/users/${id}/activate`, data),
  deleteUser:   id          => client.delete(`/api/admin/users/${id}`),
  revokeTokens: id          => client.post(`/api/admin/users/${id}/revoke-tokens`),
  logs:         params      => client.get('/api/admin/logs', { params }),
}