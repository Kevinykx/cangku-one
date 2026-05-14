import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const err = await login({ account, password });
    if (err) {
      setError(err);
    } else {
      navigate(from, { replace: true });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4">
            <Compass className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">投无忧</h1>
          <p className="mt-2 text-sm text-gray-600">登录您的账号以管理广告投放</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-1">
              账号
            </label>
            <input
              id="account"
              type="text"
              required
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="ykx123"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="admin123"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? '登录中...' : '登录'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            测试账号: ykx123 / aa123456
          </p>
        </form>
      </div>
    </div>
  );
}
