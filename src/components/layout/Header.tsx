import { BarChart3, Settings, User } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  user?: {
    name: string;
    avatar?: string;
  };
}

export function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-semibold text-gray-900">巨量助手</span>
          </div>

        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100">
            <Settings className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
              ) : (
                <User className="w-5 h-5" />
              )}
              <span className="hidden md:inline text-sm">{user?.name || '用户'}</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  个人资料
                </Link>
                <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  设置
                </Link>
                <hr className="my-1" />
                <Link to="/logout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  退出登录
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
}