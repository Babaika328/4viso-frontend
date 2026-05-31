import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth'

export const useAuthStore = defineStore('auth', () => {

  // ── State ──────────────────────────────────────────────
  const token        = ref(localStorage.getItem('token')         || null)
  const refreshToken = ref(localStorage.getItem('refresh_token') || null)
  const user         = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  // ── Getters ────────────────────────────────────────────
  const isLoggedIn = computed(() => !!token.value)
  const role       = computed(() => user.value?.role || null)
  const isAdmin    = computed(() => role.value === 'admin')
  const isAuditor  = computed(() => role.value === 'auditor')
  const isStaff    = computed(() => role.value === 'staff')
  const isPort     = computed(() => role.value === 'port')
  const canWrite   = computed(() => ['admin','staff'].includes(role.value))

  // ── Actions ────────────────────────────────────────────
  function setAuth(data) {
    token.value        = data.access_token
    refreshToken.value = data.refresh_token
    user.value         = data.user
    localStorage.setItem('token',         data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('user',          JSON.stringify(data.user))
  }

  async function logout() {
    try {
      if (refreshToken.value) {
        await authApi.logout({ refresh_token: refreshToken.value })
      }
    } catch {}
    finally {
      clearAuth()
    }
  }

  function clearAuth() {
    token.value        = null
    refreshToken.value = null
    user.value         = null
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const res  = await authApi.me()
      user.value = res.data
      localStorage.setItem('user', JSON.stringify(res.data))
    } catch {
      clearAuth()
    }
  }

  return {
    token, refreshToken, user,
    isLoggedIn, role, isAdmin, isAuditor, isStaff, isPort, canWrite,
    setAuth, logout, clearAuth, fetchMe,
  }
})