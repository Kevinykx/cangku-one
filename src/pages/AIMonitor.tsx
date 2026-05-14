import { useState, useEffect } from 'react';
import {
  Bot,
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Activity,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import * as aiMonitorApi from '../api/ai-monitor';
import type { AIMonitorRule, AIMonitorLog, MonitorMetric, MonitorOperator } from '../api/types';

const metricOptions: { value: MonitorMetric; label: string; unit: string }[] = [
  { value: 'rio', label: '当日变现RIO', unit: '' },
  { value: 'ltv', label: '当日LTV', unit: '' },
  { value: 'cpm', label: '平均千次展示费用', unit: '¥' },
  { value: 'activations', label: '激活', unit: '' },
  { value: 'activation_cost', label: '激活成本', unit: '¥' },
  { value: 'conversions', label: '转化', unit: '' },
  { value: 'conversion_cost', label: '转化成本', unit: '¥' },
];

const operatorOptions: { value: MonitorOperator; label: string }[] = [
  { value: 'gte', label: '大于等于' },
  { value: 'lte', label: '小于等于' },
  { value: 'eq', label: '等于' },
];

const operatorSymbols: Record<MonitorOperator, string> = {
  gte: '≥',
  lte: '≤',
  eq: '=',
};

const defaultForm = {
  name: '',
  metric: 'rio' as MonitorMetric,
  metricLabel: '当日变现RIO',
  operator: 'lte' as MonitorOperator,
  threshold: 0,
  scope: 'all' as 'all' | 'specific',
  campaignId: '',
  campaignName: '',
  status: 'active' as 'active' | 'inactive',
  lastTriggered: '-',
};

export function AIMonitor() {
  const [rules, setRules] = useState<AIMonitorRule[]>([]);
  const [logs, setLogs] = useState<AIMonitorLog[]>([]);
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AIMonitorRule | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [showLogs, setShowLogs] = useState(false);

  function loadData() {
    setLoading(true);
    Promise.all([
      aiMonitorApi.getMonitorRules(),
      aiMonitorApi.getMonitorLogs(),
      aiMonitorApi.getRunningCampaigns(),
    ]).then(([r, l, c]) => {
      setRules(r.data);
      setLogs(l.data);
      setCampaigns(c.data);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  const activeRules = rules.filter((r) => r.status === 'active');
  const recentTriggers = logs.filter((l) => l.status === 'executed').length;

  function openCreateModal() {
    setEditingRule(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEditModal(rule: AIMonitorRule) {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      metric: rule.metric,
      metricLabel: rule.metricLabel,
      operator: rule.operator,
      threshold: rule.threshold,
      scope: rule.scope,
      campaignId: rule.campaignId ?? '',
      campaignName: rule.campaignName ?? '',
      status: rule.status,
      lastTriggered: rule.lastTriggered ?? '-',
    });
    setModalOpen(true);
  }

  function handleMetricChange(metric: MonitorMetric) {
    const found = metricOptions.find((m) => m.value === metric);
    setForm({ ...form, metric, metricLabel: found?.label ?? metric });
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setModalOpen(false);

    const payload = {
      ...form,
      campaignId: form.scope === 'specific' ? form.campaignId : undefined,
      campaignName: form.scope === 'specific' ? form.campaignName : undefined,
    };

    if (editingRule) {
      const prev = rules.find((r) => r.id === editingRule.id);
      setRules((p) => p.map((r) => (r.id === editingRule.id ? { ...r, ...payload } : r)));
      try {
        await aiMonitorApi.updateMonitorRule(editingRule.id, payload);
      } catch {
        if (prev) setRules((p) => p.map((r) => (r.id === editingRule.id ? prev : r)));
      }
    } else {
      const optimisticId = `TEMP_${Date.now()}`;
      const optimistic: AIMonitorRule = { id: optimisticId, ...payload, createdAt: new Date().toISOString().slice(0, 10) };
      setRules((prev) => [optimistic, ...prev]);
      try {
        const res = await aiMonitorApi.createMonitorRule(payload);
        setRules((prev) => prev.map((r) => (r.id === optimisticId ? res.data : r)));
      } catch {
        setRules((prev) => prev.filter((r) => r.id !== optimisticId));
      }
    }
  }

  async function handleToggleStatus(rule: AIMonitorRule) {
    const newStatus = rule.status === 'active' ? 'inactive' : 'active';
    const prev = rules.find((r) => r.id === rule.id);
    setRules((p) => p.map((r) => (r.id === rule.id ? { ...r, status: newStatus } : r)));
    try {
      await aiMonitorApi.updateMonitorRule(rule.id, { status: newStatus });
    } catch {
      if (prev) setRules((p) => p.map((r) => (r.id === rule.id ? prev : r)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这条监控规则吗？')) return;
    const prev = rules.find((r) => r.id === id);
    setRules((p) => p.filter((r) => r.id !== id));
    try {
      await aiMonitorApi.deleteMonitorRule(id);
    } catch {
      if (prev) setRules((p) => [...p, prev]);
    }
  }

  const filteredRules = rules.filter((r) => {
    if (search && !r.name.includes(search) && !r.metricLabel.includes(search)) return false;
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">AI 盯盘</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Bot className="mr-1 h-3 w-3" />
              智能监控
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">设置监控规则，当数据指标触发条件时自动关停广告计划</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${masterEnabled ? 'text-green-600' : 'text-gray-500'}`}>
              {masterEnabled ? '监控运行中' : '已暂停'}
            </span>
            <button
              onClick={() => setMasterEnabled(!masterEnabled)}
              className={`toggle-switch relative inline-flex h-6 w-11 items-center rounded-full ${
                masterEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white ${
                masterEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            新建规则
          </button>
        </div>
      </div>

      {/* 状态卡片 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">监控规则</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{rules.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-green-600">已启用 {activeRules.length} 条</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">覆盖计划</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {rules.filter((r) => r.scope === 'all').length > 0 ? '全部' : campaigns.length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {rules.filter((r) => r.scope === 'specific').length} 条指定计划规则
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">执行次数</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{recentTriggers}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">累计关停次数</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">监控状态</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {masterEnabled ? '运行中' : '已暂停'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${masterEnabled ? 'bg-green-50' : 'bg-gray-100'}`}>
              {masterEnabled ? (
                <Power className="h-6 w-6 text-green-600" />
              ) : (
                <PowerOff className="h-6 w-6 text-gray-500" />
              )}
            </div>
          </div>
          <p className={`mt-2 text-sm ${masterEnabled ? 'text-green-600' : 'text-gray-500'}`}>
            {masterEnabled ? '正在监控数据变化' : '暂不执行监控规则'}
          </p>
        </div>
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
                placeholder="搜索规则名称或指标..."
              />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            共 <span className="font-medium">{filteredRules.length}</span> 条规则
          </div>
        </div>
      </div>

      {/* 规则列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {filteredRules.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {search ? '没有匹配的规则' : '暂无监控规则，点击上方按钮创建'}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">规则名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">监控指标</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">触发条件</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作用范围</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最近触发</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRules.map((rule) => {
                  const metricDef = metricOptions.find((m) => m.value === rule.metric);
                  const unit = metricDef?.unit ?? '';
                  return (
                    <tr key={rule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Bot className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{rule.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.metricLabel}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                          {operatorSymbols[rule.operator]} {unit}{rule.threshold}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rule.scope === 'all' ? (
                          <span className="text-gray-500">全部计划</span>
                        ) : (
                          <span>{rule.campaignName}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(rule)}
                          className={`toggle-switch relative inline-flex h-6 w-11 items-center rounded-full ${
                            rule.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 rounded-full bg-white ${
                            rule.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rule.lastTriggered && rule.lastTriggered !== '-' ? rule.lastTriggered : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button onClick={() => openEditModal(rule)} className="text-blue-600 hover:text-blue-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(rule.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 活动日志 */}
      <div className="bg-white shadow rounded-lg">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">执行记录</h3>
            <span className="ml-2 text-sm text-gray-500">（{logs.length} 条）</span>
          </div>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${showLogs ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showLogs && (
          <div className="overflow-x-auto">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无执行记录</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">规则</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">计划</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指标</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">实际值</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">触发条件</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">结果</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.ruleName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.campaignName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.metricLabel}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.value}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                          {log.operatorLabel} {log.threshold}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">关停计划</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.triggeredAt}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.status === 'executed' ? (
                          <span className="inline-flex items-center text-xs font-medium text-green-600">
                            <CheckCircle className="mr-1 h-3 w-3" /> 已执行
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-medium text-red-600">
                            <XCircle className="mr-1 h-3 w-3" /> 失败
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* 新建/编辑规则弹窗 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setModalOpen(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Bot className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingRule ? '编辑规则' : '新建规则'}
                  </h3>
                </div>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">规则名称</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="例如：RIO 过低预警"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">监控指标</label>
                  <select
                    value={form.metric}
                    onChange={(e) => handleMetricChange(e.target.value as MonitorMetric)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {metricOptions.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">触发条件</label>
                    <select
                      value={form.operator}
                      onChange={(e) => setForm({ ...form, operator: e.target.value as MonitorOperator })}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      {operatorOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">阈值</label>
                    <div className="relative">
                      {metricOptions.find((m) => m.value === form.metric)?.unit && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">
                            {metricOptions.find((m) => m.value === form.metric)?.unit}
                          </span>
                        </div>
                      )}
                      <input
                        type="number"
                        value={form.threshold}
                        onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })}
                        className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          metricOptions.find((m) => m.value === form.metric)?.unit ? 'pl-8' : ''
                        }`}
                        placeholder="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">作用范围</label>
                  <div className="flex items-center space-x-4 mb-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={form.scope === 'all'}
                        onChange={() => setForm({ ...form, scope: 'all', campaignId: '', campaignName: '' })}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">所有计划</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={form.scope === 'specific'}
                        onChange={() => setForm({ ...form, scope: 'specific' })}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">指定计划</span>
                    </label>
                  </div>
                  {form.scope === 'specific' && (
                    <select
                      value={form.campaignId}
                      onChange={(e) => {
                        const c = campaigns.find((c) => c.id === e.target.value);
                        setForm({ ...form, campaignId: e.target.value, campaignName: c?.name ?? '' });
                      }}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">请选择计划</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">执行动作</label>
                  <div className="flex items-center px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm text-gray-700">关停广告计划</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.name.trim() || (form.scope === 'specific' && !form.campaignId)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingRule ? '保存修改' : '创建规则'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
