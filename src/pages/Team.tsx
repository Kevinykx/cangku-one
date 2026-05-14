import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  Shield,
  UserCog,
  Eye,
  DollarSign,
  Key,
  User,
  CheckCircle,
} from 'lucide-react';
import * as teamApi from '../api/team';
import type { TeamMember, Permission } from '../api/types';

const roleOptions = [
  { value: 'admin', label: '管理员' },
  { value: 'operator', label: '运营' },
  { value: 'finance', label: '财务' },
  { value: 'viewer', label: '观察者' },
] as const;

const roleIcons = {
  admin: Shield,
  operator: UserCog,
  finance: DollarSign,
  viewer: Eye,
} as const;

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  operator: 'bg-blue-100 text-blue-800',
  finance: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
} as const;

const permissionDefs: { value: Permission; label: string; desc: string }[] = [
  { value: 'account_mgmt', label: '账户管理', desc: '管理账户设置与信息' },
  { value: 'campaign_mgmt', label: '计划管理', desc: '创建、编辑、删除广告计划' },
  { value: 'data_view', label: '数据查看', desc: '查看数据分析与报表' },
  { value: 'finance', label: '财务管理', desc: '查看消耗明细与充值' },
  { value: 'creative_mgmt', label: '创意管理', desc: '管理创意素材' },
  { value: 'team_mgmt', label: '人员管理', desc: '管理团队成员与权限' },
];

const roleDefaultPermissions: Record<string, Permission[]> = {
  admin: ['account_mgmt', 'campaign_mgmt', 'data_view', 'finance', 'creative_mgmt', 'team_mgmt'],
  operator: ['campaign_mgmt', 'data_view', 'creative_mgmt'],
  finance: ['data_view', 'finance'],
  viewer: ['data_view'],
};

const permissionColors: Record<string, string> = {
  account_mgmt: 'bg-blue-50 text-blue-700',
  campaign_mgmt: 'bg-indigo-50 text-indigo-700',
  data_view: 'bg-teal-50 text-teal-700',
  finance: 'bg-green-50 text-green-700',
  creative_mgmt: 'bg-pink-50 text-pink-700',
  team_mgmt: 'bg-purple-50 text-purple-700',
};

const defaultForm = {
  name: '',
  account: '',
  password: '',
  role: 'operator' as TeamMember['role'],
  permissions: ['campaign_mgmt', 'data_view', 'creative_mgmt'] as Permission[],
  status: 'active' as TeamMember['status'],
};

