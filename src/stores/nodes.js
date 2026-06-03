import { defineStore } from 'pinia'
import { ref }         from 'vue'
import { nodesApi }    from '../api/nodes'

export const useNodesStore = defineStore('nodes', () => {
  const nodes   = ref([])
  const loading = ref(false)

  async function fetchNodes(params = {}) {
    loading.value = true
    try {
      const res   = await nodesApi.list(params)
      nodes.value = res.data
    } finally {
      loading.value = false
    }
  }

  return { nodes, loading, fetchNodes }
})