import api from "./config";

export const checkout = (data) => api.post("/api/billing/checkout/", data);
export const getSalesHistory = (params) => api.get("/api/billing/history/", { params });
export const getSalesBill = (id) => api.get(`/api/billing/history/${id}/`);
export const getCustomerHistory = (phone) => api.get(`/api/billing/customer/${phone}/`);
export const submitReturn = (data) => api.post("/api/billing/return/", data);
export const processReturn = submitReturn;
export const searchCustomers = (query) => api.get('/api/billing/customers/', { params: { search: query } });
export const searchB2BCustomers = (query) => api.get('/api/billing/customers/', { params: { search: query, customer_type: 'B2B' } });
export const getLedgerCustomers = (type) => api.get('/api/billing/customers/', { params: { has_balance: 'true', ...(type ? { customer_type: type } : {}) } });
export const getAllCustomers = (type) => api.get('/api/billing/customers/', { params: { ...(type ? { customer_type: type } : {}), limit: 200 } });
export const submitPayment = (data) => api.post('/api/billing/receipt/', data);
export const createCustomer = (data) => api.post('/api/billing/customers/', data);
export const getGSTReport = (from, to) => api.get('/api/billing/gst-report/', { params: { from, to } });
export const getCustomerLedger = (customerId, params) => api.get(`/api/billing/ledger/${customerId}/`, { params });
export const getCashBook = (params) => api.get('/api/billing/cash-book/', { params });
