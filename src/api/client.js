import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor — attach access token ─────────────
client.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — handle token refresh ───────────
let isRefreshing = false
let failedQueue  = []

function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

client.interceptors.response.use(
  response => response,

  async error => {
    const original = error.config

    // if 401 and not already retrying and not the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // queue the request until refresh is done
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return client(original)
        }).catch(err => Promise.reject(err))
      }

      original._retry  = true
      isRefreshing     = true

      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        // no refresh token — force logout
        clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const res = await axios.post(`${API}/auth/refresh`, {
          refresh_token: refreshToken
        })

        const { access_token, refresh_token } = res.data
        localStorage.setItem('token',         access_token)
        localStorage.setItem('refresh_token', refresh_token)

        client.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
        original.headers.Authorization                  = `Bearer ${access_token}`

        processQueue(null, access_token)
        return client(original)

      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuth()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

export default client