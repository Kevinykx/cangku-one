import { mockResponse } from './client';
import { mockUser } from './mock-data';
import type { User, LoginCredentials } from './types';

let currentUser: User | null = null;

export async function login(credentials: LoginCredentials) {
  if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
    currentUser = mockUser;
    return mockResponse({ user: mockUser, token: 'mock-token-123' });
  }
  await mockResponse(null);
  return {
    code: 401,
    data: null as never,
    message: '邮箱或密码错误',
  };
}

export async function logout() {
  currentUser = null;
  return mockResponse(null);
}

export async function getCurrentUser() {
  return mockResponse(currentUser || mockUser);
}

export async function updateProfile(data: Partial<User>) {
  if (currentUser) Object.assign(currentUser, data);
  Object.assign(mockUser, data);
  return mockResponse<User>({ ...mockUser });
}
