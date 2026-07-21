import axios from 'axios';

// Client-side axios instance - used inside 'use client' components only.
export const api = axios.create({ baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api` });

export const submitContact = (data) => api.post('/contact', data);
export const registerMember = (data) => api.post('/members/register', data);
export const loginMember = (data) => api.post('/members/login', data);
export const createOrder = (data) => api.post('/orders', data);
export const getMemberOrders = (memberCode) => api.get(`/orders/member/${memberCode}`);
export const sendChatMessage = (data) => api.post('/chatbot', data);
export const getActivityPhotos = (id) => api.get(`/activities/${id}/photos`);
export const createVideoJob = (data) => api.post('/video-studio/jobs', data);
export const getVideoJob = (id) => api.get(`/video-studio/jobs/${id}`);
export const getVideoUrl = (id) =>
  `${process.env.NEXT_PUBLIC_API_URL}/api/video-studio/jobs/${id}/video`;
export const getVideoDownloadUrl = (id) => `${getVideoUrl(id)}?download=1`;

// Server-side fetch helpers - used inside Server Component page.js files only.
const SERVER_API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

async function serverFetch(path, { params, ...init } = {}) {
  const url = new URL(`/api${path}`, SERVER_API_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }
  const res = await fetch(url, init);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }
  return res.json();
}

export const getProductsServer = (params) => serverFetch('/products', { params, next: { revalidate: 60 } });
export const getProductServer = (id) => serverFetch(`/products/${id}`, { next: { revalidate: 60 } });
export const getCategoriesServer = () => serverFetch('/products/categories', { next: { revalidate: 60 } });
export const getPromotionsServer = () => serverFetch('/promotions', { next: { revalidate: 60 } });
export const getHallOfFameServer = (params) => serverFetch('/hall-of-fame', { params, next: { revalidate: 60 } });
export const getActivitiesServer = () => serverFetch('/activities', { next: { revalidate: 60 } });
