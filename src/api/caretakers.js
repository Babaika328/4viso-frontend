import client from './client'

export const caretakersApi = {
  list:   params    => client.get('/api/caretakers', { params }),
  get:    id        => client.get(`/api/caretakers/${id}`),
  lanes:  id        => client.get(`/api/caretakers/${id}/lanes`),
  create: data      => client.post('/api/caretakers', data),
  update: (id, data)=> client.put(`/api/caretakers/${id}`, data),
  delete: id        => client.delete(`/api/caretakers/${id}`),
}