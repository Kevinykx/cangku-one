import { mockResponse } from './client';
import type { TrendingVideo } from './types';

const API_BASE = '/api/trending';

// In-memory mock fallback
let mockVideos: TrendingVideo[] = [
  {
    id: 'TV001',
    url: 'https://www.douyin.com/video/741234567890',
    title: '这个真的太好吃了吧家人们谁懂啊',
    likes: 128500,
    comments: 8320,
    favorites: 45600,
    shares: 12300,
    createdAt: '2026-05-13 14:22',
  },
  {
    id: 'TV002',
    url: 'https://www.douyin.com/video/741234567891',
    title: '学会了这个技巧，再也不用去理发店',
    likes: 256000,
    comments: 15320,
    favorites: 89200,
    shares: 34500,
    createdAt: '2026-05-12 09:15',
  },
  {
    id: 'TV003',
    url: 'https://www.douyin.com/video/741234567892',
    title: '三天瘦了五斤，就靠这杯水',
    likes: 89000,
    comments: 6700,
    favorites: 32100,
    shares: 8900,
    createdAt: '2026-05-11 18:30',
  },
];

const NAMES = [
  '这个真的太好吃了吧家人们谁懂啊',
  '学会了这个技巧再也不用去理发店',
  '三天瘦了五斤就靠这杯水',
  '打工人的早餐三分钟搞定',
  '这东西千万别扔放锅里炸一下',
  '难怪酒店的水这么好喝原来是这样',
  '千万别在深夜看这个饿哭了',
  '奶奶教我的老方法真的太绝了',
  '超市里这几种东西千万别买',
  '我宣布这是今年最好看的裙子',
];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Real API calls with mock fallback ─────────────────────────

let backendOk: boolean | null = null;

async function checkBackend(): Promise<boolean> {
  if (backendOk !== null) return backendOk;
  try {
    const res = await fetch(`${API_BASE}/list`, { signal: AbortSignal.timeout(1500) });
    backendOk = res.ok;
    return backendOk;
  } catch {
    backendOk = false;
    return false;
  }
}

export async function getTrendingVideos() {
  if (await checkBackend()) {
    const res = await fetch(`${API_BASE}/list`);
    return res.json();
  }
  return mockResponse<TrendingVideo[]>([...mockVideos]);
}

export async function fetchTrendingVideo(douyinUrl: string) {
  if (await checkBackend()) {
    try {
      const res = await fetch(`${API_BASE}/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: douyinUrl }),
      });
      if (res.ok) return res.json();
    } catch { /* fall through to mock */ }
  }

  // Mock fallback
  const existing = mockVideos.find((v) => v.url === douyinUrl);
  if (existing) return mockResponse<TrendingVideo>(existing);

  const newVideo: TrendingVideo = {
    id: `TV${Date.now()}`,
    url: douyinUrl,
    title: randomPick(NAMES),
    likes: randomInt(10000, 500000),
    comments: randomInt(1000, 30000),
    favorites: randomInt(5000, 100000),
    shares: randomInt(1000, 50000),
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  };
  mockVideos.unshift(newVideo);
  return mockResponse<TrendingVideo>(newVideo);
}

export async function deleteTrendingVideo(id: string) {
  if (await checkBackend()) {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    return mockResponse(null);
  }
  mockVideos = mockVideos.filter((v) => v.id !== id);
  return mockResponse(null);
}

export async function batchDeleteTrendingVideos(ids: string[]) {
  if (await checkBackend()) {
    await fetch(`${API_BASE}/batch-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    return mockResponse({ deletedCount: ids.length });
  }
  mockVideos = mockVideos.filter((v) => !ids.includes(v.id));
  return mockResponse({ deletedCount: ids.length });
}
