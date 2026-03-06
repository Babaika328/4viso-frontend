import { defineStore } from 'pinia'

export const useShipmentsStore = defineStore('shipments', {
  state: () => ({
    list: [],
    sortBy: null
  })
})