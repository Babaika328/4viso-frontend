import { defineStore } from 'pinia'
import { ref }         from 'vue'
import { carriersApi } from '../api/carriers'

export const useCarriersStore = defineStore('carriers', () => {
  const carriers = ref([])
  const loading  = ref(false)

  async function fetchCarriers(params = {}) {
    loading.value = true
    try {
      const res      = await carriersApi.list(params)
      carriers.value = res.data
    } finally {
      loading.value = false
    }
  }

  return { carriers, loading, fetchCarriers }
})