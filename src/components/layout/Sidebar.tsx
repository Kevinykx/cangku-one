import { Link } from 'react-router-dom';
import {
  BarChart3,
  Megaphone,
  Users,
  TrendingUp,
  Bot,
  ChevronDown,
  Trash2,
  Rocket,
  Sparkles,
  Image,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  currentPage?: string;
}

export function Sidebar({ currentPage = 'dashboard' }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    '投放工具': true,
    '创意中心': true,
    '团队管理': true,
  });

  function toggleSection(name: string) {
    setExpandedSections((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  const menuGroups = [
    {
      group: '主要功能',
      items: [
        { type: 'link' as const, name: '首页', href: '/', icon: BarChart3, current: currentPage === '/' },
        {
          type: 'group' as const, name: '投放工具', icon: Rocket,
          current: currentPage.startsWith('/campaign') || currentPage === '/ai-monitor' || currentPage === '/campaign-cleanup',
          children: [
            { name: '广告计划', href: '/campaign', icon: Megaphone, current: currentPage === '/campaign' || currentPage.startsWith('/campaign/') },
            { name: 'AI 盯盘', href: '/ai-monitor', icon: Bot, current: currentPage === '/ai-monitor' },
            { name: '计划清理', href: '/campaign-cleanup', icon: Trash2, current: currentPage === '/campaign-cleanup' },
          ],
        },
        {
          type: 'group' as const, name: '创意中心', icon: Sparkles,
          current: currentPage.startsWith('/creative'),
          children: [
            { name: '素材管理', href: '/creative', icon: Image, current: currentPage === '/creative' },
            { name: '爆款素材', href: '/creative/trending', icon: TrendingUp, current: currentPage === '/creative/trending' },
          ],
        },
        { type: 'link' as const, name: '数据分析', href: '/analytics', icon: TrendingUp, current: currentPage === '/analytics' },
      ],
    },
    {
      group: '管理',
      items: [
        { type: 'link' as const, name: '团队管理', href: '/team', icon: Users, current: currentPage === '/team' },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 h-screen border-r border-slate-800 flex-shrink-0">
      <div className="p-6">
        <div className="space-y-6">
          {menuGroups.map((group) => (
            <div key={group.group}>
              <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
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
                            ? 'bg-cyan-500/10 text-cyan-400 border-r-2 border-cyan-500'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
                            ? 'bg-cyan-500/10 text-cyan-400'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </div>
                        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${
                          expandedSections[item.name] ? 'rotate-0' : '-rotate-90'
                        }`} />
                      </button>
                      {expandedSections[item.name] && (
                        <div className="ml-6 mt-1 space-y-1 border-l border-slate-700">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={`flex items-center pl-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                child.current
                                  ? 'text-cyan-400 bg-cyan-500/10 border-l-2 border-cyan-500 -ml-px'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
