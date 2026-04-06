import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = sessionStorage.getItem('refresh_token')

      if (refresh) {
        try {
          // Use plain axios here — NOT the api instance — to avoid infinite loop
          const res = await axios.post(
            `${BASE_URL}/api/accounts/token/refresh/`,
            { refresh },
            { headers: { 'Content-Type': 'application/json' } }
          )
          const newAccess = res.data.access
          sessionStorage.setItem('access_token', newAccess)
          original.headers.Authorization = `Bearer ${newAccess}`
          return api(original)
        } catch {
          sessionStorage.clear()
          window.location.href = '/login'
        }
      } else {
        sessionStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api