import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Set local server IP & Port for physical device / emulator testing
const SERVER_IP = '10.178.135.226';
const SERVER_PORT = '3000';

const BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}`;

export const api = axios.create({
  baseURL: 'http://10.178.135.226:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    //'ngrok-skip-browser-warning': 'true',
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
      } catch (_) { }
    }
    return Promise.reject(error);
  }
);

export interface UserGroup {
  id: string;
  name: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    users: number;
  };
  users?: User[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'MANAGEMENT';
  usn: string | null;
  department?: string | null;
  dob?: string;
  groups?: UserGroup[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  details: string;
  adminId: string;
  createdAt: string;
  admin?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface SubmissionItem {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'OVERDUE';
  facultyId: string;
  type?: 'assignment' | 'project' | 'quiz' | 'lab' | string;
  urgent?: boolean;
  targetRoles?: string[];
  faculty?: {
    id: string;
    name: string;
    email: string;
    department?: string | null;
    usn?: string | null;
    role?: string;
  };
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

  getAuditLogs: () => api.get('/audit-logs'),

  getSubmissions: () => api.get<SubmissionItem[]>('/submissions'),

  createSubmission: (data: {
    title: string;
    description?: string;
    dueDate: string;
    facultyId: string;
    type?: 'assignment' | 'project' | 'quiz' | 'lab' | string;
    urgent?: boolean;
    status?: 'PENDING' | 'SUBMITTED' | 'OVERDUE';
    targetRoles?: string[];
  }) => api.post<SubmissionItem>('/submissions', data),
};

export const rolesApi = {
  getGroups: () => api.get<UserGroup[]>('/groups'),
  createGroup: (data: { name: string; category: string }) => api.post<UserGroup>('/groups', data),
  updateGroup: (id: string, data: { name?: string; category?: string }) => api.put<UserGroup>(`/groups/${id}`, data),
  deleteGroup: (id: string) => api.delete(`/groups/${id}`),

  getUsers: () => api.get<User[]>('/users'),
  updateUserRole: (userId: string, role: string) => api.put(`/users/${userId}`, { role }),
  assignUserGroup: (userId: string, groupId: string) => api.post(`/users/${userId}/groups/${groupId}`),
  removeUserGroup: (userId: string, groupId: string) => api.delete(`/users/${userId}/groups/${groupId}`),
};

export const submissionsApi = {
  getAll: () => api.get<SubmissionItem[]>('/submissions'),
  create: (data: {
    title: string;
    description?: string;
    dueDate: string;
    facultyId: string;
    type?: 'assignment' | 'project' | 'quiz' | 'lab' | string;
    urgent?: boolean;
    status?: 'PENDING' | 'SUBMITTED' | 'OVERDUE';
    targetRoles?: string[];
  }) => api.post<SubmissionItem>('/submissions', data),
};

export const announcementsApi = {
  getAll: () => api.get('/announcements'),
  create: (data: {
    title: string;
    message: string;
    category: string;
    targetAudience?: string;
    isUrgent?: boolean;
    targetRoles?: string[];
  }) => api.post('/announcements', data),
};
