import { defineStore } from 'pinia'
import { ref }         from 'vue'
import { lanesApi }    from '../api/lanes'

export const useLanesStore = defineStore('lanes', () => {
  const lanes   = ref([])
  const loading = ref(false)
  const error   = ref(null)

  async function fetchLanes(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const res   = await lanesApi.list(params)
      lanes.value = res.data
    } catch (e) {
      error.value = 'Failed to load lanes'
    } finally {
      loading.value = false
    }
  }

  async function deleteLane(id) {
    await lanesApi.delete(id)
    lanes.value = lanes.value.filter(l => l.id !== id)
  }

  return { lanes, loading, error, fetchLanes, deleteLane }
})