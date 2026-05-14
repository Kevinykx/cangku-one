import { Settings } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="mt-1 text-sm text-gray-600">管理您的系统偏好和配置</p>
      </div>

      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <Settings className="w-5 h-5 text-gray-400" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">通用设置</h3>
              <p className="text-sm text-gray-500">更多设置功能即将上线</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
