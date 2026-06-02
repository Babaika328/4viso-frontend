import { defineStore } from 'pinia'
import { ref }         from 'vue'
import { analyticsApi } from '../api/analytics'

export const useAnalyticsStore = defineStore('analytics', () => {
  const summary    = ref(null)
  const risk       = ref(null)
  const modes      = ref(null)
  const cargo      = ref(null)
  const caretakers = ref(null)
  const loading    = ref(false)
  const error      = ref(null)

  async function fetchAll() {
    loading.value = true
    error.value   = null
    try {
      const [s, r, m, c, ct] = await Promise.all([
        analyticsApi.summary(),
        analyticsApi.risk(),
        analyticsApi.modes(),
        analyticsApi.cargo(),
        analyticsApi.caretakers(),
      ])
      summary.value    = s.data
      risk.value       = r.data
      modes.value      = m.data
      cargo.value      = c.data
      caretakers.value = ct.data
    } catch (e) {
      error.value = 'Failed to load analytics'
    } finally {
      loading.value = false
    }
  }

  return { summary, risk, modes, cargo, caretakers, loading, error, fetchAll }
})