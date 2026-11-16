import axios from 'axios';

export const DOMAIN = 'https://shop.cyberlearn.vn';
export const ACCESS_TOKEN = 'accessToken';
export const USER_LOGIN = 'userLogin';
export const CART_STORAGE = 'carts';

export const http = axios.create({
  baseURL: `${DOMAIN}/api`,
  timeout: 30000,
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
