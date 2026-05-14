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
