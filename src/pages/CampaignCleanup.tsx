import { useState, useEffect, useRef } from 'react';
import { Search, Trash2, Clock, AlertTriangle, Calendar, Filter as FilterIcon, X } from 'lucide-react';
import * as campaignApi from '../api/campaign';
import type { Campaign } from '../api/types';

export function CampaignCleanup() {
  const [, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Filter conditions
  const [nameKeyword, setNameKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [noSpendHours, setNoSpendHours] = useState<number | ''>('');

  // Results
  const [matchedCampaigns, setMatchedCampaigns] = useState<Campaign[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === matchedCampaigns.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(matchedCampaigns.map((c) => c.id)));
    }
  }

  // Scheduled cleanup
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [intervalHours, setIntervalHours] = useState(24);
  const [scheduleSaved, setScheduleSaved] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);
  const scheduleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => {
    campaignApi.getCleanupSchedule().then((res) => {
      if (res.data) {
        setScheduleEnabled(res.data.enabled);
        setIntervalHours(res.data.intervalHours);
        setNameKeyword(res.data.conditions.nameKeyword || '');
        setDateFrom(res.data.conditions.dateFrom || '');
        setDateTo(res.data.conditions.dateTo || '');
        setFilterStatus(res.data.conditions.status || '');
        setNoSpendHours(res.data.conditions.noSpendHours ?? '');
        setLastRunTime(res.data.lastRun || null);
      }
    });
  }, []);

  useEffect(() => {
    if (scheduleEnabled && intervalHours > 0) {
      const ms = intervalHours * 60 * 60 * 1000;
      scheduleTimerRef.current = setInterval(async () => {
        const conditions: Record<string, unknown> = {};
        if (nameKeyword) conditions.nameKeyword = nameKeyword;
        if (dateFrom) conditions.dateFrom = dateFrom;
        if (dateTo) conditions.dateTo = dateTo;
        if (filterStatus) conditions.status = filterStatus;
        if (noSpendHours) conditions.noSpendHours = noSpendHours;
        await campaignApi.deleteCampaignsByConditions(conditions);
        const now = new Date().toLocaleString('zh-CN');
        setLastRunTime(now);
        loadCampaigns();
      }, ms);
    }
    return () => {
      if (scheduleTimerRef.current) {
        clearInterval(scheduleTimerRef.current);
        scheduleTimerRef.current = null;
      }
    };
  }, [scheduleEnabled, intervalHours, nameKeyword, dateFrom, dateTo, filterStatus, noSpendHours]);

  async function handleSearch() {
    setSearching(true);
    setHasSearched(true);
    const res = await campaignApi.getCampaigns();
    const all = res.data;
    const filtered = all.filter((c) => {
      if (nameKeyword && !c.name.includes(nameKeyword)) return false;
      if (dateFrom && c.startDate < dateFrom) return false;
      if (dateTo && c.startDate > dateTo) return false;
      if (filterStatus && filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (noSpendHours && noSpendHours > 0 && c.spend > 0) return false;
      return true;
    });
    setMatchedCampaigns(filtered);
    setSelectedIds(new Set());
    setSearching(false);
  }

  async function handleDeleteSelected() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (!confirm(`确定要删除选中的 ${ids.length} 条广告计划吗？此操作不可撤销。`)) return;
    await campaignApi.batchDeleteCampaigns(ids);
    loadCampaigns();
    setMatchedCampaigns((prev) => prev.filter((c) => !ids.includes(c.id)));
    setSelectedIds(new Set());
  }

  async function handleDeleteOne(c: Campaign) {
    if (!confirm(`确定要删除计划"${c.name}"吗？`)) return;
    await campaignApi.deleteCampaign(c.id);
    loadCampaigns();
    setMatchedCampaigns((prev) => prev.filter((x) => x.id !== c.id));
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(c.id); return next; });
  }

  async function handleSaveSchedule() {
    const conditions: Record<string, unknown> = {};
    if (nameKeyword) conditions.nameKeyword = nameKeyword;
    if (dateFrom) conditions.dateFrom = dateFrom;
    if (dateTo) conditions.dateTo = dateTo;
    if (filterStatus) conditions.status = filterStatus;
    if (noSpendHours) conditions.noSpendHours = noSpendHours;

    const now = new Date();
    const nextRun = new Date(now.getTime() + intervalHours * 60 * 60 * 1000);

    await campaignApi.saveCleanupSchedule({
      enabled: scheduleEnabled,
      intervalHours,
      conditions: conditions as campaignApi.CleanupSchedule['conditions'],
      lastRun: lastRunTime || undefined,
      nextRun: nextRun.toLocaleString('zh-CN'),
    });
    setScheduleSaved(true);
    setTimeout(() => setScheduleSaved(false), 2000);
  }

  function clearFilters() {
    setNameKeyword('');
    setDateFrom('');
    setDateTo('');
    setFilterStatus('');
    setNoSpendHours('');
  }

  const statusLabel = (s: string) =>
    s === 'running' ? '运行中' : s === 'paused' ? '已暂停' : '已结束';

  const statusColor = (s: string) =>
    s === 'running'
      ? 'bg-green-100 text-green-800'
      : s === 'paused'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-gray-100 text-gray-800';

  const hasAnyFilter = nameKeyword || dateFrom || dateTo || filterStatus || (noSpendHours !== '' && noSpendHours > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">计划清理</h1>
          <p className="mt-1 text-sm text-gray-500">批量删除符合条件的广告计划，支持定时自动清理</p>
        </div>
        {selectedIds.size > 0 && (
          <button
            onClick={handleDeleteSelected}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除选中 {selectedIds.size} 条
          </button>
        )}
      </div>

      {/* Quick filter bar — compact, toolbar-style */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <FilterIcon className="w-4 h-4" />
            <span>筛选条件</span>
          </div>
          {hasAnyFilter && (
            <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
              <X className="w-3 h-3 mr-1" />清空
            </button>
          )}
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">计划名称</label>
              <input
                type="text"
                value={nameKeyword}
                onChange={(e) => setNameKeyword(e.target.value)}
                placeholder="模糊搜索..."
                className="block w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">搭建时间</label>
              <div className="flex items-center space-x-1">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="block w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-400">~</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="block w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">计划状态</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">全部</option>
                <option value="running">运行中</option>
                <option value="paused">已暂停</option>
                <option value="ended">已结束</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">无消耗</label>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">近</span>
                <input
                  type="number"
                  min={1}
                  value={noSpendHours}
                  onChange={(e) => setNoSpendHours(e.target.value ? Number(e.target.value) : '')}
                  placeholder="24"
                  className="block w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-xs text-gray-500">小时</span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={handleSearch}
              disabled={searching}
              className="inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Search className="mr-1.5 h-3.5 w-3.5" />
              {searching ? '查询中...' : '查询'}
            </button>
          </div>
        </div>
      </div>

      {/* Results — card list style */}
      {hasSearched && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-sm">
              {matchedCampaigns.length > 0 && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === matchedCampaigns.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500 select-none">全选</span>
                </label>
              )}
              <span className="text-gray-700 font-medium">匹配结果</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                matchedCampaigns.length > 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {matchedCampaigns.length} 条
              </span>
              {selectedIds.size > 0 && (
                <span className="text-xs text-blue-600">已选 {selectedIds.size} 条</span>
              )}
            </div>
            {selectedIds.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center px-3 py-1.5 border border-red-200 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                删除选中
              </button>
            )}
          </div>

          {matchedCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <AlertTriangle className="w-10 h-10 mb-2" />
              <p className="text-sm">没有找到匹配的广告计划</p>
              <p className="text-xs mt-1">试试调整筛选条件</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {matchedCampaigns.map((c) => {
                const checked = selectedIds.has(c.id);
                return (
                  <div
                    key={c.id}
                    className={`px-4 py-3 flex items-center justify-between transition-colors group ${
                      checked ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <label className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelect(c.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900 truncate">{c.name}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(c.status)}`}>
                            {statusLabel(c.status)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                          <span>{c.id}</span>
                          <span>{c.type}</span>
                          <span>消耗: ¥{c.spend.toLocaleString()}</span>
                          <span>{c.startDate} ~ {c.endDate}</span>
                        </div>
                      </div>
                    </label>
                    <button
                      onClick={() => handleDeleteOne(c)}
                      className="flex-shrink-0 p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 ml-2"
                      title="删除此计划"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Scheduled cleanup */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg flex items-center">
          <Clock className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">定时清理设置</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">启用定时清理</p>
              <p className="text-xs text-gray-400 mt-0.5">按设定周期自动清理符合条件的计划</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-sm text-gray-600">清理周期：每</label>
            <select
              value={intervalHours}
              onChange={(e) => setIntervalHours(Number(e.target.value))}
              className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={72}>72</option>
              <option value={168}>168</option>
            </select>
            <span className="text-sm text-gray-600">
              {intervalHours >= 24 ? `${Math.floor(intervalHours / 24)} 天` : '小时'}
            </span>
          </div>

          {lastRunTime && (
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                上次清理：{lastRunTime}
              </span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                下次清理：{scheduleEnabled ? new Date(Date.now() + intervalHours * 60 * 60 * 1000).toLocaleString('zh-CN') : '未启用'}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveSchedule}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              保存设置
            </button>
            {scheduleSaved && <span className="text-xs text-green-600">已保存</span>}
          </div>

          {hasAnyFilter && (
            <p className="text-xs text-gray-400 leading-relaxed">
              清理规则：{nameKeyword && `名称含"${nameKeyword}"`}
              {dateFrom && ` · 从 ${dateFrom}`}{dateTo && ` 至 ${dateTo}`}
              {filterStatus && ` · 状态: ${statusLabel(filterStatus)}`}
              {noSpendHours !== '' && noSpendHours > 0 && ` · 近 ${noSpendHours}h 无消耗`}
            </p>
          )}
          {!hasAnyFilter && (
            <p className="text-xs text-amber-500">⚠ 未设置任何筛选条件，将删除所有计划</p>
          )}
        </div>
      </div>
    </div>
  );
}
