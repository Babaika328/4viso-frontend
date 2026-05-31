import client from './client'

export const analyticsApi = {
  summary:    () => client.get('/api/analytics/summary'),
  risk:       () => client.get('/api/analytics/risk'),
  modes:      () => client.get('/api/analytics/modes'),
  cargo:      () => client.get('/api/analytics/cargo'),
  caretakers: () => client.get('/api/analytics/caretakers'),
}