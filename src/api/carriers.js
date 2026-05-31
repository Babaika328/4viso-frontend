import client from './client'

export const carriersApi = {
  list: params => client.get('/api/carriers', { params }),
  get:  id     => client.get(`/api/carriers/${id}`),
}