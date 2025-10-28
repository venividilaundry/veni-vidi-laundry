import axios from 'axios';

// Use environment variable in production, fallback to relative path
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL + '/api'
  : '/api';

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

export const authAPI = {
  checkPostcode: (postcode) => axios.post('/auth/check-postcode', { postcode }),
  login: (email, password) => axios.post('/auth/login', { email, password }),
  register: (userData) => axios.post('/auth/register', userData)
};

export const subscriptionsAPI = {
  getPricing: () => axios.get('/subscriptions/pricing'),
  create: (subscriptionData) => axios.post('/subscriptions/create', subscriptionData),
  getMySubscriptions: () => axios.get('/subscriptions/my-subscriptions'),
  cancel: (id) => axios.put(`/subscriptions/${id}/cancel`)
};

export const ordersAPI = {
  getPricing: () => axios.get('/orders/pricing'),
  create: (orderData) => axios.post('/orders/create', orderData),
  getMyOrders: () => axios.get('/orders/my-orders'),
  getOrder: (id) => axios.get(`/orders/${id}`)
};

export const adminAPI = {
  getOrders: () => axios.get('/admin/orders'),
  getSubscriptions: () => axios.get('/admin/subscriptions'),
  updateOrderStatus: (id, status, deliveryDate) => 
    axios.put(`/admin/orders/${id}/status`, { status, deliveryDate }),
  getDashboard: () => axios.get('/admin/dashboard'),
  getCustomers: () => axios.get('/admin/customers')
};

export default {
  authAPI,
  subscriptionsAPI,
  ordersAPI,
  adminAPI
};
