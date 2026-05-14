import { mockResponse } from './client';
import { mockStats, mockRecentCampaigns } from './mock-data';
import type { DashboardStat, Campaign } from './types';

export async function getDashboardStats() {
  return mockResponse<DashboardStat[]>(mockStats);
}

export async function getRecentCampaigns() {
  return mockResponse<Campaign[]>(mockRecentCampaigns);
}
