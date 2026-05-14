import { mockResponse } from './client';
import { mockCreativeAssets } from './mock-data';
import type { CreativeAsset } from './types';

let assets = [...mockCreativeAssets];

export async function getCreativeAssets() {
  return mockResponse<CreativeAsset[]>([...assets]);
}

export async function deleteCreativeAsset(id: string) {
  assets = assets.filter((a) => a.id !== id);
  return mockResponse(null);
}

export interface UploadRequest {
  name: string;
  type: string;
  format: string;
  fileSize: number;
  dimensions: string;
  uploadTime: string;
}

export async function batchUploadCreativeAssets(items: UploadRequest[]) {
  const newAssets: CreativeAsset[] = items.map((item, i) => ({
    id: `CR${String(Date.now()).slice(-6)}${i}`,
    name: item.name,
    type: item.type as 'image' | 'video',
    category: item.type === 'image' ? '图片素材' : '视频素材',
    size: item.dimensions || '-',
    format: item.format.toUpperCase(),
    sizeValue: item.fileSize,
    usedIn: [],
    status: 'active' as const,
    createdAt: item.uploadTime,
    creator: '当前用户',
  }));
  assets = [...newAssets, ...assets];
  return mockResponse<CreativeAsset[]>(newAssets);
}
