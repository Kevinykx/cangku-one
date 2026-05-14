import { mockResponse } from './client';
import { mockAllCampaigns } from './mock-data';
import type { Campaign } from './types';

let campaigns = [...mockAllCampaigns];
let nextId = campaigns.length + 1;

export async function getCampaigns() {
  return mockResponse<Campaign[]>([...campaigns]);
}

export async function getCampaignById(id: string) {
  const item = campaigns.find((c) => c.id === id);
  if (!item) return { code: 404, data: null as unknown as Campaign, message: '未找到' };
  return mockResponse({ ...item });
}

export async function createCampaign(data: Omit<Campaign, 'id' | 'creator' | 'createdAt'>) {
  const newCampaign: Campaign = {
    ...data,
    id: `CAM${String(nextId++).padStart(3, '0')}`,
    creator: '当前用户',
  };
  campaigns.unshift(newCampaign);
  return mockResponse(newCampaign);
}

export async function updateCampaign(id: string, data: Partial<Campaign>) {
  const index = campaigns.findIndex((c) => c.id === id);
  if (index === -1) return { code: 404, data: null as unknown as Campaign, message: '未找到' };
  campaigns[index] = { ...campaigns[index], ...data };
  return mockResponse(campaigns[index]);
}

export async function deleteCampaign(id: string) {
  campaigns = campaigns.filter((c) => c.id !== id);
  return mockResponse(null);
}

export async function batchDeleteCampaigns(ids: string[]) {
  campaigns = campaigns.filter((c) => !ids.includes(c.id));
  return mockResponse({ deletedCount: ids.length });
}

export async function batchToggleBoost(ids: string[], boosted: boolean) {
  campaigns = campaigns.map((c) =>
    ids.includes(c.id) ? { ...c, boosted } : c
  );
  return mockResponse({ updatedCount: ids.length });
}

export interface CleanupSchedule {
  enabled: boolean;
  intervalHours: number;
  conditions: {
    nameKeyword?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    noSpendHours?: number;
  };
  lastRun?: string;
  nextRun?: string;
}

let cleanupSchedule: CleanupSchedule | null = null;

export async function getCleanupSchedule() {
  return mockResponse<CleanupSchedule | null>(cleanupSchedule);
}

export async function saveCleanupSchedule(schedule: CleanupSchedule) {
  cleanupSchedule = schedule;
  return mockResponse(schedule);
}

export async function deleteCampaignsByConditions(conditions: {
  nameKeyword?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  noSpendHours?: number;
}) {
  const matched = campaigns.filter((c) => {
    if (conditions.nameKeyword && !c.name.includes(conditions.nameKeyword)) return false;
    if (conditions.dateFrom && c.startDate < conditions.dateFrom) return false;
    if (conditions.dateTo && c.startDate > conditions.dateTo) return false;
    if (conditions.status && conditions.status !== 'all') {
      if (c.status !== conditions.status) return false;
    }
    if (conditions.noSpendHours && conditions.noSpendHours > 0) {
      if (c.spend > 0) return false;
    }
    return true;
  });
  const ids = matched.map((c) => c.id);
  campaigns = campaigns.filter((c) => !ids.includes(c.id));
  return mockResponse({ deletedCount: ids.length, campaigns: matched });
}
