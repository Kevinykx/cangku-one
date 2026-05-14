import { useState, useEffect } from 'react';
import {
  BarChart3,
  Megaphone,
  TrendingUp,
  DollarSign,
  Users,
  Play,
  Pause,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as dashboardApi from '../api/dashboard';
import type { DashboardStat, Campaign } from '../api/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  DollarSign, Megaphone, BarChart3, TrendingUp,
};

const quickActions = [
  { name: '创建广告计划', icon: Plus, href: '/campaign/new', color: 'bg-blue-600' },
  { name: '数据分析', icon: BarChart3, href: '/analytics', color: 'bg-green-600' },
  { name: '创意中心', icon: Play, href: '/creative', color: 'bg-purple-600' },
  { name: '团队管理', icon: Users, href: '/team', color: 'bg-orange-600' },
];

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      dashboardApi.getDashboardStats(),
      dashboardApi.getRecentCampaigns(),
    ]).then(([s, c]) => {
      setStats(s.data);
      setCampaigns(c.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表板</h1>
          <p className="mt-1 text-sm text-gray-600">管理您的巨量引擎广告投放</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon] || BarChart3;
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-2 rounded-md ${stat.changeType === 'positive' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Icon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                          <span>{stat.change}</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 快捷操作 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">快捷操作</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={() => navigate(action.href)}
                className={`group inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white shadow-sm transition-all hover:shadow-md ${action.color}`}
              >
                <action.icon className="mr-2 h-5 w-5" />
                {action.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 最近广告计划 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">最近广告计划</h3>
            <button onClick={() => navigate('/campaign')} className="text-sm font-medium text-blue-600 hover:text-blue-500">
              查看全部
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">计划名称</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">消耗</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">点击率</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">展示量</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {campaign.status === 'running' ? (
                        <><Play className="mr-1 h-3 w-3" />运行中</>
                      ) : (
                        <><Pause className="mr-1 h-3 w-3" />已暂停</>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥{campaign.spend.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.ctr}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.impressions >= 1000000 ? `${(campaign.impressions / 1000000).toFixed(1)}M` : campaign.impressions >= 1000 ? `${(campaign.impressions / 1000).toFixed(0)}K` : campaign.impressions.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.startDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">编辑</button>
                    <button className="text-gray-600 hover:text-gray-900">复制</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
