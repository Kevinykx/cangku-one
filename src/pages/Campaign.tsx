import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Edit,
  Trash2,
  Download,
  Upload,
  Zap,
} from 'lucide-react';
import * as campaignApi from '../api/campaign';
import type { Campaign } from '../api/types';

export function Campaign() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [boostToggling, setBoostToggling] = useState(false);
  const navigate = useNavigate();

  function loadCampaigns() {
    setLoading(true);
    campaignApi.getCampaigns().then((res) => {
      setCampaigns(res.data);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function handleToggleStatus(campaign: Campaign) {
    const newStatus = campaign.status === 'running' ? 'paused' : 'running';
    const prev = campaigns.find(c => c.id === campaign.id);
    setCampaigns(prev => prev.map(c =>
      c.id === campaign.id ? { ...c, status: newStatus } : c
    ));
    try {
      await campaignApi.updateCampaign(campaign.id, { status: newStatus });
    } catch {
      if (prev) setCampaigns(p => p.map(c => c.id === campaign.id ? prev : c));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个广告计划吗？')) return;
    const prev = campaigns.find(c => c.id === id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
    try {
      await campaignApi.deleteCampaign(id);
    } catch {
      if (prev) setCampaigns(p => [...p, prev]);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.size === filtered.length && filtered.length > 0
        ? new Set()
        : new Set(filtered.map((c) => c.id))
    );
  }

  async function handleToggleBoost(campaign: Campaign) {
    const newBoosted = !campaign.boosted;
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaign.id ? { ...c, boosted: newBoosted } : c))
    );
    try {
      await campaignApi.updateCampaign(campaign.id, { boosted: newBoosted });
    } catch {
      loadCampaigns();
    }
  }

  async function handleBatchToggleBoost(boosted: boolean) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBoostToggling(true);
    setCampaigns((prev) =>
      prev.map((c) => (ids.includes(c.id) ? { ...c, boosted } : c))
    );
    setSelectedIds(new Set());
    try {
      await campaignApi.batchToggleBoost(ids, boosted);
    } catch {
      loadCampaigns();
    } finally {
      setBoostToggling(false);
    }
  }

  const filtered = campaigns.filter((c) => {
    if (search && !c.name.includes(search)) return false;
    if (filterType && c.type !== filterType) return false;
    if (filterStatus) {
      const statusMap: Record<string, string> = { 运行中: 'running', 已暂停: 'paused', 已结束: 'ended' };
      if (c.status !== statusMap[filterStatus]) return false;
    }
    return true;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">投放工具</h1>
          <p className="mt-1 text-sm text-gray-600">创建和管理您的广告计划</p>
        </div>
        <button
          onClick={() => navigate('/campaign/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          创建广告
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="搜索广告计划..."
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">全部类型</option>
              <option value="电商推广">电商推广</option>
              <option value="品牌宣传">品牌宣传</option>
              <option value="应用推广">应用推广</option>
              <option value="游戏推广">游戏推广</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">全部状态</option>
              <option value="运行中">运行中</option>
              <option value="已暂停">已暂停</option>
              <option value="已结束">已结束</option>
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="mr-2 h-4 w-4" />
              筛选
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Download className="mr-2 h-4 w-4" />
              导出
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Upload className="mr-2 h-4 w-4" />
              导入
            </button>
          </div>
        </div>
      </div>

      {/* 批量操作栏 */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-blue-700">
            已选择 <span className="font-semibold">{selectedIds.size}</span> 条广告计划
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleBatchToggleBoost(true)}
              disabled={boostToggling}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Zap className="mr-1.5 h-4 w-4" />
              一键起量
            </button>
            <button
              onClick={() => handleBatchToggleBoost(false)}
              disabled={boostToggling}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              关闭起量
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              取消选择
            </button>
          </div>
        </div>
      )}

      {/* 广告计划列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无广告计划
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">计划名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预算</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">消耗</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">点击率</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">展示量</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">起量</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(campaign.id)}
                        onChange={() => toggleSelect(campaign.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{campaign.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campaign.status === 'running' ? 'bg-green-100 text-green-800'
                        : campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status === 'running' ? (
                          <><Play className="mr-1 h-3 w-3" />运行中</>
                        ) : campaign.status === 'paused' ? (
                          <><Pause className="mr-1 h-3 w-3" />已暂停</>
                        ) : '已结束'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥{campaign.budget.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{campaign.spend.toLocaleString()}
                      <div className="text-xs text-gray-500">
                        占比 {campaign.budget > 0 ? Math.round((campaign.spend / campaign.budget) * 100) : 0}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.ctr}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.impressions >= 1000000
                        ? `${(campaign.impressions / 1000000).toFixed(1)}M`
                        : campaign.impressions >= 1000
                        ? `${(campaign.impressions / 1000).toFixed(0)}K`
                        : campaign.impressions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.creator}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleBoost(campaign)}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          campaign.boosted ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                          campaign.boosted ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => navigate(`/campaign/${campaign.id}/edit`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {campaign.status === 'running' && (
                        <button onClick={() => handleToggleStatus(campaign)} className="text-yellow-600 hover:text-yellow-900">
                          <Pause className="h-4 w-4" />
                        </button>
                      )}
                      {campaign.status === 'paused' && (
                        <button onClick={() => handleToggleStatus(campaign)} className="text-green-600 hover:text-green-900">
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(campaign.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 分页 */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                显示第 <span className="font-medium">1</span> 到 <span className="font-medium">{filtered.length}</span> 条，
                共 <span className="font-medium">{filtered.length}</span> 条记录
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
