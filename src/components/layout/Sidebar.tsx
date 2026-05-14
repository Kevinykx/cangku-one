import { Link } from 'react-router-dom';
import {
  BarChart3,
  Megaphone,
  Settings,
  FolderOpen,
  Users,
  TrendingUp,
  FileText,
  Bot,
  UserCircle,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  currentPage?: string;
}

export function Sidebar({ currentPage = 'dashboard' }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    '投放工具': true,
    '团队管理': true,
  });

  function toggleSection(name: string) {
    setExpandedSections((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  const menuGroups = [
    {
      group: '主要功能',
      items: [
        { type: 'link' as const, name: '仪表板', href: '/', icon: BarChart3, current: currentPage === '/' },
        {
          type: 'group' as const, name: '投放工具', icon: Megaphone,
          current: currentPage.startsWith('/campaign') || currentPage === '/ai-monitor',
          children: [
            { name: '广告计划', href: '/campaign', icon: Megaphone, current: currentPage.startsWith('/campaign') },
            { name: 'AI 盯盘', href: '/ai-monitor', icon: Bot, current: currentPage === '/ai-monitor' },
          ],
        },
        { type: 'link' as const, name: '数据分析', href: '/analytics', icon: TrendingUp, current: currentPage === '/analytics' },
        { type: 'link' as const, name: '创意中心', href: '/creative', icon: Megaphone, current: currentPage === '/creative' },
      ],
    },
    {
      group: '管理',
      items: [
        { type: 'link' as const, name: '项目', href: '/projects', icon: FolderOpen, current: currentPage === '/projects' },
        {
          type: 'group' as const, name: '团队管理', icon: Users,
          current: currentPage === '/team',
          children: [
            { name: '人员管理', href: '/team', icon: UserCircle, current: currentPage === '/team' },
          ],
        },
        { type: 'link' as const, name: '文档', href: '/docs', icon: FileText, current: currentPage === '/docs' },
        { type: 'link' as const, name: '设置', href: '/settings', icon: Settings, current: currentPage === '/settings' },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white h-screen border-r border-gray-200 flex-shrink-0">
      <div className="p-6">
        <div className="space-y-6">
          {menuGroups.map((group) => (
            <div key={group.group}>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {group.group}
              </h3>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  if (item.type === 'link') {
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          item.current
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  }
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => toggleSection(item.name)}
                        className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          item.current
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${
                          expandedSections[item.name] ? 'rotate-0' : '-rotate-90'
                        }`} />
                      </button>
                      {expandedSections[item.name] && (
                        <div className="ml-6 mt-1 space-y-1 border-l border-gray-200">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={`flex items-center pl-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                child.current
                                  ? 'text-blue-700 bg-blue-50 border-l-2 border-blue-600 -ml-px'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <child.icon className="mr-3 h-4 w-4" />
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
