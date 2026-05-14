import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import * as campaignApi from '../api/campaign';

const campaignTypes = ['电商推广', '品牌宣传', '应用推广', '游戏推广'];

export function CampaignForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: '电商推广',
    budget: 0,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    campaignApi.getCampaignById(id).then((res) => {
      if (res.code === 0 && res.data) {
        setForm({
          name: res.data.name,
          type: res.data.type,
          budget: res.data.budget,
          startDate: res.data.startDate,
          endDate: res.data.endDate,
        });
      }
      setLoading(false);
    });
  }, [id, isEdit]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || form.budget <= 0) return;

    setSaving(true);
    try {
      if (isEdit) {
        await campaignApi.updateCampaign(id, { ...form, budget: form.budget });
      } else {
        await campaignApi.createCampaign({
          ...form,
          type: form.type,
          status: 'paused',
          spend: 0,
          ctr: 0,
          cpc: 0,
          impressions: 0,
          clicks: 0,
          endDate: form.endDate || new Date().toISOString().slice(0, 10),
        });
      }
      navigate('/campaign');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/campaign')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回广告计划列表
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          {isEdit ? '编辑广告计划' : '创建广告计划'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              计划名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="例如：618大促活动"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">推广类型</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {campaignTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              预算 (¥) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              value={form.budget || ''}
              onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="50000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/campaign')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? '保存中...' : isEdit ? '保存修改' : '创建计划'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
