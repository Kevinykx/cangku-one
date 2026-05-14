import { mockResponse } from './client';
import { mockAnalyticsMetrics, mockCampaignComparison, mockTrendData, mockFunnelData } from './mock-data';
import type { AnalyticsMetric, CampaignComparison, TrendDataPoint, FunnelData } from './types';

export async function getAnalyticsMetrics() {
  return mockResponse<AnalyticsMetric[]>(mockAnalyticsMetrics);
}

export async function getCampaignComparison() {
  return mockResponse<CampaignComparison[]>(mockCampaignComparison);
}

export async function getTrendData() {
  return mockResponse<TrendDataPoint[]>(mockTrendData);
}

export async function getFunnelData() {
  return mockResponse<FunnelData[]>(mockFunnelData);
}
