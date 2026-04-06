import api from './config'

export const login = (phone_number, password) =>
  api.post('/api/accounts/login/', { phone_number, password })

export const register = (data) =>
  api.post('/api/accounts/register/', data)

export const logout = (refresh) =>
  api.post('/api/accounts/logout/', { refresh })

export const getMe = () =>
  api.get('/api/accounts/me/')

export const refreshToken = (refresh) =>
  api.post('/api/accounts/token/refresh/', { refresh })