import client from './client'

export const lanesApi = {
  list:      params => client.get('/api/lanes', { params }),
  get:       id     => client.get(`/api/lanes/${id}`),
  create:    data   => client.post('/api/lanes', data),
  update:    (id, data) => client.put(`/api/lanes/${id}`, data),
  delete:    id     => client.delete(`/api/lanes/${id}`),
  duplicate: id     => client.post(`/api/lanes/${id}/duplicate`),
}