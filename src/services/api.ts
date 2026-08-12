import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// For Android emulator, localhost is 10.0.2.2. For iOS simulator/web, it is localhost.
const BASE_URL = Platform.select({
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the Bearer JWT token from SecureStore
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving user token from SecureStore:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: clear stale token on 401 so the next call to SecureStore
// won't attach an invalid token. The individual screen can then redirect to Login.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync('userToken');
      } catch (_) {}
    }
    return Promise.reject(error);
  }
);


export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT';
  usn: string | null;
  department?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const adminApi = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  createUser: (userData: any) => api.post('/users', userData),

  updateUser: (id: string, userData: any) => api.put(`/users/${id}`, userData),

  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// Add this near your existing adminApi export in src/services/api.ts
export const announcementsApi = {
  getAll: () => api.get('/announcements'),
  create: (data: { title: string; message: string; category: string; targetAudience: string; isUrgent: boolean }) =>
    api.post('/announcements', data),
};