import type {
  User,
  Campaign,
  DashboardStat,
  AnalyticsMetric,
  CampaignComparison,
  CreativeAsset,
  TrendDataPoint,
  FunnelData,
  TeamMember,
  AIMonitorRule,
  AIMonitorLog,
} from './types';

export const mockUser: User = {
  id: 'u001',
  name: '张明',
  account: 'zhangming',
  email: 'zhangming@example.com',
  phone: '138-0000-0001',
};

export const mockStats: DashboardStat[] = [
  { name: '今日消耗', value: '¥12,580', change: '+12.5%', changeType: 'positive', icon: 'DollarSign' },
  { name: '活跃广告', value: '28', change: '+3', changeType: 'positive', icon: 'Megaphone' },
  { name: '展示量', value: '2.4M', change: '+8.2%', changeType: 'positive', icon: 'BarChart3' },
  { name: '点击率', value: '3.24%', change: '-0.5%', changeType: 'negative', icon: 'TrendingUp' },
];

export const mockRecentCampaigns: Campaign[] = [
  {
    id: 'CAM001', name: '618大促活动', type: '电商推广', status: 'running',
    budget: 50000, spend: 8420, ctr: 3.8, cpc: 1.2, impressions: 1200000, clicks: 32450,
    startDate: '2024-05-01', endDate: '2024-06-18', creator: '张三',
  },
  {
    id: 'CAM002', name: '新品推广', type: '品牌宣传', status: 'paused',
    budget: 30000, spend: 3260, ctr: 2.1, cpc: 1.8, impressions: 580000, clicks: 10112,
    startDate: '2024-05-08', endDate: '2024-05-31', creator: '李四',
  },
  {
    id: 'CAM003', name: '品牌宣传', type: '品牌宣传', status: 'running',
    budget: 20000, spend: 980, ctr: 4.2, cpc: 0.9, impressions: 230000, clicks: 10889,
    startDate: '2024-05-05', endDate: '2024-05-20', creator: '王五',
  },
];

export const mockAllCampaigns: Campaign[] = [
  ...mockRecentCampaigns,
  {
    id: 'CAM004', name: 'App下载', type: '应用推广', status: 'ended',
    budget: 40000, spend: 38900, ctr: 2.8, cpc: 2.5, impressions: 2100000, clicks: 15560,
    startDate: '2024-04-01', endDate: '2024-04-30', creator: '赵六',
  },
];

export const mockAnalyticsMetrics: AnalyticsMetric[] = [
  { metric: '消耗金额', value: '¥125,800', change: '+12.5%', changeType: 'positive', period: '本月', trend: 'up' },
  { metric: '展示量', value: '12.4M', change: '+8.2%', changeType: 'positive', period: '本月', trend: 'up' },
  { metric: '点击量', value: '324,500', change: '+15.3%', changeType: 'positive', period: '本月', trend: 'up' },
  { metric: '点击率', value: '2.68%', change: '-0.5%', changeType: 'negative', period: '本月', trend: 'down' },
  { metric: '平均点击成本', value: '¥0.38', change: '-3.2%', changeType: 'positive', period: '本月', trend: 'down' },
  { metric: '转化率', value: '4.2%', change: '+0.8%', changeType: 'positive', period: '本月', trend: 'up' },
];

export const mockCampaignComparison: CampaignComparison[] = [
  { name: '618大促活动', spend: 82450, ctr: 3.8, cpc: 1.2, conversions: 1250 },
  { name: '新品推广', spend: 18200, ctr: 2.1, cpc: 1.8, conversions: 480 },
  { name: '品牌宣传', spend: 9800, ctr: 4.2, cpc: 0.9, conversions: 320 },
  { name: 'App下载', spend: 38900, ctr: 2.8, cpc: 2.5, conversions: 890 },
];

export const mockTrendData: TrendDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: `2024-05-${String(i + 1).padStart(2, '0')}`,
  spend: Math.round(3000 + Math.random() * 5000),
  clicks: Math.round(8000 + Math.random() * 12000),
  conversions: Math.round(200 + Math.random() * 600),
}));

export const mockFunnelData: FunnelData[] = [
  { label: '曝光', value: 12400000, percentage: 100 },
  { label: '点击', value: 324500, percentage: 35 },
  { label: '访问', value: 180200, percentage: 25 },
  { label: '转化', value: 29400, percentage: 8 },
];

export const mockTeamMembers: TeamMember[] = [
  { id: 'T001', name: '张明', account: 'zhangming', password: 'Admin@123', role: 'admin', permissions: ['account_mgmt','campaign_mgmt','data_view','finance','creative_mgmt','team_mgmt'], status: 'active', lastLogin: '2024-05-14 09:30', createdAt: '2024-01-15' },
  { id: 'T002', name: '李丽', account: 'lili', password: 'LiLi@456', role: 'operator', permissions: ['campaign_mgmt','data_view','creative_mgmt'], status: 'active', lastLogin: '2024-05-13 14:22', createdAt: '2024-02-20' },
  { id: 'T003', name: '王强', account: 'wangqiang', password: 'Wq@789', role: 'operator', permissions: ['campaign_mgmt','data_view','creative_mgmt'], status: 'active', lastLogin: '2024-05-14 11:05', createdAt: '2024-02-28' },
  { id: 'T004', name: '赵芳', account: 'zhaofang', password: 'Zf@000', role: 'finance', permissions: ['data_view','finance'], status: 'active', lastLogin: '2024-05-12 16:48', createdAt: '2024-03-05' },
  { id: 'T005', name: '刘洋', account: 'liuyang', password: 'Ly@111', role: 'viewer', permissions: ['data_view'], status: 'inactive', lastLogin: '2024-04-28 10:15', createdAt: '2024-03-10' },
  { id: 'T006', name: '陈静', account: 'chenjing', password: 'Cj@222', role: 'operator', permissions: ['campaign_mgmt','data_view','creative_mgmt'], status: 'active', lastLogin: '2024-05-14 08:50', createdAt: '2024-03-15' },
  { id: 'T007', name: '孙磊', account: 'sunlei', password: 'Sl@333', role: 'viewer', permissions: ['data_view'], status: 'inactive', lastLogin: '2024-04-20 09:00', createdAt: '2024-03-20' },
  { id: 'T008', name: '周婷', account: 'zhouting', password: 'Zt@444', role: 'admin', permissions: ['account_mgmt','campaign_mgmt','data_view','finance','creative_mgmt','team_mgmt'], status: 'active', lastLogin: '2024-05-14 12:00', createdAt: '2024-04-01' },
];

