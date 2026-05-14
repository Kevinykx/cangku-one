import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '.env') });

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Read Douyin cookie from .env or environment variable
// 编辑 server/.env 文件，填入你的 Cookie 即可
const DOUYIN_COOKIE = process.env.DOUYIN_COOKIE || '';

app.use(cors());
app.use(express.json());

// ─── In-memory storage ────────────────────────────────────────
let videos = [];

// ─── Helpers ──────────────────────────────────────────────────

function extractVideoId(url) {
  const m = url.match(/douyin\.com\/video\/(\d+)/);
  return m ? m[1] : null;
}

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
  '这样做作业效率翻十倍',
  '男朋友看到这个视频立马认错',
  '猫咪这个动作代表它爱你',
  '只要三步让你的皮肤白到发光',
  '这个方法我试了七天真的很管用',
];

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMockData(url) {
  return {
    id: `TV${Date.now()}${randomInt(10, 99)}`,
    url,
    title: randomPick(NAMES),
    likes: randomInt(10000, 500000),
    comments: randomInt(1000, 30000),
    favorites: randomInt(5000, 100000),
    shares: randomInt(1000, 50000),
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    _source: 'mock',
  };
}

// ─── Douyin API fetcher ───────────────────────────────────────

async function fetchRealData(videoId, originalUrl) {
  // Try the mobile API endpoint
  const apiUrl = new URL('https://www.iesdouyin.com/aweme/v1/web/aweme/detail/');
  apiUrl.searchParams.set('aweme_id', videoId);

  const res = await fetch(apiUrl.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.147 Mobile Safari/537.36',
      'Referer': `https://www.douyin.com/video/${videoId}`,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Cache-Control': 'no-cache',
      ...(DOUYIN_COOKIE ? { 'Cookie': DOUYIN_COOKIE } : {}),
    },
  });

  if (!res.ok) {
    console.log(`[douyin] API returned ${res.status}, falling back to page fetch`);
    return await fetchFromPage(originalUrl);
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.log('[douyin] Failed to parse API JSON');
    return await fetchFromPage(originalUrl);
  }

  // Check if data has a non-empty aweme_detail
  if (data?.aweme_detail) {
    return parseAweme(data.aweme_detail, originalUrl);
  }
  if (data?.data?.aweme_detail) {
    return parseAweme(data.data.aweme_detail, originalUrl);
  }
  if (data?.status_code === 0 && Array.isArray(data?.aweme_list) && data.aweme_list.length > 0) {
    return parseAweme(data.aweme_list[0], originalUrl);
  }

  console.log('[douyin] API response missing aweme_detail, fallback to page fetch');
  return await fetchFromPage(originalUrl);
}

async function fetchFromPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.147 Mobile Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      ...(DOUYIN_COOKIE ? { 'Cookie': DOUYIN_COOKIE } : {}),
    },
  });

  if (!res.ok) return null;

  const html = await res.text();

  // Try common JSON data containers
  const patterns = [
    /<script id="__NEXT_DATA__"[^>]*>(\{.*?\})<\/script>/,
    /<script>window\.__INITIAL_STATE__\s*=\s*(\{.*?\});<\/script>/,
    /<script[^>]*id="RENDER_DATA"[^>]*>([^<]+)<\/script>/,
    /window\._SSR_HYDRATED_DATA\s*=\s*(\{.*?\});/,
    /<script>window\.__NUXT__\s*=\s*(\{.*?\});<\/script>/,
  ];

  for (const pattern of patterns) {
    const m = html.match(pattern);
    if (!m) continue;
    try {
      const raw = m[1].startsWith('%') ? decodeURIComponent(m[1]) : m[1];
      const parsed = JSON.parse(raw);
      const detail = deepFind(parsed, 'aweme_detail') || deepFind(parsed, 'videoInfo');
      if (detail) return parseAweme(detail, url);
    } catch { /* try next pattern */ }
  }

  return null;
}

function deepFind(obj, key) {
  if (!obj || typeof obj !== 'object') return null;
  if (obj[key]) return obj[key];
  for (const v of Object.values(obj)) {
    const found = deepFind(v, key);
    if (found) return found;
  }
  return null;
}

