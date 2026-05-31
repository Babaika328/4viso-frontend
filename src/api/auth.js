import client from './client'

export const authApi = {
  login:          data => client.post('/auth/login', data),
  register:       data => client.post('/auth/register', data),
  refresh:        data => client.post('/auth/refresh', data),
  logout:         data => client.post('/auth/logout', data),
  me:             ()   => client.get('/auth/me'),
  updateMe:       data => client.patch('/auth/me', data),
  changePassword: data => client.post('/auth/change-password', data),
}