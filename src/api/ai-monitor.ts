import { mockResponse } from './client';
import { mockMonitorRules, mockMonitorLogs, mockAllCampaigns } from './mock-data';
import type { AIMonitorRule, AIMonitorLog } from './types';

let rules = [...mockMonitorRules];
let nextRuleId = rules.length + 1;

export async function getMonitorRules() {
  return mockResponse<AIMonitorRule[]>([...rules]);
}

export async function getMonitorLogs() {
  return mockResponse<AIMonitorLog[]>([...mockMonitorLogs]);
}

export async function getRunningCampaigns() {
  const running = mockAllCampaigns.filter((c) => c.status === 'running');
  return mockResponse(running.map((c) => ({ id: c.id, name: c.name })));
}

export async function createMonitorRule(data: Omit<AIMonitorRule, 'id' | 'createdAt'>) {
  const newRule: AIMonitorRule = {
    ...data,
    id: `R${String(nextRuleId++).padStart(3, '0')}`,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  rules.unshift(newRule);
  return mockResponse(newRule);
}

export async function updateMonitorRule(id: string, data: Partial<AIMonitorRule>) {
  const index = rules.findIndex((r) => r.id === id);
  if (index === -1) return { code: 404, data: null as unknown as AIMonitorRule, message: '未找到' };
  rules[index] = { ...rules[index], ...data };
  return mockResponse(rules[index]);
}

export async function deleteMonitorRule(id: string) {
  rules = rules.filter((r) => r.id !== id);
  return mockResponse(null);
}
