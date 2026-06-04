import { defineStore }    from 'pinia'
import { ref }            from 'vue'
import { caretakersApi }  from '../api/caretakers'

export const useCaretakersStore = defineStore('caretakers', () => {
  const caretakers = ref([])
  const loading    = ref(false)
  const error      = ref(null)

  async function fetchCaretakers(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const res        = await caretakersApi.list(params)
      caretakers.value = res.data
    } catch {
      error.value = 'Failed to load caretakers'
    } finally {
      loading.value = false
    }
  }

  async function createCaretaker(data) {
    const res = await caretakersApi.create(data)
    caretakers.value.unshift(res.data)
    return res.data
  }

  async function updateCaretaker(id, data) {
    const res = await caretakersApi.update(id, data)
    const idx = caretakers.value.findIndex(c => c.id === id)
    if (idx !== -1) caretakers.value[idx] = res.data
    return res.data
  }

  async function deleteCaretaker(id) {
    await caretakersApi.delete(id)
    caretakers.value = caretakers.value.filter(c => c.id !== id)
  }

  return { caretakers, loading, error, fetchCaretakers, createCaretaker, updateCaretaker, deleteCaretaker }
})