import client from './client'

export const nodesApi = {
  list: params => client.get('/api/nodes', { params }),
  get:  id     => client.get(`/api/nodes/${id}`),
}