import type { ApiResponse } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const MOCK_DELAY = 400;

let isMockMode = true;

export function enableMockMode() {
  isMockMode = true;
}

export function disableMockMode() {
  isMockMode = false;
}

function delay(ms: number = MOCK_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  if (isMockMode) {
    await delay();
    throw new Error('Mock handler not registered for: ' + endpoint);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`);
  return res.json();
}

export async function apiPost<T, B = unknown>(endpoint: string, body: B): Promise<ApiResponse<T>> {
  if (isMockMode) {
    await delay();
    throw new Error('Mock handler not registered for: ' + endpoint);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiPut<T, B = unknown>(endpoint: string, body: B): Promise<ApiResponse<T>> {
  if (isMockMode) {
    await delay();
    throw new Error('Mock handler not registered for: ' + endpoint);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  if (isMockMode) {
    await delay();
    throw new Error('Mock handler not registered for: ' + endpoint);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { method: 'DELETE' });
  return res.json();
}

export function mockResponse<T>(data: T): Promise<ApiResponse<T>> {
  return delay().then(() => ({
    code: 0,
    data,
    message: 'success',
  }));
}

export function mockPaginatedResponse<T>(items: T[], total?: number): Promise<ApiResponse<{ items: T[]; total: number }>> {
  return delay().then(() => ({
    code: 0,
    data: { items, total: total ?? items.length },
    message: 'success',
  }));
}