export function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [rowAnim, setRowAnim] = useState<Record<string, boolean>>({});

  function loadMembers() {
    setLoading(true);
    teamApi.getTeamMembers().then((res) => {
      setMembers(res.data);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadMembers();
  }, []);

  function openCreateModal() {
    setEditingMember(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEditModal(member: TeamMember) {
    setEditingMember(member);
    setForm({
      name: member.name,
      account: member.account,
      password: member.password,
      role: member.role,
      permissions: [...member.permissions],
      status: member.status,
    });
    setModalOpen(true);
  }

  function handleRoleChange(role: TeamMember['role']) {
    setForm({
      ...form,
      role,
      permissions: [...roleDefaultPermissions[role]],
    });
  }

  function togglePermission(perm: Permission) {
    if (form.role === 'admin') return;
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.account.trim() || !form.password.trim()) return;
    setModalOpen(false);
    if (editingMember) {
      const prev = members.find(m => m.id === editingMember.id);
      setMembers(p => p.map(m =>
        m.id === editingMember.id ? { ...m, ...form } : m
      ));
      try {
        await teamApi.updateTeamMember(editingMember.id, form);
      } catch {
        if (prev) setMembers(p => p.map(m => m.id === editingMember.id ? prev : m));
      }
    } else {
      const optimisticId = `TEMP_${Date.now()}`;
      const optimistic: TeamMember = {
        id: optimisticId,
        ...form,
        lastLogin: '-',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setRowAnim(r => ({ ...r, [optimisticId]: true }));
      setTimeout(() => setRowAnim(r => { const n = { ...r }; delete n[optimisticId]; return n; }), 300);
      setMembers(prev => [optimistic, ...prev]);
      try {
        const res = await teamApi.createTeamMember(form);
        setMembers(prev => prev.map(m =>
          m.id === optimisticId ? { ...res.data, status: form.status } : m
        ));
      } catch {
        setMembers(prev => prev.filter(m => m.id !== optimisticId));
      }
    }
  }

  async function handleToggleStatus(member: TeamMember) {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    const prev = members.find(m => m.id === member.id);
    setMembers(p => p.map(m =>
      m.id === member.id ? { ...m, status: newStatus } : m
    ));
    try {
      await teamApi.updateTeamMember(member.id, { status: newStatus });
    } catch {
      if (prev) setMembers(p => p.map(m => m.id === member.id ? prev : m));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除该成员吗？')) return;
    const prev = members.find(m => m.id === id);
    setMembers(p => p.filter(m => m.id !== id));
    try {
      await teamApi.deleteTeamMember(id);
    } catch {
      if (prev) setMembers(p => [...p, prev]);
    }
  }

  const filtered = members.filter((m) => {
    if (search && !m.name.includes(search) && !m.account.includes(search)) return false;
    if (filterRole && m.role !== filterRole) return false;
    if (filterStatus && m.status !== filterStatus) return false;
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
          <h1 className="text-2xl font-bold text-gray-900">人员管理</h1>
          <p className="mt-1 text-sm text-gray-600">管理广告账户的团队成员及其操作权限</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          添加成员
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
                placeholder="搜索姓名或账号..."
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">全部角色</option>
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">全部状态</option>
              <option value="active">已启用</option>
              <option value="inactive">已停用</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            共 <span className="font-medium">{filtered.length}</span> 人
          </div>
        </div>
      </div>

      {/* 成员列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {search || filterRole || filterStatus ? '没有匹配的成员' : '暂无团队成员，点击上方按钮添加'}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">权限</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后登录</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((member) => {
                  const RoleIcon = roleIcons[member.role];
                  const roleLabel = roleOptions.find((r) => r.value === member.role)?.label ?? member.role;
                  const isAdmin = member.role === 'admin';
                  return (
                    <tr key={member.id} className={`hover:bg-gray-50${rowAnim[member.id] ? ' animate-row-enter' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium text-white ${
                            member.status === 'active' ? 'bg-blue-500' : 'bg-gray-400'
                          }`}>
                            {member.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {member.account}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {isAdmin ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                              <Shield className="h-3 w-3 mr-0.5" /> 全部权限
                            </span>
                          ) : (
                            member.permissions.map((p) => {
                              const def = permissionDefs.find((d) => d.value === p);
                              return (
                                <span key={p} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${permissionColors[p]}`}>
                                  {def?.label ?? p}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
                          <RoleIcon className="mr-1 h-3 w-3" />
                          {roleLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(member)}
                          className={`toggle-switch relative inline-flex h-6 w-11 items-center rounded-full ${
                            member.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 rounded-full bg-white ${
                            member.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                        <span className={`ml-2 text-xs font-medium ${
                          member.status === 'active' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {member.status === 'active' ? '已启用' : '已停用'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.lastLogin}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.createdAt}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => openEditModal(member)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-900"
                        >
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

      {/* 添加/编辑弹窗 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setModalOpen(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingMember ? '编辑成员' : '添加成员'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* 基本信息 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="请输入姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">账号</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={form.account}
                      onChange={(e) => setForm({ ...form, account: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="登录账号"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="登录密码"
                    />
                  </div>
                </div>

                {/* 角色 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                  <select
                    value={form.role}
                    onChange={(e) => handleRoleChange(e.target.value as TeamMember['role'])}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {roleOptions.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* 权限配置 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">权限配置</label>
                    {form.role === 'admin' && (
                      <span className="inline-flex items-center text-xs text-purple-600 font-medium">
                        <Shield className="h-3 w-3 mr-1" />
                        管理员拥有全部权限
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {permissionDefs.map((pd) => {
                      const checked = form.permissions.includes(pd.value);
                      const disabled = form.role === 'admin';
                      return (
                        <label
                          key={pd.value}
                          className={`flex items-center p-2 rounded-md border cursor-pointer transition-colors ${
                            checked
                              ? 'border-blue-200 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => togglePermission(pd.value)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{pd.label}</div>
                            <div className="text-xs text-gray-500">{pd.desc}</div>
                          </div>
                          {checked && (
                            <CheckCircle className="ml-auto h-4 w-4 text-blue-500" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 状态 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={form.status === 'active'}
                        onChange={() => setForm({ ...form, status: 'active' })}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">启用</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={form.status === 'inactive'}
                        onChange={() => setForm({ ...form, status: 'inactive' })}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">停用</span>
                    </label>
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
                  disabled={!form.name.trim() || !form.account.trim() || !form.password.trim()}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingMember ? '保存修改' : '添加成员'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
