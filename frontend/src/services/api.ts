import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    const message = error.response?.data?.message;
    error.message = Array.isArray(message) ? message[0] : (message ?? error.message);
    return Promise.reject(error);
  },
);

export default api;