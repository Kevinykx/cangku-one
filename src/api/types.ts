export interface User {
  id: string;
  name: string;
  account: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'paused' | 'ended';
  budget: number;
  spend: number;
  ctr: number;
  cpc: number;
  impressions: number;
  clicks: number;
  startDate: string;
  endDate: string;
  creator: string;
}

export interface DashboardStat {
  name: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
}

export interface AnalyticsMetric {
  metric: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  period: string;
  trend: 'up' | 'down';
}

export interface CampaignComparison {
  name: string;
  spend: number;
  ctr: number;
  cpc: number;
  conversions: number;
}

export interface CreativeAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'text';
  category: string;
  size: string;
  format: string;
  sizeValue: number;
  usedIn: string[];
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  creator: string;
}

export interface TrendDataPoint {
  date: string;
  spend: number;
  clicks: number;
  conversions: number;
}

export interface FunnelData {
  label: string;
  value: number;
  percentage: number;
}

export type Permission = 'account_mgmt' | 'campaign_mgmt' | 'data_view' | 'finance' | 'creative_mgmt' | 'team_mgmt';

export interface TeamMember {
  id: string;
  name: string;
  account: string;
  password: string;
  role: 'admin' | 'operator' | 'finance' | 'viewer';
  permissions: Permission[];
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

export type MonitorMetric =
  | 'rio'
  | 'ltv'
  | 'cpm'
  | 'activations'
  | 'activation_cost'
  | 'conversions'
  | 'conversion_cost';

export type MonitorOperator = 'gte' | 'lte' | 'eq';

export interface AIMonitorRule {
  id: string;
  name: string;
  metric: MonitorMetric;
  metricLabel: string;
  operator: MonitorOperator;
  threshold: number;
  scope: 'all' | 'specific';
  campaignId?: string;
  campaignName?: string;
  status: 'active' | 'inactive';
  lastTriggered?: string;
  createdAt: string;
}

export interface AIMonitorLog {
  id: string;
  ruleId: string;
  ruleName: string;
  campaignId: string;
  campaignName: string;
  metricLabel: string;
  value: number;
  threshold: number;
  operatorLabel: string;
  action: 'stop_campaign';
  triggeredAt: string;
  status: 'executed' | 'failed';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}
