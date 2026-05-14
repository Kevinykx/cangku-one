import { useState, useEffect } from 'react';
import {
  Plus,
  Image,
  Video,
  FileText,
  Upload,
  Trash2,
  Edit,
  Eye,
  Filter,
  Grid,
  List,
} from 'lucide-react';
import * as creativeApi from '../api/creative';
import type { CreativeAsset } from '../api/types';
import { BatchUploadModal } from '../components/creative/BatchUploadModal';
import type { FileItem } from '../components/creative/BatchUploadModal';

const categories = [
  { value: 'all', label: '全部类型' },
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
  { value: 'text', label: '文案' },
];

const viewModes = [
  { id: 'grid', icon: Grid, label: '网格视图' },
  { id: 'list', icon: List, label: '列表视图' },
];

export function Creative() {
  const [assets, setAssets] = useState<CreativeAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  function loadAssets() {
    setLoading(true);
    creativeApi.getCreativeAssets().then((res) => {
      setAssets(res.data);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadAssets();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个素材吗？')) return;
    await creativeApi.deleteCreativeAsset(id);
    loadAssets();
  }

  async function handleBatchUpload(files: FileItem[]) {
    const items = files.map((f) => ({
      name: f.name.replace(/\.[^/.]+$/, ''),
      type: f.type,
      format: f.format,
      fileSize: f.fileSize,
      dimensions: f.dimensions,
      uploadTime: f.uploadTime,
      previewUrl: f.previewUrl,
    }));
    await creativeApi.batchUploadCreativeAssets(items);
    loadAssets();
  }

  const filtered = filterCategory === 'all'
    ? assets
    : assets.filter((a) => a.type === filterCategory);

  const typeIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'text': return FileText;
      default: return FileText;
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">创意中心</h1>
          <p className="mt-1 text-sm text-gray-600">管理您的广告创意和素材</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Upload className="mr-2 h-4 w-4" />
            批量上传
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            新建素材
          </button>
        </div>
      </div>

      {/* 筛选和视图切换 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setFilterCategory(category.value)}
                className={`px-3 py-1 text-sm rounded-full border transition-all ${
                  filterCategory === category.value
                    ? 'border-blue-300 text-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {category.label}
                <span className="ml-1 text-xs text-gray-500">
                  ({category.value === 'all' ? assets.length : assets.filter(a => a.type === category.value).length})
                </span>
              </button>
            ))}
          </div>
          <button className="inline-flex items-center px-3 py-1 text-sm rounded-md border border-gray-300 hover:border-blue-300 hover:text-blue-600">
            <Filter className="mr-2 h-4 w-4" />
            筛选
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setCurrentView(mode.id)}
              className={`p-2 rounded-md ${
                currentView === mode.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <mode.icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>

      {/* 素材列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">暂无素材</div>
        ) : currentView === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((asset) => {
                const Icon = typeIcon(asset.type);
                return (
                  <div key={asset.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
                    <div className="aspect-square bg-gray-100 relative flex items-center justify-center">
                      {asset.previewUrl ? (
                        asset.type === 'image' ? (
                          <img src={asset.previewUrl} alt={asset.name} className="w-full h-full object-contain" />
                        ) : (
                          <video src={asset.previewUrl} controls className="w-full h-full object-contain" />
                        )
                      ) : (
                        <Icon className="w-12 h-12 text-gray-400" />
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          asset.status === 'active' ? 'bg-green-100 text-green-800'
                          : asset.status === 'draft' ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                          {asset.status === 'active' ? '使用中' : asset.status === 'draft' ? '草稿' : '已归档'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{asset.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{asset.category} • {asset.size}</p>
                      <p className="text-xs text-gray-400 mt-1">{asset.format} • {asset.sizeValue}MB</p>
                      <p className="text-xs text-gray-400 mt-1">{asset.createdAt}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">{asset.usedIn.length}个使用</span>
                        <div className="flex space-x-1">
                          <button className="p-1 text-gray-400 hover:text-gray-600"><Eye className="h-4 w-4" /></button>
                          <button className="p-1 text-gray-400 hover:text-gray-600"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(asset.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">尺寸</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文件大小</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上传时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">使用情况</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                      <div className="text-sm text-gray-500">{asset.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{asset.type}</div>
                      <div className="text-sm text-gray-500">{asset.format}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.sizeValue}MB</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.createdAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.usedIn.length}个计划</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        asset.status === 'active' ? 'bg-green-100 text-green-800'
                        : asset.status === 'draft' ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                        {asset.status === 'active' ? '使用中' : asset.status === 'draft' ? '草稿' : '已归档'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.creator}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900"><Eye className="h-4 w-4" /></button>
                      <button className="text-gray-600 hover:text-gray-900"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(asset.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BatchUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleBatchUpload}
      />
    </div>
  );
}
