import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';
import * as analyticsApi from '../api/analytics';
import type { AnalyticsMetric, CampaignComparison, TrendDataPoint, FunnelData } from '../api/types';

const timeRangeOptions = [
  { value: 'today', label: '今天' },
  { value: 'week', label: '最近7天' },
  { value: 'month', label: '最近30天' },
  { value: 'quarter', label: '最近90天' },
  { value: 'year', label: '今年' },
];

const chartTabs = [
  { key: 'spend', label: '消耗' },
  { key: 'clicks', label: '点击量' },
  { key: 'conversions', label: '转化' },
] as const;

export function Analytics() {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [comparison, setComparison] = useState<CampaignComparison[]>([]);
  const [trend, setTrend] = useState<TrendDataPoint[]>([]);
  const [funnel, setFunnel] = useState<FunnelData[]>([]);
  const [activeChart, setActiveChart] = useState<string>('spend');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getAnalyticsMetrics(),
      analyticsApi.getCampaignComparison(),
      analyticsApi.getTrendData(),
      analyticsApi.getFunnelData(),
    ]).then(([m, c, t, f]) => {
      setMetrics(m.data);
      setComparison(c.data);
      setTrend(t.data);
      setFunnel(f.data);
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
          <h1 className="text-2xl font-bold text-gray-900">数据分析</h1>
          <p className="mt-1 text-sm text-gray-600">深入了解您的广告投放效果</p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Download className="mr-2 h-4 w-4" />
            导出报告
          </button>
        </div>
      </div>

      {/* 性能指标卡片 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((item) => (
          <div key={item.metric} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{item.metric}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">{item.value}</p>
                  <p className="mt-1 text-sm text-gray-500">{item.period}对比</p>
                </div>
                <div className={`flex-shrink-0 flex items-center ${
                  item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.trend === 'up' ? (
                    <TrendingUp className="h-8 w-8" />
                  ) : (
                    <TrendingDown className="h-8 w-8" />
                  )}
                </div>
              </div>
              <div className="mt-4">
                <div className={`text-sm font-medium ${
                  item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 趋势图 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">投放趋势</h3>
            <div className="flex items-center space-x-2">
              {chartTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveChart(tab.key)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    activeChart === tab.key
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={activeChart}
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 转化漏斗 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">转化漏斗</h3>
            <select className="text-sm border-gray-300 rounded-md">
              <option>最近7天</option>
              <option>最近30天</option>
            </select>
          </div>
          <div className="space-y-4">
            {funnel.map((item) => (
              <div key={item.label} className="flex items-center">
                <div className="w-32 text-sm text-gray-600">{item.label}</div>
                <div className="flex-1 mx-4">
                  <div
                    className="h-6 rounded transition-all"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: `hsla(217, 91%, ${60 - (100 - item.percentage) * 0.3}%, 1)`,
                    }}
                  />
                </div>
                <div className="text-sm text-gray-900">
                  {item.value >= 1000000
                    ? `${(item.value / 1000000).toFixed(1)}M`
                    : item.value >= 1000
                    ? `${(item.value / 1000).toFixed(1)}K`
                    : item.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 计划对比 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">计划效果对比</h3>
          <p className="mt-1 text-sm text-gray-600">不同广告计划的投放表现</p>
        </div>
        <div className="p-6">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="spend" name="消耗 (¥)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conversions" name="转化量" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">计划名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">消耗金额</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">点击率 (%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">点击成本 (¥)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">转化量</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comparison.map((campaign, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥{campaign.spend.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.ctr}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥{campaign.cpc}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.conversions.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">查看详情</button>
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
