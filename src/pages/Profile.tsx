import { useState, useRef } from 'react';
import {
  User,
  Camera,
  Save,
  Key,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import * as authApi from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

export function Profile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [account, setAccount] = useState(user?.account ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // 密码修改
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // 头像
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);

  async function handleSaveProfile() {
    if (!name.trim() || !account.trim()) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await authApi.updateProfile({ name: name.trim(), account: account.trim(), email, phone });
      if (res.code === 0) {
        updateUser(res.data);
        setSaveMessage({ ok: true, text: '个人资料已更新' });
      } else {
        setSaveMessage({ ok: false, text: res.message || '保存失败' });
      }
    } catch {
      setSaveMessage({ ok: false, text: '网络错误，请重试' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }

  async function handleChangePassword() {
    if (!oldPwd || !newPwd || !confirmPwd) { setPwdMessage({ ok: false, text: '请填写完整' }); return; }
    if (newPwd !== confirmPwd) { setPwdMessage({ ok: false, text: '两次密码不一致' }); return; }
    if (newPwd.length < 6) { setPwdMessage({ ok: false, text: '密码至少 6 位' }); return; }
    setPwdSaving(true);
    setPwdMessage(null);
    // mock: always succeed
    await new Promise((r) => setTimeout(r, 400));
    setPwdSaving(false);
    setPwdMessage({ ok: true, text: '密码已修改' });
    setOldPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setTimeout(() => setPwdMessage(null), 3000);
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarDataUrl(dataUrl);
      updateUser({ avatar: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  const initial = user?.name?.charAt(0) ?? '用';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">个人资料</h1>
        <p className="mt-1 text-sm text-gray-600">管理您的账户信息和密码</p>
      </div>

      {/* 基本信息卡片 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">基本信息</h2>
        </div>
        <div className="p-6">
          {/* 头像 */}
          <div className="flex items-center mb-6">
            <div className="relative group">
              <div className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-blue-500 overflow-hidden">
                {avatarDataUrl || user?.avatar ? (
                  <img src={avatarDataUrl || user?.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <button
                onClick={handleAvatarClick}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">点击头像更换照片</p>
            </div>
          </div>

          {/* 表单 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <input
                type="text" value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="h-3 w-3 inline mr-1" />账号
              </label>
              <input
                type="text" value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-3 w-3 inline mr-1" />邮箱
              </label>
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="h-3 w-3 inline mr-1" />手机号
              </label>
              <input
                type="text" value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="绑定手机号"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            {saveMessage && (
              <div className={`flex items-center text-sm ${saveMessage.ok ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage.ok ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                {saveMessage.text}
              </div>
            )}
            <div className="ml-auto">
              <button
                onClick={handleSaveProfile}
                disabled={saving || !name.trim() || !account.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? '保存中...' : '保存修改'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 修改密码卡片 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">修改密码</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showOld ? 'text' : 'password'} value={oldPwd}
                  onChange={(e) => setOldPwd(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="输入当前密码"
                />
                <button onClick={() => setShowOld(!showOld)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showOld ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>
            <div />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showNew ? 'text' : 'password'} value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="至少 6 位"
                />
                <button onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showNew ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showNew ? 'text' : 'password'} value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="再次输入新密码"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            {pwdMessage && (
              <div className={`flex items-center text-sm ${pwdMessage.ok ? 'text-green-600' : 'text-red-600'}`}>
                {pwdMessage.ok ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                {pwdMessage.text}
              </div>
            )}
            <div className="ml-auto">
              <button
                onClick={handleChangePassword}
                disabled={pwdSaving || !oldPwd || !newPwd || !confirmPwd}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Key className="mr-2 h-4 w-4" />
                {pwdSaving ? '修改中...' : '修改密码'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
