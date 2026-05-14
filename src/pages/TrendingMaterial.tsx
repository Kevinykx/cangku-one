import { useState, useEffect } from 'react';
import {
  Link2,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Trash2,
  Loader2,
  ListPlus,
  CheckCircle2,
} from 'lucide-react';
import * as trendingApi from '../api/trending';
import type { TrendingVideo } from '../api/types';

const platformColors = ['from-pink-500 to-orange-400', 'from-purple-500 to-pink-400', 'from-blue-500 to-cyan-400', 'from-green-500 to-emerald-400', 'from-rose-500 to-pink-500'];

function formatNum(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

function DouyinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M15.5 2h-3v13.5a3.5 3.5 0 1 1-2.8-3.43V9.04a6.5 6.5 0 1 0 5.8 6.46V2Z" />
    </svg>
  );
}

export function TrendingMaterial() {
  const [videos, setVideos] = useState<TrendingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputUrl, setInputUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  // Batch import
  const [showBatch, setShowBatch] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [batchImporting, setBatchImporting] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ total: number; done: number; fail: number } | null>(null);

  function loadVideos() {
    setLoading(true);
    trendingApi.getTrendingVideos().then((res) => {
      setVideos(res.data);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadVideos();
  }, []);

  async function handleFetch() {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setError('请输入抖音视频链接');
      return;
    }
    if (!trimmed.includes('douyin.com')) {
      setError('请输入有效的抖音链接（需包含 douyin.com）');
      return;
    }
    setError('');
    setFetching(true);
    try {
      await trendingApi.fetchTrendingVideo(trimmed);
      loadVideos();
      setInputUrl('');
    } finally {
      setFetching(false);
    }
  }

  async function handleBatchImport() {
    const urls = batchText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && l.includes('douyin.com'));
    if (urls.length === 0) return;

    setBatchImporting(true);
    setBatchProgress({ total: urls.length, done: 0, fail: 0 });

    for (const url of urls) {
      try {
        await trendingApi.fetchTrendingVideo(url);
        setBatchProgress((p) => p ? { ...p, done: p.done + 1 } : p);
      } catch {
        setBatchProgress((p) => p ? { ...p, done: p.done + 1, fail: p.fail + 1 } : p);
      }
    }

    loadVideos();
    setBatchText('');
    setTimeout(() => {
      setShowBatch(false);
      setBatchProgress(null);
      setBatchImporting(false);
    }, 1500);
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这条视频数据吗？')) return;
    await trendingApi.deleteTrendingVideo(id);
    loadVideos();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">爆款素材</h1>
        <p className="mt-1 text-sm text-gray-500">通过抖音链接抓取视频数据，追踪爆款素材表现</p>
      </div>

      {/* Input */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">抓取视频</span>
          <button
            onClick={() => { setShowBatch(!showBatch); setBatchText(''); setBatchProgress(null); }}
            className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              showBatch
                ? 'bg-pink-100 text-pink-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ListPlus className="w-3.5 h-3.5 mr-1" />
            批量导入
          </button>
        </div>
        <div className="p-4 space-y-3">
          {/* Single input */}
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => { setInputUrl(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                    placeholder="粘贴抖音视频链接，如 https://www.douyin.com/video/xxxxx"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleFetch}
                  disabled={fetching}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 transition-colors"
                >
                  <DouyinIcon />
                  <span className="ml-2">{fetching ? '抓取中...' : '抓取'}</span>
                </button>
              </div>
              {error && <p className="text-xs text-red-500 mt-1.5 ml-1">{error}</p>}
            </div>
          </div>

          {/* Batch import area */}
          {showBatch && (
            <div className="border border-gray-200 rounded-md p-3 bg-gray-50 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  批量粘贴抖音链接（每行一个）
                </label>
                <textarea
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  placeholder={'https://www.douyin.com/video/xxxxx\nhttps://www.douyin.com/video/yyyyy\nhttps://www.douyin.com/video/zzzzz'}
                  rows={5}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 resize-none"
                  disabled={batchImporting}
                />
              </div>

              {batchProgress ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {batchProgress.fail > 0
                        ? `已完成 ${batchProgress.done - batchProgress.fail} / ${batchProgress.total}，失败 ${batchProgress.fail}`
                        : batchProgress.done === batchProgress.total
                          ? `全部完成 ${batchProgress.total} 条`
                          : `正在抓取 ${batchProgress.done + 1} / ${batchProgress.total}`}
                    </span>
                    <span className={batchProgress.fail > 0 ? 'text-red-500' : 'text-green-600'}>
                      {batchProgress.done === batchProgress.total
                        ? <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" />导入完毕</span>
                        : `${Math.round((batchProgress.done / batchProgress.total) * 100)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${batchProgress.fail > 0 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${(batchProgress.done / batchProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBatchImport}
                    disabled={batchText.trim().length === 0}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 transition-colors"
                  >
                    <ListPlus className="w-3.5 h-3.5 mr-1.5" />
                    开始导入
                  </button>
                  <span className="text-xs text-gray-400">
                    将识别包含 douyin.com 的链接
                  </span>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-gray-400">抓取后自动保存视频的点赞、评论、收藏、转发数据</p>
        </div>
      </div>

      {/* Video list */}
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-10 h-10 mb-2" />
          <p className="text-sm">暂无抓取的视频</p>
          <p className="text-xs mt-1">在上方输入抖音链接开始抓取</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {videos.map((video, idx) => (
            <div key={video.id} className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
              {/* Cover area */}
              <div className={`relative aspect-video bg-gradient-to-br ${platformColors[idx % platformColors.length]} flex items-center justify-center`}>
                <div className="text-white/80">
                  <DouyinIcon />
                </div>
                <button
                  onClick={() => handleDelete(video.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/30 hover:bg-red-500 rounded text-white opacity-0 group-hover:opacity-100 transition-all"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{video.title}</h3>

                <div className="flex items-center justify-between text-xs">
                  {[
                    { icon: Heart, label: '点赞', value: video.likes, color: 'text-pink-500' },
                    { icon: MessageCircle, label: '评论', value: video.comments, color: 'text-blue-500' },
                    { icon: Bookmark, label: '收藏', value: video.favorites, color: 'text-green-500' },
                    { icon: Share2, label: '转发', value: video.shares, color: 'text-purple-500' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex flex-col items-center gap-0.5">
                      <div className={`flex items-center ${stat.color}`}>
                        <stat.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-gray-600 font-medium">{formatNum(stat.value)}</span>
                      <span className="text-gray-400">{stat.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <span className="text-xs text-gray-400">抓取于 {video.createdAt}</span>
                  <span className="text-xs text-gray-300 truncate max-w-[180px]" title={video.url}>{video.url}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
