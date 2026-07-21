import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get('/products/categories');

export const getPromotions = () => api.get('/promotions');

export const getHallOfFame = (params) => api.get('/hall-of-fame', { params });

export const getActivities = () => api.get('/activities');

export const submitContact = (data) => api.post('/contact', data);

export const registerMember = (data) => api.post('/members/register', data);
export const loginMember = (data) => api.post('/members/login', data);

export const createOrder = (data) => api.post('/orders', data);
export const getMemberOrders = (memberCode) => api.get(`/orders/member/${memberCode}`);
