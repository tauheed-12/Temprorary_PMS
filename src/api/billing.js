import api from './config'

export const checkout = (data) => api.post('/api/billing/checkout/', data)
export const getSalesHistory = () => api.get('/api/billing/history/')
export const getSalesBill = (id) => api.get(`/api/billing/history/${id}/`)
export const getCustomerHistory = (phone) => api.get(`/api/billing/customer/${phone}/`)
export const processReturn = (data) => api.post('/api/billing/return/', data)