export const mockMonitorRules: AIMonitorRule[] = [
  {
    id: 'R001', name: 'RIO 过低预警', metric: 'rio', metricLabel: '当日变现RIO',
    operator: 'lte', threshold: 1.5, scope: 'all', status: 'active',
    lastTriggered: '2024-05-14 10:32', createdAt: '2024-05-01',
  },
  {
    id: 'R002', name: '激活成本超标', metric: 'activation_cost', metricLabel: '激活成本',
    operator: 'gte', threshold: 15, scope: 'specific', campaignId: 'CAM001', campaignName: '618大促活动',
    status: 'active', lastTriggered: '2024-05-13 14:15', createdAt: '2024-05-01',
  },
  {
    id: 'R003', name: '千次展示费用监控', metric: 'cpm', metricLabel: '平均千次展示费用',
    operator: 'gte', threshold: 50, scope: 'all', status: 'active',
    lastTriggered: '-', createdAt: '2024-05-05',
  },
  {
    id: 'R004', name: 'LTV 达标检测', metric: 'ltv', metricLabel: '当日LTV',
    operator: 'lte', threshold: 3.0, scope: 'all', status: 'inactive',
    lastTriggered: '-', createdAt: '2024-05-08',
  },
  {
    id: 'R005', name: '转化量过低关停', metric: 'conversions', metricLabel: '转化',
    operator: 'lte', threshold: 100, scope: 'specific', campaignId: 'CAM003', campaignName: '品牌宣传',
    status: 'active', lastTriggered: '-', createdAt: '2024-05-10',
  },
];

export const mockMonitorLogs: AIMonitorLog[] = [
  {
    id: 'L001', ruleId: 'R001', ruleName: 'RIO 过低预警',
    campaignId: 'CAM001', campaignName: '618大促活动',
    metricLabel: '当日变现RIO', value: 1.02, threshold: 1.5, operatorLabel: '小于等于',
    action: 'stop_campaign', triggeredAt: '2024-05-14 10:32', status: 'executed',
  },
  {
    id: 'L002', ruleId: 'R002', ruleName: '激活成本超标',
    campaignId: 'CAM001', campaignName: '618大促活动',
    metricLabel: '激活成本', value: 18.5, threshold: 15, operatorLabel: '大于等于',
    action: 'stop_campaign', triggeredAt: '2024-05-13 14:15', status: 'executed',
  },
  {
    id: 'L003', ruleId: 'R001', ruleName: 'RIO 过低预警',
    campaignId: 'CAM002', campaignName: '新品推广',
    metricLabel: '当日变现RIO', value: 0.85, threshold: 1.5, operatorLabel: '小于等于',
    action: 'stop_campaign', triggeredAt: '2024-05-12 09:45', status: 'executed',
  },
  {
    id: 'L004', ruleId: 'R003', ruleName: '千次展示费用监控',
    campaignId: 'CAM004', campaignName: 'App下载',
    metricLabel: '平均千次展示费用', value: 62.3, threshold: 50, operatorLabel: '大于等于',
    action: 'stop_campaign', triggeredAt: '2024-05-11 16:20', status: 'failed',
  },
];

export const mockCreativeAssets: CreativeAsset[] = [
  { id: 'CR001', name: '618主视觉设计', type: 'image', category: 'Banner', size: '1200x628', format: 'PNG', sizeValue: 2.4, usedIn: ['618大促活动', '首页Banner'], status: 'active', createdAt: '2024-05-10', creator: '张三' },
  { id: 'CR002', name: '产品介绍视频', type: 'video', category: '视频广告', size: '1920x1080', format: 'MP4', sizeValue: 15.8, usedIn: ['新品推广'], status: 'active', createdAt: '2024-05-08', creator: '李四' },
  { id: 'CR003', name: '促销文案', type: 'text', category: '文案素材', size: '-', format: 'DOCX', sizeValue: 0.1, usedIn: ['618大促活动'], status: 'draft', createdAt: '2024-05-12', creator: '王五' },
  { id: 'CR004', name: '品牌Logo', type: 'image', category: 'Logo', size: '1024x1024', format: 'SVG', sizeValue: 0.5, usedIn: ['品牌宣传', '新品推广'], status: 'active', createdAt: '2024-05-01', creator: '赵六' },
  { id: 'CR005', name: '活动海报', type: 'image', category: '海报', size: '750x1334', format: 'JPG', sizeValue: 3.2, usedIn: ['618大促活动'], status: 'archived', createdAt: '2024-04-28', creator: '张三' },
];