function parseAweme(detail, originalUrl) {
  const stat = detail.statistics || {};
  return {
    id: `TV${detail.aweme_id || Date.now()}`,
    url: originalUrl,
    title: (detail.desc || detail.title || '').trim() || '抖音视频',
    coverUrl: detail.video?.cover?.url_list?.[0] || detail.video?.origin_cover?.url_list?.[0] || null,
    likes: Number(stat.digg_count) || 0,
    comments: Number(stat.comment_count) || 0,
    favorites: Number(stat.collect_count) || 0,
    shares: Number(stat.share_count) || 0,
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    _source: 'real',
  };
}

// ─── Puppeteer browser fetcher ─────────────────────────────────
// Falls back here when direct API requests are blocked by anti-scraping

async function fetchWithBrowser(videoId, originalUrl) {
  let browser;
  try {
    const { default: puppeteer } = await import('puppeteer');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1920, height: 1080 });

    if (DOUYIN_COOKIE) {
      await page.setExtraHTTPHeaders({ Cookie: DOUYIN_COOKIE });
    }

    // Intercept the API response the page makes internally
    const detailPromise = new Promise((resolve) => {
      page.on('response', async (response) => {
        const resUrl = response.url();
        if (resUrl.includes('/aweme/v1/web/aweme/detail/')) {
          try {
            const json = await response.json();
            const detail = json?.aweme_detail || json?.data?.aweme_detail;
            if (detail) resolve(detail);
          } catch { /* not the right response */ }
        }
      });
    });

    await page.goto(originalUrl, { waitUntil: 'networkidle2', timeout: 20000 });

    const detail = await Promise.race([
      detailPromise,
      new Promise((r) => setTimeout(() => r(null), 15000)),
    ]);

    if (detail) {
      console.log(`[puppeteer] Got real data for video ${videoId}`);
      return parseAweme(detail, originalUrl);
    }

    console.log(`[puppeteer] No data intercepted for ${videoId}`);
    return null;
  } catch (err) {
    console.log(`[puppeteer] Error: ${err.message}`);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

// ─── Routes ───────────────────────────────────────────────────

app.get('/api/trending/list', (req, res) => {
  res.json({ code: 0, data: [...videos], message: 'ok' });
});

app.post('/api/trending/fetch', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ code: 400, data: null, message: '缺少 url 参数' });
  }

  // Check if already exists
  const existing = videos.find((v) => v.url === url);
  if (existing) {
    return res.json({ code: 0, data: existing, message: '已存在' });
  }

  const videoId = extractVideoId(url);
  let result = null;

  if (videoId) {
    try {
      result = await fetchRealData(videoId, url);
      console.log(`[douyin] API fetch ${videoId}: ${result ? 'success' : 'failed'}`);
    } catch (err) {
      console.log(`[douyin] API fetch error: ${err.message}`);
    }
  }

  // Try Puppeteer (headless browser) if direct API failed
  if (!result && videoId) {
    console.log(`[douyin] Trying Puppeteer for ${videoId}...`);
    result = await fetchWithBrowser(videoId, url);
  }

  if (!result) {
    result = generateMockData(url);
    console.log(`[douyin] Using mock data for ${url}`);
  }

  videos.unshift(result);
  res.json({ code: 0, data: result, message: 'ok' });
});

app.delete('/api/trending/:id', (req, res) => {
  videos = videos.filter((v) => v.id !== req.params.id);
  res.json({ code: 0, data: null, message: 'ok' });
});

app.post('/api/trending/batch-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ code: 400, data: null, message: '缺少 ids 参数' });
  }
  const before = videos.length;
  videos = videos.filter((v) => !ids.includes(v.id));
  res.json({ code: 0, data: { deletedCount: before - videos.length }, message: 'ok' });
});

// ─── Start ────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[server] 投无忧后端运行在 http://localhost:${PORT}`);
  console.log(`[server] API 端点:`);
  console.log(`  GET    /api/trending/list`);
  console.log(`  POST   /api/trending/fetch`);
  console.log(`  DELETE /api/trending/:id`);
  console.log(`  POST   /api/trending/batch-delete`);
  if (DOUYIN_COOKIE) {
    console.log(`[server] ✅ DOUYIN_COOKIE 已配置 (${DOUYIN_COOKIE.slice(0, 40)}...)`);
  } else {
    console.log(`[server] ⚠️  未设置 DOUYIN_COOKIE，抖音真实数据抓取可能受限`);
    console.log(`[server]    编辑 server/.env 文件，填入你的抖音 Cookie 即可`);
    console.log(`[server]    获取 Cookie: 浏览器打开 douyin.com → F12 → Network →`);
    console.log(`[server]    点任意请求 → 复制 Request Headers 中的 Cookie 完整值`);
  }
});
